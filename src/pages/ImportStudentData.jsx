import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

export default function ImportStudentData() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const importStudents = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      setResult(null);

      // قراءة ملف Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // قراءة جميع الشيتات
      const students = [];
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        students.push(...sheetData);
      });
      
      if (students.length === 0) {
        throw new Error('لم يتم العثور على بيانات في الملف');
      }

      // ⚠️ STRICT COLUMN MAPPING ONLY - NO PARSING
      const getColumnValue = (row, columnName) => {
        // قراءة مباشرة من اسم العمود فقط
        if (!(columnName in row)) return '';
        const value = row[columnName];
        if (value === null || value === undefined || value === '') return '';
        return value.toString().trim();
      };

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const rowData of students) {
        try {
          // تجاهل الصفوف الفارغة
          const allValues = Object.values(rowData);
          const hasAnyData = allValues.some(v => v && v.toString().trim());
          if (!hasAnyData) {
            continue;
          }

          // ✅ STRICT MAPPING - READ AS-IS
          const studentId = getColumnValue(rowData, 'UserID');
          const schoolCode = getColumnValue(rowData, 'School code');
          const schoolName = getColumnValue(rowData, 'School name');
          const ministryCode = getColumnValue(rowData, 'School code (وزاري)');
          const nationalId = getColumnValue(rowData, 'Identification');
          
          // ⚠️ NO NAME PARSING - READ EACH COLUMN AS RAW STRING
          const firstName = getColumnValue(rowData, 'First name');
          const secondName = getColumnValue(rowData, 'Second name');
          const thirdName = getColumnValue(rowData, 'Third name');
          const familyName = getColumnValue(rowData, 'Family name');

          // ❌ ABORT IF NAME NORMALIZATION DETECTED
          if (!firstName && !secondName && !thirdName && !familyName) {
            throw new Error('⚠️ Name parsing is disabled. Use strict column mapping only.');
          }

          // ✅ SIMPLE CONCATENATION ONLY (NO ANALYSIS)
          const fullName = [firstName, secondName, thirdName, familyName]
            .filter(n => n)
            .join(' ')
            .trim();

          if (!fullName) {
            throw new Error('الاسم الكامل مطلوب');
          }

          // ✅ VALIDATION RULES
          if (schoolName && !isNaN(schoolName)) {
            throw new Error('اسم المدرسة لا يجب أن يكون رقمي');
          }

          // إنشاء سجل الطالب بدون أي تعديل
          const studentRecord = {
            student_id: studentId || `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            school_code: schoolCode,
            school_name: schoolName,
            ministry_school_code: ministryCode,
            national_id: nationalId,
            first_name: firstName,
            second_name: secondName,
            third_name: thirdName,
            family_name: familyName,
            full_name: fullName,
            behavior_score: 80,
            attendance_score: 100,
            distinguished_score: 0,
            grade_level: 'متوسط',
            grade_class: 1,
            class_division: 'أ'
          };

          await base44.entities.Student.create(studentRecord);
          results.success++;
        } catch (error) {
          results.failed++;
          
          let studentIdentifier = 'غير معروف';
          const allValues = Object.values(rowData);
          
          for (let i = 0; i < Math.min(7, allValues.length); i++) {
            const value = allValues[i];
            if (value && value.toString().trim()) {
              studentIdentifier = value.toString().substring(0, 50);
              break;
            }
          }
          
          results.errors.push({
            student: studentIdentifier,
            error: error.message
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      setUploading(false);
      setResult(results);
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      setUploading(false);
      setResult({
        success: 0,
        failed: 0,
        error: error.message
      });
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = () => {
    if (!file) {
      alert('الرجاء اختيار ملف Excel');
      return;
    }
    importStudents.mutate(file);
  };

  const downloadSampleFile = () => {
    const sampleData = [
      ['UserID', 'School code', 'School name', 'School code (وزاري)', 'Identification', 'First name', 'Second name', 'Third name', 'Family name'],
      ['13515195', '53480', 'مدرسة النور المتوسطة', '12345', '1008810262', 'علي', 'حيي', 'حيي', 'الصنعاني'],
      ['17305163', '53480', 'مدرسة النور المتوسطة', '12345', '1089491764', 'عبدالرحمن', 'خيري', 'خيري', 'العصوري'],
      ['18519179', '53480', 'مدرسة النور المتوسطة', '12345', '1049581083', 'سلمان', 'سوير', 'سوير', 'البلوي']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'نموذج_بيانات_الطلاب.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">استيراد بيانات الطلاب</h1>
          <p className="text-gray-600 mt-1">استيراد صارم بدون تحليل ذكي</p>
        </div>
        <Button
          onClick={downloadSampleFile}
          variant="outline"
          className="gap-2 bg-green-50 hover:bg-green-100 border-green-300"
        >
          <Download className="w-5 h-5" />
          تحميل ملف نموذجي
        </Button>
      </div>

      {/* STRICT RULES WARNING */}
      <Card className="border-4 border-red-300 bg-red-50">
        <CardHeader className="bg-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            قواعد الاستيراد الصارمة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-red-200">
              <h4 className="font-bold text-red-900 mb-3">✅ المُفعّل فقط:</h4>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>• القراءة المباشرة من أسماء الأعمدة (Header-Based Mapping)</li>
                <li>• القيم تُقرأ كما هي بدون أي تعديل</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-red-200">
              <h4 className="font-bold text-red-900 mb-3">❌ المُعطّل تماماً:</h4>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>• التحليل الذكي (Smart Parsing)</li>
                <li>• تطبيع الأسماء (Name Normalization)</li>
                <li>• تقسيم الأسماء بالذكاء الاصطناعي (AI Name Split)</li>
                <li>• أي معالجة لغوية أو دلالية</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
              <h4 className="font-bold text-yellow-900 mb-3">🟦 تفصيل الأعمدة المطلوبة:</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-yellow-300">
                    <th className="text-right p-2">عمود Excel</th>
                    <th className="text-right p-2">الحقل المستهدف</th>
                    <th className="text-right p-2">القاعدة</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  <tr className="border-b border-yellow-200">
                    <td className="p-2 font-mono">UserID</td>
                    <td className="p-2">رقم الطالب</td>
                    <td className="p-2">مطلوب</td>
                  </tr>
                  <tr className="border-b border-yellow-200">
                    <td className="p-2 font-mono">School code</td>
                    <td className="p-2">معرف المدرسة</td>
                    <td className="p-2">معرف داخلي</td>
                  </tr>
                  <tr className="border-b border-yellow-200">
                    <td className="p-2 font-mono">School name</td>
                    <td className="p-2">اسم المدرسة</td>
                    <td className="p-2">نص فقط</td>
                  </tr>
                  <tr className="border-b border-yellow-200">
                    <td className="p-2 font-mono">School code (وزاري)</td>
                    <td className="p-2">الرقم الوزاري</td>
                    <td className="p-2">رقم وزاري</td>
                  </tr>
                  <tr className="border-b border-yellow-200">
                    <td className="p-2 font-mono">Identification</td>
                    <td className="p-2">رقم الهوية</td>
                    <td className="p-2">كما هو</td>
                  </tr>
                  <tr className="border-b border-yellow-200 bg-green-50">
                    <td className="p-2 font-mono">First name</td>
                    <td className="p-2">الاسم الأول</td>
                    <td className="p-2 font-bold">اسم الطالب فقط</td>
                  </tr>
                  <tr className="border-b border-yellow-200 bg-green-50">
                    <td className="p-2 font-mono">Second name</td>
                    <td className="p-2">اسم الأب</td>
                    <td className="p-2 font-bold">اسم الأب فقط</td>
                  </tr>
                  <tr className="border-b border-yellow-200 bg-green-50">
                    <td className="p-2 font-mono">Third name</td>
                    <td className="p-2">اسم الجد</td>
                    <td className="p-2 font-bold">اسم الجد فقط</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="p-2 font-mono">Family name</td>
                    <td className="p-2">اسم العائلة</td>
                    <td className="p-2 font-bold">اسم العائلة فقط</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>❌ ممنوع:</strong> الدمج، التفكيك، التفسير اللغوي، إضافة أو إزالة "بن" أو "آل"
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader className="bg-emerald-50">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع ملف البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
              <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                اختر ملف Excel
              </label>
              {file && (
                <div className="mt-4 text-gray-700">
                  <p className="font-semibold">الملف المحدد:</p>
                  <p className="text-sm">{file.name}</p>
                </div>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 ml-2" />
                  بدء الاستيراد
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border-4 border-blue-300 shadow-xl">
          <CardHeader className={result.error ? 'bg-red-600' : 'bg-green-600'}>
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              {result.error ? (
                <>
                  <AlertCircle className="w-8 h-8" />
                  ❌ فشل الاستيراد
                </>
              ) : (
                <>
                  <CheckCircle className="w-8 h-8" />
                  ✅ نجح الاستيراد
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {result.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-lg font-bold">
                  {result.error}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-100 border-4 border-green-500 p-8 rounded-lg text-center">
                  <p className="text-6xl font-bold text-green-700 mb-3">{result.success}</p>
                  <p className="text-2xl text-green-800 font-bold">طالب تم استيرادهم بنجاح ✅</p>
                </div>

                {result.failed > 0 && (
                  <>
                    <div className="bg-orange-100 border-4 border-orange-500 p-6 rounded-lg text-center">
                      <p className="text-4xl font-bold text-orange-700 mb-2">{result.failed}</p>
                      <p className="text-xl text-orange-800 font-bold">طالب فشل استيرادهم ⚠️</p>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg max-h-96 overflow-y-auto space-y-3">
                      {result.errors.map((err, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-red-200">
                          <p className="font-bold text-gray-800">الطالب: {err.student}</p>
                          <p className="text-sm text-red-700"><span className="font-semibold">السبب:</span> {err.error}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    تم الاستيراد. يمكنك الآن عرض البيانات في "شؤون الطلاب".
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}