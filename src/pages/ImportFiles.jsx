import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, FileSpreadsheet, FileType, File, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

async function ensureXLSX() {
  if (window.XLSX) return window.XLSX;
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-xlsx="1"]');
    if (existing) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.async = true;
    s.dataset.xlsx = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("فشل تحميل مكتبة قراءة الإكسل"));
    document.head.appendChild(s);
  });
  if (!window.XLSX) throw new Error("لم يتم تحميل XLSX بشكل صحيح");
  return window.XLSX;
}

export default function ImportFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

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
    setStatus('⏳ جاري قراءة الملف...');

    try {
      const fileName = selectedFile.name.toLowerCase();

      // Excel files
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const buf = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error || new Error("تعذر قراءة الملف"));
          reader.onload = () => resolve(reader.result);
          reader.readAsArrayBuffer(selectedFile);
        });

        const XLSX = await ensureXLSX();
        const wb = XLSX.read(buf, { type: "array", raw: true });
        if (!wb.SheetNames?.length) throw new Error("الملف لا يحتوي أي شيت");

        const ws = wb.Sheets[wb.SheetNames[0]];
        const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
        if (!aoa.length) throw new Error("الشيت فارغ");

        const headers = aoa[0].map((h, i) => {
          const t = String(h || '').trim();
          return t || `عمود_${i + 1}`;
        });

        const students = [];
        for (let i = 1; i < aoa.length; i++) {
          const row = aoa[i];
          const obj = {};
          headers.forEach((h, idx) => {
            const val = row[idx];
            if (typeof val === 'number' && val > 999999999) {
              obj[h] = val.toFixed(0);
            } else {
              obj[h] = String(val ?? "").trim();
            }
          });

          const allValues = Object.values(obj).filter(v => v && v !== '');
          if (allValues.length === 0) continue;

          let firstName = '', fatherName = '', grandfatherName = '', familyName = '';
          let fullName = '', studentId = '', nationalId = '';
          let gradeLevel = '', gradeClass = '', classDivision = '';
          let guardianName = '', guardianPhone = '', studentPhone = '';

          for (const [key, value] of Object.entries(obj)) {
            if (!value) continue;
            const k = key.toLowerCase();
            
            if (!firstName && (k.includes('أول') || k.includes('اول') || k.includes('first'))) firstName = value;
            else if (!fatherName && (k.includes('أب') || k.includes('اب') || k.includes('father'))) fatherName = value;
            else if (!grandfatherName && k.includes('جد')) grandfatherName = value;
            else if (!familyName && (k.includes('عائل') || k.includes('family'))) familyName = value;
            else if (!fullName && (k.includes('كامل') || k === 'اسم')) fullName = value;
            else if (!studentId && k.includes('رقم') && k.includes('طالب')) studentId = value;
            else if (!nationalId && k.includes('هوي')) nationalId = value;
            else if (!gradeLevel && k.includes('مرحل')) gradeLevel = value;
            else if (!gradeClass && k.includes('صف')) gradeClass = value;
            else if (!classDivision && k.includes('شعب')) classDivision = value;
            else if (!guardianName && k.includes('ولي')) guardianName = value;
            else if (!guardianPhone && k.includes('جوال') && k.includes('ولي')) guardianPhone = value;
            else if (!studentPhone && k.includes('جوال') && k.includes('طالب')) studentPhone = value;
          }

          if (!fullName) fullName = [firstName, fatherName, grandfatherName, familyName].filter(Boolean).join(' ');

          if (fullName || firstName) {
            students.push({
              student_id: studentId,
              national_id: nationalId,
              full_name: fullName,
              first_name: firstName,
              father_name: fatherName,
              grandfather_name: grandfatherName,
              family_name: familyName,
              grade_level: gradeLevel || 'متوسط',
              grade_class: parseInt(gradeClass) || 1,
              class_division: classDivision,
              guardian_name: guardianName,
              guardian_phone: guardianPhone,
              student_phone: studentPhone
            });
          }
        }

        setExtractedData(students);
        setStatus(`✅ تم قراءة ${students.length} سجل من Excel`);
      }
      // Text/CSV files
      else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(reader.error);
          reader.onload = () => resolve(reader.result);
          reader.readAsText(selectedFile, 'utf-8');
        });

        const lines = text.split('\n').filter(l => l.trim());
        const students = [];
        
        for (const line of lines.slice(1)) {
          const parts = line.split(/[,\t|]/).map(p => p.trim());
          if (parts.length >= 2 && parts[0]) {
            students.push({
              full_name: parts[0],
              student_id: parts[1] || '',
              national_id: parts[2] || '',
              grade_level: parts[3] || 'متوسط',
              grade_class: parseInt(parts[4]) || 1,
              guardian_phone: parts[5] || ''
            });
          }
        }

        setExtractedData(students);
        setStatus(`✅ تم قراءة ${students.length} سجل من Text`);
      }
      // PDF/Word - not supported offline
      else {
        setStatus('⚠️ هذه الصيغة غير مدعومة حالياً. استخدم Excel (.xlsx) أو Text (.txt)');
      }
    } catch (err) {
      console.error(err);
      setStatus(`❌ خطأ: ${err?.message || 'فشل في قراءة الملف'}`);
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
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
                💡 يعمل بدون إنترنت - قراءة محلية للملفات (Excel و Text فقط حالياً)
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
              {loading ? '⏳ جاري القراءة...' : '📂 قراءة الملف محلياً'}
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