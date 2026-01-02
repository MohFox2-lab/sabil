import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ImportStudentData() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const queryClient = useQueryClient();

  const importStudents = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      setResult(null);

      // قراءة الملف مباشرة
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('الملف فارغ أو لا يحتوي على بيانات');
      }

      // قراءة الـ headers من السطر الأول
      const headers = lines[0].split(',').map(h => h.trim());
      
      // تحويل الصفوف إلى objects
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const student = {};
        headers.forEach((header, index) => {
          if (values[index]) {
            student[header] = values[index];
          }
        });
        
        // دمج الأسماء الأربعة لتكوين الاسم الكامل
        if (student['First name'] && student['Family name']) {
          const firstName = student['First name'] || '';
          const secondName = student['Second name'] || '';
          const thirdName = student['Third name'] || '';
          const familyName = student['Family name'] || '';
          student['full_name'] = `${firstName} ${secondName} ${thirdName} ${familyName}`.replace(/\s+/g, ' ').trim();
        }
        
        // تحويل الحقول الوزارية إلى حقول النظام
        if (student['UserID']) student['student_id'] = student['UserID'];
        if (student['Identification']) student['national_id'] = student['Identification'];
        
        if (Object.keys(student).length > 0) {
          students.push(student);
        }
      }
      
      if (students.length === 0) {
        throw new Error('لم يتم العثور على بيانات طلاب في الملف');
      }

      // 3. التحقق من الحقول الإلزامية وإدراج الطلاب
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const studentData of students) {
        try {
          // التحقق من الحقول الإلزامية الوزارية
          const requiredMinistryFields = ['student_id', 'national_id', 'full_name'];
          const missingFields = requiredMinistryFields.filter(field => !studentData[field] || studentData[field].toString().trim() === '');
          
          if (missingFields.length > 0) {
            throw new Error(`حقول مطلوبة ناقصة: ${missingFields.join(', ')}`);
          }

          // إنشاء الطالب مع الحقول المتوفرة
          const studentRecord = {
            student_id: studentData.student_id.toString().trim(),
            full_name: studentData.full_name.toString().trim(),
            national_id: studentData.national_id.toString().trim(),
            behavior_score: 80,
            attendance_score: 100,
            distinguished_score: 0
          };
          
          // إضافة الصف والمرحلة إذا كانت موجودة
          if (studentData.grade_level && studentData.grade_level.toString().trim()) {
            studentRecord.grade_level = studentData.grade_level.toString().trim();
          } else {
            studentRecord.grade_level = 'متوسط'; // افتراضي
          }
          
          if (studentData.grade_class) {
            const gradeClass = typeof studentData.grade_class === 'string' 
              ? parseInt(studentData.grade_class) 
              : studentData.grade_class;
            if (!isNaN(gradeClass) && gradeClass >= 1 && gradeClass <= 12) {
              studentRecord.grade_class = gradeClass;
            } else {
              studentRecord.grade_class = 1;
            }
          } else {
            studentRecord.grade_class = 1; // افتراضي
          }
          
          if (studentData.class_division && studentData.class_division.toString().trim()) {
            studentRecord.class_division = studentData.class_division.toString().trim();
          } else {
            studentRecord.class_division = 'أ'; // افتراضي
          }

          // إضافة الحقول الاختيارية فقط إذا كانت موجودة وغير فارغة
          if (studentData['School code'] && studentData['School code'].toString().trim()) 
            studentRecord.city = studentData['School code'].toString().trim(); // حفظ معرف المدرسة في حقل المدينة مؤقتاً
          if (studentData.nationality && studentData.nationality.toString().trim()) 
            studentRecord.nationality = studentData.nationality.toString().trim();
          if (studentData.birth_date && studentData.birth_date.toString().trim()) 
            studentRecord.birth_date = studentData.birth_date.toString().trim();
          if (studentData.guardian_name && studentData.guardian_name.toString().trim()) 
            studentRecord.guardian_name = studentData.guardian_name.toString().trim();
          if (studentData.guardian_phone && studentData.guardian_phone.toString().trim()) 
            studentRecord.guardian_phone = studentData.guardian_phone.toString().trim();
          if (studentData.guardian_work_phone && studentData.guardian_work_phone.toString().trim()) 
            studentRecord.guardian_work_phone = studentData.guardian_work_phone.toString().trim();
          if (studentData.student_phone && studentData.student_phone.toString().trim()) 
            studentRecord.student_phone = studentData.student_phone.toString().trim();
          if (studentData.residential_address && studentData.residential_address.toString().trim()) 
            studentRecord.residential_address = studentData.residential_address.toString().trim();
          if (studentData.city && studentData.city.toString().trim()) 
            studentRecord.city = studentData.city.toString().trim();
          if (studentData.district && studentData.district.toString().trim()) 
            studentRecord.district = studentData.district.toString().trim();

          await base44.entities.Student.create(studentRecord);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            student: studentData.full_name || studentData.student_id || 'غير معروف',
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
            
            <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-lg mb-4">
              <h5 className="font-bold text-blue-800 mb-3">✅ الحقول الإلزامية من النموذج الوزاري *</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">UserID</span>
                  <p className="text-gray-600 text-xs mt-1">الرقم الطالبي (مثال: 13515195)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">School code</span>
                  <p className="text-gray-600 text-xs mt-1">معرف المدرسة (مثال: 53480)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">Identification</span>
                  <p className="text-gray-600 text-xs mt-1">رقم الهوية (مثال: 1008810262)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">First name</span>
                  <p className="text-gray-600 text-xs mt-1">الاسم الأول (مثال: علي)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">Second name</span>
                  <p className="text-gray-600 text-xs mt-1">اسم الأب (مثال: حيي)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">Third name</span>
                  <p className="text-gray-600 text-xs mt-1">اسم الجد (مثال: حيي)</p>
                </div>
                <div className="bg-white p-3 rounded border border-blue-200">
                  <span className="font-bold text-blue-900">Family name</span>
                  <p className="text-gray-600 text-xs mt-1">اسم العائلة (مثال: الصنعاني)</p>
                </div>
              </div>
              <p className="text-blue-700 font-semibold mt-3 text-sm">
                💡 سيتم دمج الأسماء الأربعة تلقائياً لتكوين الاسم الكامل
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-bold text-gray-700 mb-2">🟢 الحقول الاختيارية (Optional)</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>• المرحلة (grade_level)</div>
                <div>• الصف (grade_class)</div>
                <div>• الشعبة (class_division)</div>
                <div>• الجنسية (nationality)</div>
                <div>• تاريخ الميلاد (birth_date)</div>
                <div>• اسم ولي الأمر (guardian_name)</div>
                <div>• جوال ولي الأمر (guardian_phone)</div>
                <div>• هاتف العمل (guardian_work_phone)</div>
                <div>• جوال الطالب (student_phone)</div>
              </div>
            </div>
            <p className="text-red-600 font-semibold mt-3">* الحقول الإلزامية: UserID + School code + Identification + الأسماء الأربعة</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظات مهمة:</strong>
              <ul className="list-disc mr-6 mt-2 space-y-1">
                <li><strong>النموذج متوافق مع ملف وزارة التعليم</strong></li>
                <li>الاسم الكامل = الاسم الأول + اسم الأب + اسم الجد + اسم العائلة</li>
                <li>الرقم الطالبي (UserID) سيكون رقم الطالب في النظام (student_id)</li>
                <li>رقم الهوية (Identification) سيتم حفظه كـ (national_id)</li>
                <li>معرف المدرسة (School code) ثابت لجميع طلاب نفس المدرسة</li>
                <li>صيغة الملف: Excel (.xlsx, .xls) أو CSV</li>
                <li>إذا لم يتم إدخال الصف والشعبة، سيتم تعيين قيم افتراضية</li>
                <li>سيتم تهيئة الدرجات الافتراضية: سلوك 80، مواظبة 100، تميز 0</li>
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
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
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
        <Card>
          <CardHeader className={result.error ? 'bg-red-50' : 'bg-green-50'}>
            <CardTitle className="flex items-center gap-2">
              {result.error ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  فشل الاستيراد
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  نتائج الاستيراد
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {result.error ? (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-700">{result.success}</p>
                    <p className="text-green-600">تم الاستيراد بنجاح</p>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-700">{result.failed}</p>
                    <p className="text-red-600">فشل الاستيراد</p>
                  </div>
                </div>

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
                              <p className="text-sm text-red-700">
                                <span className="font-semibold">السبب:</span> {err.error}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 font-semibold mb-2">💡 كيفية حل المشكلة:</p>
                      <ul className="text-sm text-blue-700 space-y-1 mr-4">
                        <li>• تأكد من وجود الحقول الإلزامية الخمسة في ملف Excel</li>
                        <li>• تأكد من تطابق أسماء الأعمدة مع الحقول المطلوبة بالضبط</li>
                        <li>• تأكد من عدم ترك الحقول الإلزامية فارغة</li>
                        <li>• تأكد من أن الصف (grade_class) رقم من 1 إلى 12</li>
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