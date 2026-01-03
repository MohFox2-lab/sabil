import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Printer, Mail, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

export default function BehaviorContractTab() {
  const [contractData, setContractData] = useState({
    student_id: '',
    student_name: '',
    grade: '',
    contract_date: new Date().toISOString().split('T')[0],
    violation_description: '',
    contract_terms: `1. ألتزم بالحضور في الوقت المحدد.
2. ألتزم باحترام الجميع وعدم التلفظ بألفاظ غير لائقة.
3. أتعهد بعدم تكرار السلوك المخالف.
4. ألتزم بالتعليمات داخل الفصل.`,
    counselor_notes: '',
    student_signature: '',
    guardian_signature: '',
    counselor_signature: '',
    principal_signature: ''
  });

  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['behavior-contracts'],
    queryFn: async () => {
      try {
        return await base44.entities.BehaviorContract.list();
      } catch (error) {
        return [];
      }
    },
  });

  const saveContract = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.BehaviorContract.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-contracts'] });
      setShowForm(false);
      setContractData({
        student_id: '',
        student_name: '',
        grade: '',
        contract_date: new Date().toISOString().split('T')[0],
        violation_description: '',
        contract_terms: `1. ألتزم بالحضور في الوقت المحدد.
2. ألتزم باحترام الجميع وعدم التلفظ بألفاظ غير لائقة.
3. أتعهد بعدم تكرار السلوك المخالف.
4. ألتزم بالتعليمات داخل الفصل.`,
        counselor_notes: '',
        student_signature: '',
        guardian_signature: '',
        counselor_signature: '',
        principal_signature: ''
      });
      alert('تم حفظ العقد السلوكي بنجاح');
    },
  });

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setContractData({
        ...contractData,
        student_id: studentId,
        student_name: student.full_name,
        grade: `${student.grade_level} - الصف ${student.grade_class} ${student.class_division}`
      });
    }
  };

  const handleSave = () => {
    if (!contractData.student_id || !contractData.violation_description) {
      alert('الرجاء إدخال بيانات الطالب ووصف المخالفة');
      return;
    }
    saveContract.mutate(contractData);
  };

  const handlePrint = () => {
    if (!contractData.student_name || !contractData.violation_description) {
      alert('الرجاء إدخال بيانات الطالب ووصف المخالفة');
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
          .terms-box {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #000;
            min-height: 150px;
            font-size: 14px;
            line-height: 2;
          }
          .signature-table {
            width: 100%;
            margin-top: 60px;
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
          <div class="header-row">
            <div class="logo-section">
              <div class="logo-text">المملكة العربية السعودية</div>
              <div class="logo-text">وزارة التعليم</div>
              <div class="logo-text">الإدارة العامة للتعليم</div>
            </div>
            
            <div class="logo-section">
              <!-- مساحة للشعار -->
            </div>
            
            <div class="logo-section">
              <div class="logo-text">المملكة العربية السعودية</div>
              <div class="logo-text">وزارة التعليم</div>
            </div>
          </div>

          <div class="title">تعهد سلوكي</div>

          <div class="field-row">
            <span class="field-label">أنا الطالب / الطالبة:</span>
            <span class="field-value">${contractData.student_name}</span>
          </div>

          <div class="field-row">
            <span class="field-label">في الصف:</span>
            <span class="field-value">${contractData.grade}</span>
          </div>

          <div class="field-row">
            <span class="field-label">بسبب المخالفة في التاريخ:</span>
            <span class="field-value">${new Date(contractData.contract_date).toLocaleDateString('ar-SA')}</span>
          </div>

          <div class="commitment-text">
            أتعهد بعدم تكرار أو ارتكاب مخالفة سلوكية مشابهة، وإلا فقد تطبق بحقي لائحة السلوك والمواظبة.
          </div>

          <div class="field-row">
            <span class="field-label">المخالفة:</span>
            <span class="field-value">${contractData.violation_description}</span>
          </div>

          <div style="margin: 30px 0;">
            <div style="font-weight: bold; margin-bottom: 10px;">بنود التعهد:</div>
            <div class="terms-box">${contractData.contract_terms.replace(/\n/g, '<br>')}</div>
          </div>

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

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">العقد السلوكي للطالب</h2>
          <p className="text-gray-600 mt-1">اتفاقية مكتوبة لتعديل السلوك ومنع تكرار المخالفات</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <FileText className="w-5 h-5" />
          {showForm ? 'إخفاء النموذج' : 'إنشاء عقد جديد'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle>إنشاء عقد سلوكي جديد</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* بيانات الطالب */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label>اسم الطالب *</Label>
                <Select value={contractData.student_id} onValueChange={handleStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الصف</Label>
                <Input
                  value={contractData.grade}
                  readOnly
                  className="bg-white"
                  placeholder="يتم التعبئة تلقائياً"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ العقد *</Label>
                <Input
                  type="date"
                  value={contractData.contract_date}
                  onChange={(e) => setContractData({...contractData, contract_date: e.target.value})}
                />
              </div>
            </div>

            {/* تفاصيل السلوك */}
            <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
              <Label>وصف المخالفة *</Label>
              <Textarea
                value={contractData.violation_description}
                onChange={(e) => setContractData({...contractData, violation_description: e.target.value})}
                className="h-28 resize-none"
                placeholder="اكتب وصف المخالفة السلوكية التي أدت إلى إنشاء هذا العقد..."
              />
            </div>

            {/* بنود العقد */}
            <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
              <Label>بنود العقد السلوكي *</Label>
              <Textarea
                value={contractData.contract_terms}
                onChange={(e) => setContractData({...contractData, contract_terms: e.target.value})}
                className="h-40 resize-none"
              />
            </div>

            {/* المتابعة */}
            <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
              <Label>ملاحظات ومتابعة المرشد الطلابي</Label>
              <Textarea
                value={contractData.counselor_notes}
                onChange={(e) => setContractData({...contractData, counselor_notes: e.target.value})}
                className="h-24 resize-none"
                placeholder="ملاحظات المتابعة..."
              />
            </div>

            {/* توقيعات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <Label>توقيع الطالب</Label>
                <Input
                  value={contractData.student_signature}
                  onChange={(e) => setContractData({...contractData, student_signature: e.target.value})}
                  placeholder="اسم الطالب"
                />
              </div>
              <div className="space-y-2">
                <Label>توقيع ولي الأمر</Label>
                <Input
                  value={contractData.guardian_signature}
                  onChange={(e) => setContractData({...contractData, guardian_signature: e.target.value})}
                  placeholder="اسم ولي الأمر"
                />
              </div>
              <div className="space-y-2">
                <Label>توقيع المرشد الطلابي</Label>
                <Input
                  value={contractData.counselor_signature}
                  onChange={(e) => setContractData({...contractData, counselor_signature: e.target.value})}
                  placeholder="اسم المرشد"
                />
              </div>
              <div className="space-y-2">
                <Label>توقيع قائد المدرسة</Label>
                <Input
                  value={contractData.principal_signature}
                  onChange={(e) => setContractData({...contractData, principal_signature: e.target.value})}
                  placeholder="اسم القائد"
                />
              </div>
            </div>

            {/* أزرار */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Save className="w-4 h-4" />
                حفظ
              </Button>
              <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 gap-2">
                <Printer className="w-4 h-4" />
                طباعة
              </Button>
              <Button variant="outline" className="gap-2">
                <Mail className="w-4 h-4" />
                إرسال لولي الأمر
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة العقود المحفوظة */}
      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle>العقود السلوكية المسجلة</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contracts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              لا توجد عقود سلوكية مسجلة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-4 font-semibold">#</th>
                    <th className="text-right p-4 font-semibold">اسم الطالب</th>
                    <th className="text-right p-4 font-semibold">الصف</th>
                    <th className="text-right p-4 font-semibold">تاريخ العقد</th>
                    <th className="text-right p-4 font-semibold">وصف المخالفة</th>
                    <th className="text-right p-4 font-semibold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract, idx) => (
                    <tr key={contract.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{idx + 1}</td>
                      <td className="p-4 font-semibold">{contract.student_name}</td>
                      <td className="p-4">{contract.grade}</td>
                      <td className="p-4">{contract.contract_date}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {contract.violation_description?.substring(0, 50)}...
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="ghost" className="text-blue-600">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}