import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Save, RotateCcw, Info, CheckCircle2, Printer, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RegisterIncidentTab() {
  const [formData, setFormData] = useState({
    student_id: '',
    misconduct_type_id: '',
    date: new Date().toISOString().split('T')[0],
    day_of_week: '',
    actions_taken: '',
    notes: '',
    procedure_number: 1
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastIncidentId, setLastIncidentId] = useState(null);

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  const selectedStudent = students.find(s => s.id === formData.student_id);
  const selectedMisconduct = misconductTypes.find(m => m.id === formData.misconduct_type_id);

  const createIncident = useMutation({
    mutationFn: async (data) => {
      const student = students.find(s => s.id === data.student_id);
      const misconduct = misconductTypes.find(m => m.id === data.misconduct_type_id);
      
      const incidentData = {
        ...data,
        student_name: student?.full_name,
        misconduct_title: misconduct?.title,
        degree: misconduct?.degree,
        points_deducted: misconduct?.points_deduction,
        student_id: student?.student_id
      };

      const result = await base44.entities.BehaviorIncident.create(incidentData);

      const newScore = Math.max(0, (student.behavior_score || 80) - misconduct.points_deduction);
      await base44.entities.Student.update(student.id, {
        behavior_score: newScore
      });

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setLastIncidentId(result.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      student_id: '',
      misconduct_type_id: '',
      date: new Date().toISOString().split('T')[0],
      day_of_week: '',
      actions_taken: '',
      notes: '',
      procedure_number: 1
    });
  };

  const printIncidentReport = () => {
    if (!selectedStudent || !selectedMisconduct) {
      alert('الرجاء اختيار الطالب والمخالفة');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تعهد سلوكي</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: 'Traditional Arabic', 'Arial', sans-serif; 
            padding: 0;
            margin: 0;
            line-height: 1.8;
          }
          .container { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px;
            position: relative;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 50px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
          }
          .logo-section {
            text-align: center;
            font-size: 11px;
            line-height: 1.4;
          }
          .logo-text {
            font-weight: bold;
            margin: 3px 0;
          }
          .title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            margin: 40px 0 50px 0;
            text-decoration: underline;
          }
          .field-row {
            margin: 25px 0;
            display: flex;
            align-items: center;
            font-size: 14px;
          }
          .field-label {
            min-width: 150px;
            font-weight: normal;
          }
          .field-value {
            flex: 1;
            border-bottom: 1px dotted #000;
            padding: 0 10px;
            min-height: 25px;
          }
          .commitment-text {
            margin: 40px 0;
            font-size: 14px;
            line-height: 2;
            text-align: justify;
          }
          .signature-table {
            width: 100%;
            margin-top: 80px;
            border-collapse: collapse;
          }
          .signature-table td {
            border: 1px solid #000;
            padding: 15px;
            text-align: center;
            font-size: 13px;
            height: 50px;
          }
          .signature-table th {
            border: 1px solid #000;
            padding: 12px;
            background-color: #f5f5f5;
            font-weight: bold;
            font-size: 13px;
          }
          @media print {
            body { padding: 0; }
            .container { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with logos -->
          <div class="header-row">
            <div class="logo-section">
              <div class="logo-text">المملكة العربية السعودية</div>
              <div class="logo-text">وزارة التعليم</div>
              <div class="logo-text">الإدارة العامة للتعليم</div>
            </div>
            
            <div class="logo-section">
              <!-- مساحة للشعار المركزي -->
            </div>
            
            <div class="logo-section">
              <div class="logo-text">المملكة العربية السعودية</div>
              <div class="logo-text">وزارة التعليم</div>
            </div>
          </div>

          <!-- Title -->
          <div class="title">تعهد سلوكي</div>

          <!-- Student Info -->
          <div class="field-row">
            <span class="field-label">أنا الطالب / الطالبة:</span>
            <span class="field-value">${selectedStudent.full_name}</span>
          </div>

          <div class="field-row">
            <span class="field-label">في الصف:</span>
            <span class="field-value">${selectedStudent.grade_level} - ${selectedStudent.grade_class}${selectedStudent.class_division || ''}</span>
            <span class="field-label" style="margin-right: 30px;">الجوال:</span>
            <span class="field-value" style="max-width: 200px;">${selectedStudent.student_phone || '...................'}</span>
          </div>

          <div class="field-row">
            <span class="field-label">بسبب المخالفة في التاريخ:</span>
            <span class="field-value">${new Date(formData.date).toLocaleDateString('ar-SA')}</span>
          </div>

          <!-- Commitment Text -->
          <div class="commitment-text">
            أتعهد بعدم تكرار أو ارتكاب مخالفة سلوكية مشابهة، وإلا فقد تطبق بحقي لائحة السلوك والمواظبة.
          </div>

          <!-- Violation Details -->
          <div class="field-row">
            <span class="field-label">المخالفة:</span>
            <span class="field-value">${selectedMisconduct.title}</span>
          </div>

          <!-- Signatures Table -->
          <table class="signature-table">
            <thead>
              <tr>
                <th>الطالب/الطالبة</th>
                <th>ولي الأمر</th>
                <th>المرشد الطلابي</th>
                <th>مدير المدرسة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>الاسم:<br><br>التوقيع:</td>
                <td>الاسم:<br><br>التوقيع:</td>
                <td>الاسم:<br><br>التوقيع:</td>
                <td>الاسم:<br><br>التوقيع:</td>
              </tr>
              <tr>
                <td>التاريخ:<br><br></td>
                <td>التاريخ:<br><br></td>
                <td>التاريخ:<br><br></td>
                <td>التاريخ:<br><br></td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createIncident.mutate(formData);
  };

  const newBehaviorScore = selectedStudent && selectedMisconduct
    ? Math.max(0, (selectedStudent.behavior_score || 80) - selectedMisconduct.points_deduction)
    : null;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <p className="font-semibold text-green-800">تم تسجيل المخالفة بنجاح وتحديث رصيد الطالب</p>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">تنبيه</p>
            <p>سيتم حسم النقاط تلقائياً من رصيد السلوك الإيجابي للطالب عند تسجيل المخالفة</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-lg border-2 border-red-200">
        <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-6 h-6" />
            نموذج تسجيل مخالفة سلوكية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label className="text-base font-bold">الطالب *</Label>
              <Select
                required
                value={formData.student_id}
                onValueChange={(value) => setFormData({...formData, student_id: value})}
              >
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - {student.grade_level} {student.grade_class}{student.class_division} - رصيد السلوك: {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Misconduct Type Selection */}
            <div className="space-y-2">
              <Label className="text-base font-bold">نوع المخالفة *</Label>
              <Select
                required
                value={formData.misconduct_type_id}
                onValueChange={(value) => setFormData({...formData, misconduct_type_id: value})}
              >
                <SelectTrigger className="text-lg">
                  <SelectValue placeholder="اختر المخالفة" />
                </SelectTrigger>
                <SelectContent>
                  {misconductTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.title} - الدرجة {type.degree} (حسم {type.points_deduction} درجة)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview of selected misconduct */}
            {selectedMisconduct && (
              <Card className="bg-amber-50 border-2 border-amber-200">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        selectedMisconduct.degree <= 2 ? 'bg-blue-600' :
                        selectedMisconduct.degree === 3 ? 'bg-yellow-600' :
                        selectedMisconduct.degree === 4 ? 'bg-orange-600' :
                        'bg-red-600'
                      }>
                        الدرجة {['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'][selectedMisconduct.degree - 1]}
                      </Badge>
                      <span className="font-bold text-red-600">- {selectedMisconduct.points_deduction} درجة</span>
                    </div>
                    {selectedMisconduct.description && (
                      <p className="text-sm text-gray-700">{selectedMisconduct.description}</p>
                    )}
                    {selectedMisconduct.actions_default && (
                      <div className="text-sm">
                        <p className="font-semibold text-gray-700">الإجراءات الافتراضية:</p>
                        <p className="text-gray-600">{selectedMisconduct.actions_default}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date and Procedure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-bold">التاريخ *</Label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                    const dayName = days[date.getDay()];
                    setFormData({...formData, date: e.target.value, day_of_week: dayName});
                  }}
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-bold">اليوم</Label>
                <Input
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                  placeholder="يتم تعبئته تلقائياً"
                  className="text-lg bg-gray-50"
                  readOnly
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-base font-bold">رقم الإجراء *</Label>
                <Select
                  value={formData.procedure_number.toString()}
                  onValueChange={(value) => setFormData({...formData, procedure_number: parseInt(value)})}
                >
                  <SelectTrigger className="text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">الإجراء الأول</SelectItem>
                    <SelectItem value="2">الإجراء الثاني</SelectItem>
                    <SelectItem value="3">الإجراء الثالث</SelectItem>
                    <SelectItem value="4">الإجراء الرابع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions Taken */}
            <div className="space-y-2">
              <Label className="text-base font-bold">الإجراءات المتخذة</Label>
              <Textarea
                value={formData.actions_taken}
                onChange={(e) => setFormData({...formData, actions_taken: e.target.value})}
                placeholder="اذكر الإجراءات التربوية التي تم اتخاذها مع الطالب..."
                rows={4}
                className="text-base"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-base font-bold">ملاحظات إضافية</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="أي ملاحظات أو تفاصيل إضافية..."
                rows={3}
                className="text-base"
              />
            </div>

            {/* Score Preview */}
            {selectedStudent && selectedMisconduct && (
              <Card className="bg-blue-50 border-2 border-blue-300">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الرصيد الحالي</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {(selectedStudent.behavior_score || 0) + (selectedStudent.distinguished_score || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">سيُحسم</p>
                      <p className="text-3xl font-bold text-red-600">
                        -{selectedMisconduct.points_deduction}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">الرصيد بعد الحسم</p>
                      <p className={`text-3xl font-bold ${
                        newBehaviorScore >= 70 ? 'text-green-600' : 
                        newBehaviorScore >= 50 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {newBehaviorScore + (selectedStudent.distinguished_score || 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة تعيين
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={printIncidentReport}
                disabled={!formData.student_id || !formData.misconduct_type_id}
                className="flex-1"
              >
                <Printer className="w-4 h-4 ml-2" />
                معاينة المحضر
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-lg py-6"
                disabled={!formData.student_id || !formData.misconduct_type_id}
              >
                <Save className="w-5 h-5 ml-2" />
                تسجيل المخالفة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}