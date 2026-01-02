import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

      // 1. رفع الملف
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // 2. استخراج البيانات
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            students: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  student_id: { type: 'string' },
                  full_name: { type: 'string' },
                  grade_level: { type: 'string' },
                  grade_class: { type: 'number' },
                  class_division: { type: 'string' },
                  national_id: { type: 'string' },
                  nationality: { type: 'string' },
                  birth_date: { type: 'string' },
                  guardian_name: { type: 'string' },
                  guardian_phone: { type: 'string' },
                  guardian_work_phone: { type: 'string' },
                  student_phone: { type: 'string' },
                  residential_address: { type: 'string' },
                  city: { type: 'string' },
                  district: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (extractResult.status !== 'success') {
        throw new Error(extractResult.details || 'فشل استخراج البيانات');
      }

      const students = extractResult.output?.students || [];
      
      if (students.length === 0) {
        throw new Error('لم يتم العثور على بيانات طلاب في الملف');
      }

      // 3. إدراج الطلاب
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (const studentData of students) {
        try {
          await base44.entities.Student.create({
            ...studentData,
            behavior_score: 80,
            attendance_score: 100,
            distinguished_score: 0
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            student: studentData.full_name || studentData.student_id,
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

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">تحميل بيانات الطلاب (بيانات أساسية)</h1>
        <p className="text-gray-600 mt-1">استيراد البيانات الأساسية للطلاب من ملف Excel</p>
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
            <h4 className="font-bold mb-2">الحقول المطلوبة في ملف Excel:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div>• رقم الطالب (student_id) *</div>
              <div>• الاسم الكامل (full_name) *</div>
              <div>• المرحلة (grade_level) *</div>
              <div>• الصف (grade_class) *</div>
              <div>• الشعبة (class_division)</div>
              <div>• رقم الهوية (national_id)</div>
              <div>• الجنسية (nationality)</div>
              <div>• تاريخ الميلاد (birth_date)</div>
              <div>• اسم ولي الأمر (guardian_name)</div>
              <div>• جوال ولي الأمر (guardian_phone)</div>
              <div>• هاتف العمل (guardian_work_phone)</div>
              <div>• جوال الطالب (student_phone)</div>
              <div>• العنوان (residential_address)</div>
              <div>• المدينة (city)</div>
              <div>• الحي (district)</div>
            </div>
            <p className="text-blue-600 font-semibold mt-3">* الحقول الإلزامية</p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>ملاحظات مهمة:</strong>
              <ul className="list-disc mr-6 mt-2 space-y-1">
                <li>المرحلة يجب أن تكون: ابتدائي أو متوسط أو ثانوي</li>
                <li>الصف يجب أن يكون رقم من 1 إلى 12</li>
                <li>صيغة الملف: Excel (.xlsx, .xls) أو CSV</li>
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
                    <h4 className="font-bold mb-2 text-red-700">الأخطاء:</h4>
                    <div className="bg-red-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {result.errors.map((err, idx) => (
                        <div key={idx} className="text-sm mb-2 border-b border-red-200 pb-2">
                          <span className="font-semibold">{err.student}:</span> {err.error}
                        </div>
                      ))}
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