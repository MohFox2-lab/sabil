import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, FileSpreadsheet, FileType, File, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ImportFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const getFileIcon = (type) => {
    if (type?.includes('sheet') || type?.includes('excel')) return FileSpreadsheet;
    if (type?.includes('word') || type?.includes('document')) return FileType;
    if (type?.includes('pdf')) return File;
    return FileText;
  };

  const getFileTypeLabel = (type) => {
    if (type?.includes('sheet') || type?.includes('excel')) return 'Excel';
    if (type?.includes('word') || type?.includes('document')) return 'Word/DOCX';
    if (type?.includes('pdf')) return 'PDF';
    if (type?.includes('text')) return 'Text';
    return 'Unknown';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type || 'application/octet-stream',
      lastModified: new Date(file.lastModified).toLocaleString('ar-SA')
    });
    setExtractedData(null);
    setStatus('');
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) {
      setStatus('❌ الرجاء اختيار ملف أولاً');
      return;
    }

    setLoading(true);
    setStatus('⏳ جاري رفع الملف واستخراج البيانات...');

    try {
      // Step 1: Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      // Step 2: Define expected schema for student data
      const schema = {
        type: "object",
        properties: {
          students: {
            type: "array",
            items: {
              type: "object",
              properties: {
                student_id: { type: "string" },
                national_id: { type: "string" },
                full_name: { type: "string" },
                first_name: { type: "string" },
                father_name: { type: "string" },
                grandfather_name: { type: "string" },
                family_name: { type: "string" },
                grade_level: { type: "string" },
                grade_class: { type: "number" },
                class_division: { type: "string" },
                guardian_name: { type: "string" },
                guardian_phone: { type: "string" },
                student_phone: { type: "string" }
              }
            }
          }
        }
      };

      // Step 3: Extract data using AI
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: schema
      });

      if (result.status === 'success' && result.output?.students) {
        setExtractedData(result.output.students);
        setStatus(`✅ تم استخراج ${result.output.students.length} سجل بنجاح`);
      } else {
        setStatus(`❌ فشل الاستخراج: ${result.details || 'خطأ غير معروف'}`);
      }
    } catch (err) {
      console.error(err);
      setStatus(`❌ خطأ: ${err?.message || 'فشل في معالجة الملف'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!extractedData || extractedData.length === 0) {
      alert('لا توجد بيانات لحفظها');
      return;
    }

    if (!confirm(`هل تريد حفظ ${extractedData.length} طالب في قاعدة البيانات؟`)) return;

    setLoading(true);
    setStatus('⏳ جاري حفظ البيانات...');

    try {
      let success = 0;
      let failed = 0;

      for (const student of extractedData) {
        try {
          const studentData = {
            student_id: student.student_id || '',
            national_id: student.national_id || '',
            full_name: student.full_name || `${student.first_name || ''} ${student.father_name || ''} ${student.grandfather_name || ''} ${student.family_name || ''}`.trim(),
            first_name: student.first_name || '',
            father_name: student.father_name || '',
            grandfather_name: student.grandfather_name || '',
            family_name: student.family_name || '',
            grade_level: student.grade_level || 'متوسط',
            grade_class: student.grade_class || 1,
            class_division: student.class_division || '',
            guardian_name: student.guardian_name || '',
            guardian_phone: student.guardian_phone || '',
            student_phone: student.student_phone || '',
            nationality: 'سعودي',
            behavior_score: 80,
            attendance_score: 100
          };

          if (studentData.full_name) {
            await base44.entities.Student.create(studentData);
            success++;
          } else {
            failed++;
          }
        } catch (err) {
          failed++;
          console.error('خطأ في حفظ السجل:', err);
        }
      }

      setStatus(`✅ تم الحفظ: ${success} نجح | ${failed} فشل`);
    } catch (err) {
      console.error(err);
      setStatus(`❌ فشل الحفظ: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!extractedData) return;
    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_data_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">استيراد الملفات</h1>
        <p className="text-gray-600 mt-1">استيراد بيانات الطلاب من ملفات Excel، Word، PDF، أو Text باستخدام الذكاء الاصطناعي</p>
      </div>

      {/* Supported Formats */}
      <Card className="bg-gradient-to-l from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-blue-900 mb-2">الصيغ المدعومة:</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-600">Excel (.xlsx, .xls)</Badge>
                <Badge className="bg-blue-600">Word (.docx, .doc)</Badge>
                <Badge className="bg-red-600">PDF (.pdf)</Badge>
                <Badge className="bg-gray-600">Text (.txt, .csv)</Badge>
              </div>
              <p className="text-sm text-blue-800 mt-2">
                💡 سيتم استخدام الذكاء الاصطناعي لاستخراج بيانات الطلاب تلقائياً من الملف
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            رفع الملف
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors">
            <label className="cursor-pointer text-center w-full">
              <input
                type="file"
                accept=".xlsx,.xls,.docx,.doc,.pdf,.txt,.csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={loading}
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-700 mb-1">
                اضغط هنا لاختيار ملف
              </p>
              <p className="text-sm text-gray-500">
                أو اسحب الملف وأفلته هنا
              </p>
            </label>
          </div>

          {fileInfo && (
            <Card className="bg-blue-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {React.createElement(getFileIcon(fileInfo.type), { className: "w-8 h-8 text-blue-600 flex-shrink-0" })}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{fileInfo.name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-700">
                      <span>📦 الحجم: {fileInfo.size}</span>
                      <span>📄 النوع: {getFileTypeLabel(fileInfo.type)}</span>
                      <span>🕐 آخر تعديل: {fileInfo.lastModified}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleUploadAndExtract}
              disabled={!selectedFile || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {loading ? '⏳ جاري المعالجة...' : '🤖 استخراج البيانات بالذكاء الاصطناعي'}
            </Button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg border-2 ${
              status.startsWith('✅') ? 'bg-green-50 border-green-200' :
              status.startsWith('❌') ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <p className="font-semibold">{status}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracted Data Preview */}
      {extractedData && extractedData.length > 0 && (
        <Card className="border-2 border-green-300">
          <CardHeader className="bg-gradient-to-l from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              البيانات المستخرجة ({extractedData.length} سجل)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={handleSaveToDatabase}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                💾 حفظ في قاعدة البيانات
              </Button>
              <Button
                onClick={downloadJSON}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                تنزيل JSON
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full min-w-max">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-right font-bold text-sm">#</th>
                    <th className="p-3 text-right font-bold text-sm">رقم الطالب</th>
                    <th className="p-3 text-right font-bold text-sm">رقم الهوية</th>
                    <th className="p-3 text-right font-bold text-sm">الاسم الكامل</th>
                    <th className="p-3 text-right font-bold text-sm">المرحلة</th>
                    <th className="p-3 text-right font-bold text-sm">الصف</th>
                    <th className="p-3 text-right font-bold text-sm">ولي الأمر</th>
                    <th className="p-3 text-right font-bold text-sm">رقم الجوال</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedData.map((student, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">{idx + 1}</td>
                      <td className="p-3 text-sm">{student.student_id || '-'}</td>
                      <td className="p-3 text-sm">{student.national_id || '-'}</td>
                      <td className="p-3 text-sm font-medium">
                        {student.full_name || `${student.first_name || ''} ${student.father_name || ''} ${student.grandfather_name || ''} ${student.family_name || ''}`.trim() || '-'}
                      </td>
                      <td className="p-3 text-sm">{student.grade_level || '-'}</td>
                      <td className="p-3 text-sm">{student.grade_class || '-'}{student.class_division || ''}</td>
                      <td className="p-3 text-sm">{student.guardian_name || '-'}</td>
                      <td className="p-3 text-sm">{student.guardian_phone || student.student_phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}