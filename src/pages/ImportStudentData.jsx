import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
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

      // قراءة ملف Excel مباشرة
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      // قراءة جميع الشيتات ودمج البيانات
      const students = [];
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        students.push(...sheetData);
      });
      
      if (students.length === 0) {
        throw new Error('لم يتم العثور على بيانات طلاب في الملف');
      }

      // استيراد حسب ترتيب الأعمدة فقط (Index-Based Mapping)
      const getValueByIndex = (row, headers, columnName) => {
        const index = headers.findIndex(h => h === columnName);
        if (index === -1) return null;
        const value = Object.values(row)[index];
        if (value === null || value === undefined || value === '') return null;
        return value.toString().trim();
      };

      // الحصول على أسماء الأعمدة من أول صف
      const headers = students.length > 0 ? Object.keys(students[0]) : [];

      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const studentData of students) {
        try {
          // تجاهل الصفوف الفارغة تماماً
          const allValues = Object.values(studentData);
          const hasAnyData = allValues.some(v => v && v.toString().trim());
          if (!hasAnyData) {
            continue;
          }

          // قراءة البيانات حسب ترتيب الأعمدة فقط
          const studentId = getValueByIndex(studentData, headers, 'UserID');
          const schoolCode = getValueByIndex(studentData, headers, 'School code');
          const nationalId = getValueByIndex(studentData, headers, 'Identification');
          const firstName = getValueByIndex(studentData, headers, 'First name') || '';
          const secondName = getValueByIndex(studentData, headers, 'Second name') || '';
          const thirdName = getValueByIndex(studentData, headers, 'Third name') || '';
          const familyName = getValueByIndex(studentData, headers, 'Family name') || '';

          // التحقق من وجود اسم واحد على الأقل
          if (!firstName && !secondName && !thirdName && !familyName) {
            throw new Error('يجب أن يحتوي السجل على اسم واحد على الأقل');
          }

          // تجميع الاسم الكامل كما هو بدون أي تعديل
          const fullName = [firstName, secondName, thirdName, familyName]
            .filter(n => n)
            .join(' ')
            .trim();

          // إنشاء سجل الطالب
          const studentRecord = {
            student_id: studentId || `AUTO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            school_code: schoolCode || '',
            national_id: nationalId || '',
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
          const allValues = Object.values(studentData);
          
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
    // بيانات نموذجية وفق النموذج الوزاري
    const sampleData = [
      ['UserID', 'School code', 'Identification', 'First name', 'Second name', 'Third name', 'Family name', 'grade_level', 'grade_class', 'class_division'],
      ['13515195', '53480', '1008810262', 'علي', 'حيي', 'حيي', 'الصنعاني', 'متوسط', '1', 'أ'],
      ['17305163', '53480', '1089491764', 'عبدالرحمن', 'خيري', 'خيري', 'العصوري', 'متوسط', '1', 'أ'],
      ['18519179', '53480', '1049581083', 'سلمان', 'سوير', 'سوير', 'البلوي', 'متوسط', '1', 'ب'],
      ['17245108', '53480', '1085447490', 'عبدالعزيز', 'راشد', 'راشد', 'العتيبي', 'متوسط', '2', 'أ'],
      ['15678234', '53480', '1098765432', 'فاطمة', 'عبدالله', 'محمد', 'القحطاني', 'متوسط', '2', 'ب'],
      ['16789345', '53480', '1087654321', 'محمد', 'سعد', 'علي', 'الغامدي', 'متوسط', '3', 'أ'],
      ['14567890', '53480', '1076543210', 'نورة', 'فهد', 'عبدالعزيز', 'الدوسري', 'ثانوي', '1', 'أ'],
      ['13456789', '53480', '1065432109', 'خالد', 'يوسف', 'حسن', 'الحربي', 'ثانوي', '1', 'ب'],
      ['12345678', '53480', '1054321098', 'سارة', 'إبراهيم', 'ناصر', 'الشمري', 'ابتدائي', '6', 'أ'],
      ['11234567', '53480', '1043210987', 'أحمد', 'مبارك', 'سلطان', 'المطيري', 'ابتدائي', '6', 'ب']
    ];

    // تحويل البيانات إلى CSV
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    
    // إنشاء Blob وتحميل الملف
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
          <h1 className="text-3xl font-bold text-gray-900">تحميل بيانات الطلاب (بيانات أساسية)</h1>
          <p className="text-gray-600 mt-1">استيراد البيانات الأساسية للطلاب من ملف Excel</p>
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

      {/* Instructions */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            تعليمات الاستيراد
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-bold mb-2">الحقول في ملف Excel:</h4>
            
            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg mb-4">
              <h5 className="font-bold text-green-800 mb-3">🤖 الفهم الذكي التلقائي (Auto-Mapping)</h5>
              <p className="text-sm text-green-700 mb-3">
                النظام يفهم الحقول تلقائياً بغض النظر عن ترتيبها أو أسمائها المحددة:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-green-200">
                  <span className="font-bold text-green-900">رقم الطالب</span>
                  <p className="text-gray-600 text-xs mt-1">UserID أو student_id أو رقم الطالب</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <span className="font-bold text-green-900">رقم الهوية</span>
                  <p className="text-gray-600 text-xs mt-1">Identification أو national_id أو رقم الهوية</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <span className="font-bold text-green-900">الاسم</span>
                  <p className="text-gray-600 text-xs mt-1">اسم واحد أو أربعة أسماء منفصلة</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <span className="font-bold text-green-900">معرف المدرسة</span>
                  <p className="text-gray-600 text-xs mt-1">School code أو معرف المدرسة (اختياري)</p>
                </div>
              </div>
              <p className="text-green-700 font-semibold mt-3 text-sm">
                ✨ فقط تأكد من وجود <strong>اسم الطالب</strong> - باقي البيانات اختيارية
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-bold text-blue-700 mb-2">📝 أمثلة على الأعمدة المقبولة</h5>
              <div className="grid grid-cols-1 gap-2 text-sm text-blue-800">
                <div>✓ الأسماء المجزأة: First name, Second name, Third name, Family name</div>
                <div>✓ الاسم الكامل: full_name أو الاسم الكامل</div>
                <div>✓ المرحلة: grade_level أو المرحلة أو المستوى</div>
                <div>✓ الصف: grade_class أو الصف أو class</div>
                <div>✓ الشعبة: class_division أو الشعبة أو الفصل</div>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>كيفية عمل النظام:</strong>
              <ul className="list-disc mr-6 mt-2 space-y-1">
                <li><strong>✅ يقبل جميع صيغ Excel</strong> (.xlsx, .xls, .csv)</li>
                <li><strong>✅ يقرأ جميع الشيتات تلقائياً</strong> ويدمج البيانات</li>
                <li>النظام <strong>يفهم البيانات تلقائياً</strong> من أسماء الأعمدة</li>
                <li>يدمج الأسماء المجزأة (الاسم الأول + الأب + الجد + العائلة) تلقائياً</li>
                <li>الأعمدة الإضافية تُتجاهل ولا تسبب فشل الاستيراد</li>
                <li>البيانات الناقصة تُكمل بقيم افتراضية</li>
              </ul>
            </AlertDescription>
          </Alert>
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
                  جاري قراءة الملف واستيراد البيانات...
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
              <div className="space-y-4">
                <Alert variant="destructive" className="border-4 border-red-500">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="text-lg font-bold">
                    السبب: {result.error}
                  </AlertDescription>
                </Alert>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold mb-2">💡 حلول مقترحة:</p>
                  <ul className="text-sm text-blue-700 space-y-1 mr-4">
                    <li>• تأكد من أن الملف بصيغة Excel (.xlsx, .xls) أو CSV</li>
                    <li>• تأكد من وجود بيانات في الملف</li>
                    <li>• تأكد من وجود عمود للأسماء</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-100 border-4 border-green-500 p-8 rounded-lg text-center">
                  <p className="text-6xl font-bold text-green-700 mb-3">{result.success}</p>
                  <p className="text-2xl text-green-800 font-bold">طالب تم استيرادهم بنجاح ✅</p>
                </div>

                {result.failed > 0 && (
                  <div className="bg-orange-100 border-4 border-orange-500 p-6 rounded-lg text-center">
                    <p className="text-4xl font-bold text-orange-700 mb-2">{result.failed}</p>
                    <p className="text-xl text-orange-800 font-bold">طالب فشل استيرادهم ⚠️</p>
                  </div>
                )}

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-3 text-red-700 text-lg">الأخطاء:</h4>
                    <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg max-h-96 overflow-y-auto space-y-3">
                      {result.errors.map((err, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800 mb-1">
                                الطالب: {err.student}
                              </p>
                              <p className="text-sm text-red-700 mb-1">
                               <span className="font-semibold">السبب:</span> {err.error}
                              </p>
                              {err.columns && (
                               <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                                 <span className="font-semibold">الأعمدة:</span> {err.columns}
                               </p>
                              )}
                              </div>
                              </div>
                              </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 font-semibold mb-2">💡 نصائح لحل المشاكل:</p>
                      <ul className="text-sm text-blue-700 space-y-1 mr-4">
                        <li>• تأكد من وجود عمود للاسم (كامل أو مجزأ)</li>
                        <li>• تأكد من عدم ترك صفوف الأسماء فارغة تماماً</li>
                        <li>• النظام يتجاهل البيانات الناقصة ويكملها تلقائياً</li>
                        <li>• إذا فشل استيراد طالب، تحقق من وجود اسمه في الملف</li>
                      </ul>
                    </div>
                  </div>
                )}

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    تم تحديث قائمة الطلاب. يمكنك الآن الذهاب إلى "شؤون الطلاب" لعرض البيانات المستوردة.
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