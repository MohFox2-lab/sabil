import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Download,
  Columns,
  Eye,
  Database
} from 'lucide-react';

const STUDENT_ATTRIBUTES = [
  { value: 'student_id', label: 'رقم الطالب *', required: true },
  { value: 'national_id', label: 'رقم الهوية/الإقامة' },
  { value: 'full_name', label: 'الاسم الكامل *', required: true },
  { value: 'nationality', label: 'الجنسية' },
  { value: 'birth_date', label: 'تاريخ الميلاد' },
  { value: 'place_of_birth', label: 'مكان الميلاد' },
  { value: 'school_code', label: 'معرف المدرسة' },
  { value: 'school_name', label: 'اسم المدرسة' },
  { value: 'school_code_ministry', label: 'الرقم الوزاري' },
  { value: 'grade_level', label: 'المرحلة *', required: true },
  { value: 'grade_class', label: 'الصف *', required: true },
  { value: 'class_division', label: 'الشعبة' },
  { value: 'residential_address', label: 'عنوان السكن' },
  { value: 'city', label: 'المدينة' },
  { value: 'district', label: 'الحي' },
  { value: 'guardian_name', label: 'اسم ولي الأمر' },
  { value: 'guardian_phone', label: 'جوال ولي الأمر' },
  { value: 'guardian_work_phone', label: 'هاتف عمل ولي الأمر' },
  { value: 'student_phone', label: 'جوال الطالب' },
  { value: 'guardian_email', label: 'بريد ولي الأمر' },
  { value: 'notes', label: 'ملاحظات' },
  { value: 'ignore', label: '--- تجاهل هذا العمود ---' }
];

async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('فشل تحميل مكتبة Excel'));
    document.head.appendChild(s);
  });
  return window.XLSX;
}

function normalizeValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' && val > 999999999) return val.toFixed(0);
  return String(val).trim();
}

