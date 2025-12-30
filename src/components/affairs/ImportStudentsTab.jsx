import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ImportStudentsTab() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [importing, setImporting] = useState(false);

  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('');
    }
  };

  const processFile = async () => {
    if (!file) {
      setStatus('الرجاء اختيار ملف أولاً');
      return;
    }

    setImporting(true);
    setStatus('جاري قراءة الملف...');

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      
      let added = 0;
      let skipped = 0;

      for (const line of lines) {
        const parts = line.split(/[\t,;|]/);
        if (parts.length < 2) continue;

        const studentData = {
          full_name: parts[0]?.trim(),
          student_id: parts[1]?.trim(),
          grade_level: parts[2]?.trim() || 'متوسط',
          grade_class: parseInt(parts[3]) || 1,
          class_division: parts[4]?.trim() || 'أ',
          guardian_name: parts[5]?.trim() || '',
          guardian_phone: parts[6]?.trim() || '',
          behavior_score: 80,
          distinguished_score: 0,
          attendance_score: 100
        };

        if (!studentData.full_name || !studentData.student_id) {
          skipped++;
          continue;
        }

        try {
          await base44.entities.Student.create(studentData);
          added++;
        } catch (error) {
          skipped++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['students'] });
      setStatus(`✅ تم الاستيراد بنجاح! تمت إضافة ${added} طالب. تم تجاوز ${skipped} سطر.`);
      setFile(null);
      
    } catch (error) {
      setStatus('❌ خطأ في قراءة الملف. تأكد من صيغة الملف.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `الاسم الكامل,رقم الطالب,المرحلة,الصف,الفصل,ولي الأمر,جوال ولي الأمر
أحمد محمد العتيبي,1234567890,متوسط,7,أ,محمد العتيبي,0501234567
فاطمة عبدالله السالم,0987654321,متوسط,8,ب,عبدالله السالم,0559876543`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'قالب_استيراد_الطلاب.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="bg-gradient-to-l from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <AlertCircle className="w-6 h-6" />
            تعليمات الاستيراد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-semibold">يدعم الاستيراد من:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>ملفات CSV (الأفضل)</li>
            <li>ملفات TXT مفصولة بفاصلة أو Tab</li>
            <li>ملفات Excel بعد حفظها كـ CSV</li>
          </ul>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <p className="font-semibold text-amber-900 mb-2">ترتيب الأعمدة المطلوب:</p>
            <p className="text-xs font-mono text-amber-800">
              الاسم الكامل, رقم الطالب, المرحلة, الصف, الفصل, ولي الأمر, جوال ولي الأمر
            </p>
          </div>

          <Button onClick={downloadTemplate} variant="outline" className="w-full mt-3">
            <Download className="w-4 h-4 ml-2" />
            تحميل قالب الاستيراد (CSV)
          </Button>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Upload className="w-6 h-6" />
            استيراد أسماء الطلاب من ملف
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50">
            <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <Input
              type="file"
              accept=".csv,.txt,.xls,.xlsx"
              onChange={handleFileChange}
              className="max-w-md mx-auto"
            />
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-700">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{file.name}</span>
              </div>
            )}
          </div>

          <Button
            onClick={processFile}
            disabled={!file || importing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 ml-2" />
                بدء الاستيراد
              </>
            )}
          </Button>

          {status && (
            <div className={`p-4 rounded-lg border-2 ${
              status.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' :
              status.includes('❌') ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {status.includes('✅') && <CheckCircle2 className="w-5 h-5" />}
                {status.includes('❌') && <AlertCircle className="w-5 h-5" />}
                <p className="font-semibold">{status}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Example Format */}
      <Card>
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-base">مثال على تنسيق الملف</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>
الاسم الكامل,رقم الطالب,المرحلة,الصف,الفصل,ولي الأمر,جوال ولي الأمر
أحمد محمد العتيبي,1234567890,متوسط,7,أ,محمد العتيبي,0501234567
فاطمة عبدالله السالم,0987654321,متوسط,8,ب,عبدالله السالم,0559876543
خالد سعد القحطاني,1122334455,ابتدائي,6,أ,سعد القحطاني,0505551234
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            💡 نصيحة: يمكنك حفظ ملف Excel كـ CSV من خلال "حفظ باسم" → اختيار "CSV (Comma delimited)"
          </p>
        </CardContent>
      </Card>
    </div>
  );
}