export default function ImportWizardTab() {
  const [step, setStep] = useState(1);
  const [fileInfo, setFileInfo] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [excelRows, setExcelRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [importResults, setImportResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const queryClient = useQueryClient();

  // Step 1: File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('فشل قراءة الملف'));
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
      });

      const XLSX = await loadXLSX();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const aoa = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        raw: true
      });

      if (!aoa.length) throw new Error('الملف فارغ');

      const headers = aoa[0].map((h, idx) => {
        const str = normalizeValue(h);
        return str || `عمود_${idx + 1}`;
      });

      const rows = aoa.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = normalizeValue(row[idx] || '');
        });
        return obj;
      });

      setFileInfo({ name: file.name, sheet: sheetName, rowCount: rows.length });
      setExcelHeaders(headers);
      setExcelRows(rows);
      
      // Auto-map obvious columns
      const autoMapping = {};
      headers.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes('رقم الطالب') || lower === 'student_id') autoMapping[h] = 'student_id';
        else if (lower.includes('الاسم') || lower.includes('name')) autoMapping[h] = 'full_name';
        else if (lower.includes('هوية') || lower.includes('national')) autoMapping[h] = 'national_id';
        else if (lower.includes('مدرسة') && lower.includes('معرف')) autoMapping[h] = 'school_code';
        else if (lower.includes('مدرسة') && lower.includes('اسم')) autoMapping[h] = 'school_name';
        else if (lower.includes('وزاري')) autoMapping[h] = 'school_code_ministry';
        else if (lower.includes('مرحلة') || lower.includes('level')) autoMapping[h] = 'grade_level';
        else if (lower.includes('صف') || lower.includes('class')) autoMapping[h] = 'grade_class';
        else if (lower.includes('شعبة') || lower.includes('division')) autoMapping[h] = 'class_division';
        else autoMapping[h] = 'ignore';
      });
      setColumnMapping(autoMapping);

      setStep(2);
    } catch (err) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Step 3: Preview mapped data
  const previewData = useMemo(() => {
    return excelRows.slice(0, 10).map(row => {
      const mapped = {};
      Object.entries(columnMapping).forEach(([excelCol, attr]) => {
        if (attr !== 'ignore') {
          mapped[attr] = row[excelCol];
        }
      });
      return mapped;
    });
  }, [excelRows, columnMapping]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = [];
    const requiredFields = STUDENT_ATTRIBUTES.filter(a => a.required).map(a => a.value);
    const mappedFields = Object.values(columnMapping).filter(v => v !== 'ignore');
    
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        const attr = STUDENT_ATTRIBUTES.find(a => a.value === field);
        errors.push(`الحقل المطلوب "${attr.label}" غير مربوط`);
      }
    });

    return errors;
  }, [columnMapping]);

  // Step 4: Import
  const importMutation = useMutation({
    mutationFn: async () => {
      const results = { success: 0, failed: 0, errors: [] };
      
      for (let i = 0; i < excelRows.length; i++) {
        try {
          const row = excelRows[i];
          const studentData = {};
          
          Object.entries(columnMapping).forEach(([excelCol, attr]) => {
            if (attr !== 'ignore' && row[excelCol]) {
              let value = row[excelCol];
              
              // Type conversions
              if (attr === 'grade_class') {
                value = parseInt(value) || 1;
              } else if (attr === 'grade_level') {
                if (!['ابتدائي', 'متوسط', 'ثانوي'].includes(value)) {
                  value = 'متوسط';
                }
              }
              
              studentData[attr] = value;
            }
          });

          // Set defaults
          if (!studentData.nationality) studentData.nationality = 'سعودي';
          if (!studentData.behavior_score) studentData.behavior_score = 80;
          if (!studentData.attendance_score) studentData.attendance_score = 100;

          await base44.entities.Student.create(studentData);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            data: excelRows[i],
            error: err.message
          });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      setImportResults(results);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setStep(4);
    }
  });

  const handleImport = () => {
    if (validationErrors.length > 0) {
      alert('يوجد حقول مطلوبة غير مربوطة');
      return;
    }
    if (!confirm(`هل تريد استيراد ${excelRows.length} طالب؟`)) return;
    importMutation.mutate();
  };

  const resetWizard = () => {
    setStep(1);
    setFileInfo(null);
    setExcelHeaders([]);
    setExcelRows([]);
    setColumnMapping({});
    setImportResults(null);
  };

  const downloadSample = () => {
    const csv = [
      'رقم الطالب,الاسم الكامل,رقم الهوية,معرف المدرسة,اسم المدرسة,الرقم الوزاري,المرحلة,الصف,الشعبة,المدينة,الحي,جوال ولي الأمر',
      '12345,أحمد محمد علي,1234567890,SCH001,مدرسة النموذج,MIN001,متوسط,7,أ,الرياض,النخيل,0501234567',
      '12346,فاطمة خالد سعد,2345678901,SCH001,مدرسة النموذج,MIN001,متوسط,8,ب,الرياض,الملز,0507654321'
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_students.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step > s ? 'bg-green-600 text-white' : 
                  step === s ? 'bg-blue-600 text-white' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 4 && <div className={`w-24 h-1 mx-2 ${step > s ? 'bg-green-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>1. رفع الملف</span>
            <span className={step >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>2. ربط الأعمدة</span>
            <span className={step >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>3. المراجعة</span>
            <span className={step >= 4 ? 'text-blue-600 font-semibold' : 'text-gray-500'}>4. الاستيراد</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              الخطوة 1: رفع ملف Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-dashed border-blue-300">
                <FileSpreadsheet className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                  <Button asChild size="lg" disabled={isProcessing}>
                    <span className="cursor-pointer">
                      <Upload className="w-5 h-5 ml-2" />
                      {isProcessing ? 'جاري التحميل...' : 'اختر ملف Excel'}
                    </span>
                  </Button>
                </label>
                <p className="text-sm text-gray-600 mt-4">
                  يدعم النظام ملفات .xlsx و .xls
                </p>
              </div>

              <Button variant="outline" onClick={downloadSample} className="gap-2">
                <Download className="w-4 h-4" />
                تحميل ملف نموذجي
              </Button>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>نصائح:</strong>
                  <ul className="list-disc list-inside mt-2 text-right space-y-1">
                    <li>تأكد من أن الصف الأول يحتوي على أسماء الأعمدة</li>
                    <li>احفظ أرقام الهوية كنص لتجنب فقدان الأصفار</li>
                    <li>استخدم الملف النموذجي كمرجع</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Column Mapping */}
      {step === 2 && (
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Columns className="w-5 h-5" />
              الخطوة 2: ربط الأعمدة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                قم بربط أعمدة ملف Excel بحقول النظام. تم الربط التلقائي للأعمدة الواضحة.
              </AlertDescription>
            </Alert>

            {fileInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">الملف: {fileInfo.name}</p>
                <p className="text-sm text-gray-600">عدد الصفوف: {fileInfo.rowCount} | الأعمدة: {excelHeaders.length}</p>
              </div>
            )}

            <div className="grid gap-4">
              {excelHeaders.map(header => (
                <div key={header} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                  <div className="flex-1">
                    <Label className="font-semibold text-blue-600">{header}</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      مثال: {excelRows[0]?.[header] || 'فارغ'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <Select
                      value={columnMapping[header] || 'ignore'}
                      onValueChange={(value) => setColumnMapping({...columnMapping, [header]: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDENT_ATTRIBUTES.map(attr => (
                          <SelectItem key={attr.value} value={attr.value}>
                            {attr.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>حقول مطلوبة غير مربوطة:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                السابق
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={validationErrors.length > 0}
                className="flex-1"
              >
                التالي: المراجعة
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              الخطوة 3: مراجعة البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Alert>
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                معاينة أول 10 سجلات بعد الربط. تأكد من صحة البيانات قبل الاستيراد.
              </AlertDescription>
            </Alert>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">جاهز للاستيراد</p>
                  <p className="text-sm text-gray-600">سيتم استيراد {excelRows.length} طالب</p>
                </div>
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  {excelRows.length} سجل
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    {STUDENT_ATTRIBUTES.filter(a => a.required).map(attr => (
                      <th key={attr.value} className="text-right p-3 font-semibold text-sm border-b">
                        {attr.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      {STUDENT_ATTRIBUTES.filter(a => a.required).map(attr => (
                        <td key={attr.value} className="p-3 text-sm">
                          {row[attr.value] || <span className="text-red-500">غير محدد</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                تعديل الربط
              </Button>
              <Button 
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Database className="w-4 h-4 ml-2" />
                {importMutation.isPending ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && importResults && (
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              اكتمل الاستيراد
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <p className="text-4xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-gray-600 mt-2">تم الاستيراد بنجاح</p>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                <p className="text-4xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-gray-600 mt-2">فشل الاستيراد</p>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>الأخطاء ({importResults.errors.length}):</strong>
                  <div className="max-h-40 overflow-y-auto mt-2">
                    {importResults.errors.slice(0, 10).map((err, idx) => (
                      <div key={idx} className="text-xs border-b py-1">
                        الصف {err.row}: {err.error}
                      </div>
                    ))}
                    {importResults.errors.length > 10 && (
                      <p className="text-xs mt-2">وهناك {importResults.errors.length - 10} خطأ آخر...</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={resetWizard} className="w-full bg-blue-600 hover:bg-blue-700">
              استيراد ملف جديد
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}