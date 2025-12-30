import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Award, Activity, Printer, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ReportsTab() {
  const [selectedStudentForPrint, setSelectedStudentForPrint] = useState('');
  const [selectedGradeForPrint, setSelectedGradeForPrint] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list(),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  // Print functions
  const printStudentReport = async () => {
    if (!selectedStudentForPrint) {
      alert('اختر الطالب أولاً');
      return;
    }
    
    const student = students.find(s => s.id === selectedStudentForPrint);
    const studentIncidents = incidents.filter(i => i.student_id === student?.student_id);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف مخالفات - ${student?.full_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #333; padding: 8px; text-align: right; font-size: 12px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .info { font-size: 14px; margin: 5px 0; }
          .total { font-weight: bold; font-size: 16px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 16px; color: #0d5d4e; font-weight: bold;">وزارة التعليم - المملكة العربية السعودية</div>
          <div class="title">كشف بمخالفات الطالب</div>
          <div class="info">اسم الطالب: ${student?.full_name}</div>
          <div class="info">رقم الطالب: ${student?.student_id}</div>
          <div class="info">الصف: ${student?.grade_level} - ${student?.grade_class}${student?.class_division}</div>
          <div class="info">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المخالفة السلوكية</th>
              <th>الدرجة</th>
              <th>الخصم</th>
              <th>الإجراءات المتخذة</th>
              <th>الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            ${studentIncidents.map(inc => `
              <tr>
                <td>${new Date(inc.date).toLocaleDateString('ar-SA')}</td>
                <td>${inc.misconduct_title}</td>
                <td>الدرجة ${inc.degree}</td>
                <td>${inc.points_deducted}</td>
                <td>${inc.actions_taken || '-'}</td>
                <td>${inc.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          إجمالي حسم الدرجات: ${studentIncidents.reduce((sum, i) => sum + (i.points_deducted || 0), 0)} من 100
        </div>
        <div class="total">
          رصيد السلوك الحالي: ${(student?.behavior_score || 0) + (student?.distinguished_score || 0)} من 100
        </div>
        
        <div style="margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; font-size: 12px;">
          <div>
            <p>ولي أمر الطالب</p>
            <p style="margin-top: 40px;">التوقيع: ____________________</p>
          </div>
          <div>
            <p>وكيل شؤون الطلاب</p>
            <p style="margin-top: 40px;">التوقيع: ____________________</p>
          </div>
          <div>
            <p>قائد المدرسة</p>
            <p style="margin-top: 40px;">التوقيع: ____________________</p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printScoresReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف رصد درجات السلوك</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
          th, td { border: 1px solid #333; padding: 6px; text-align: right; }
          th { background-color: #0d5d4e; color: white; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 16px; color: #0d5d4e; font-weight: bold;">وزارة التعليم - المملكة العربية السعودية</div>
          <div class="title">كشف رصد درجات السلوك والمواظبة</div>
          <div style="font-size: 14px;">التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>رقم الطالب</th>
              <th>اسم الطالب</th>
              <th>المرحلة</th>
              <th>الصف</th>
              <th>الفصل</th>
              <th>إجمالي الحسم</th>
              <th>السلوك الإيجابي</th>
              <th>السلوك المتميز</th>
              <th>الرصيد الكلي</th>
              <th>المواظبة</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((student, idx) => {
              const totalDeduction = incidents
                .filter(i => i.student_id === student.student_id)
                .reduce((sum, i) => sum + (i.points_deducted || 0), 0);
              const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
              return `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${student.student_id}</td>
                  <td>${student.full_name}</td>
                  <td>${student.grade_level}</td>
                  <td style="text-align: center;">${student.grade_class}</td>
                  <td style="text-align: center;">${student.class_division}</td>
                  <td style="text-align: center; color: red; font-weight: bold;">${totalDeduction}</td>
                  <td style="text-align: center;">${student.behavior_score || 0}</td>
                  <td style="text-align: center;">${student.distinguished_score || 0}</td>
                  <td style="text-align: center; font-weight: bold; color: ${totalScore >= 90 ? 'green' : totalScore >= 70 ? 'orange' : 'red'};">${totalScore}</td>
                  <td style="text-align: center;">${student.attendance_score || 0}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Incidents by degree
  const incidentsByDegree = [1, 2, 3, 4, 5].map(degree => ({
    name: `الدرجة ${degree}`,
    العدد: incidents.filter(i => i.degree === degree).length
  }));

  // Students by behavior score range
  const behaviorDistribution = [
    { name: 'ممتاز (90-100)', العدد: students.filter(s => (s.behavior_score + s.distinguished_score) >= 90).length },
    { name: 'جيد جداً (80-89)', العدد: students.filter(s => {
      const total = s.behavior_score + s.distinguished_score;
      return total >= 80 && total < 90;
    }).length },
    { name: 'جيد (70-79)', العدد: students.filter(s => {
      const total = s.behavior_score + s.distinguished_score;
      return total >= 70 && total < 80;
    }).length },
    { name: 'يحتاج تحسين (أقل من 70)', العدد: students.filter(s => (s.behavior_score + s.distinguished_score) < 70).length }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Most common misconducts
  const misconductCounts = {};
  incidents.forEach(inc => {
    misconductCounts[inc.misconduct_title] = (misconductCounts[inc.misconduct_title] || 0) + 1;
  });
  
  const topMisconducts = Object.entries(misconductCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([title, count]) => ({ المخالفة: title, العدد: count }));

  // Top students
  const topStudents = [...students]
    .sort((a, b) => (b.behavior_score + b.distinguished_score) - (a.behavior_score + a.distinguished_score))
    .slice(0, 10);

  // Students needing attention
  const studentsNeedingAttention = students
    .filter(s => (s.behavior_score + s.distinguished_score) < 70)
    .sort((a, b) => (a.behavior_score + a.distinguished_score) - (b.behavior_score + b.distinguished_score))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Print Options */}
      <Card className="bg-gradient-to-l from-amber-50 to-yellow-50 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Printer className="w-6 h-6" />
            خيارات الطباعة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-bold text-sm">كشف مخالفات طالب</h3>
              <Select value={selectedStudentForPrint} onValueChange={setSelectedStudentForPrint}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} - {s.grade_level} {s.grade_class}{s.class_division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={printStudentReport} className="w-full bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 ml-2" />
                طباعة كشف الطالب
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm">كشف رصد درجات السلوك (جميع الطلاب)</h3>
              <p className="text-xs text-gray-600">
                يتضمن: رصيد السلوك الإيجابي + المتميز + المواظبة لجميع الطلاب
              </p>
              <Button onClick={printScoresReport} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <FileText className="w-4 h-4 ml-2" />
                طباعة كشف الدرجات الشامل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">إجمالي المخالفات</p>
            <p className="text-4xl font-bold">{incidents.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">أنواع المخالفات</p>
            <p className="text-4xl font-bold">{misconductTypes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">متوسط السلوك</p>
            <p className="text-4xl font-bold">
              {students.length > 0 
                ? Math.round(students.reduce((sum, s) => sum + (s.behavior_score || 0) + (s.distinguished_score || 0), 0) / students.length)
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">طلاب متميزون</p>
            <p className="text-4xl font-bold">
              {students.filter(s => (s.behavior_score + s.distinguished_score) >= 90).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50 border-b-2">
            <CardTitle>المخالفات حسب الدرجة</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsByDegree}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="العدد" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b-2">
            <CardTitle>توزيع مستويات السلوك</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behaviorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.العدد}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="العدد"
                >
                  {behaviorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {topMisconducts.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b-2">
              <CardTitle>أكثر المخالفات تكراراً</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topMisconducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="المخالفة" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="العدد" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top and Bottom Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-emerald-200">
          <CardHeader className="bg-emerald-50 border-b-2">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5" />
              الطلاب الأكثر التزاماً
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{student.full_name}</p>
                      <p className="text-sm text-gray-600">{student.grade_level} {student.grade_class}{student.class_division}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-bold text-emerald-600">
                      {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                    </p>
                    <p className="text-xs text-gray-500">من 100</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-red-200">
          <CardHeader className="bg-red-50 border-b-2">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              طلاب يحتاجون متابعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {studentsNeedingAttention.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-600 font-semibold">جميع الطلاب في وضع جيد!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map((student, idx) => (
                  <div key={student.id} className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{student.full_name}</p>
                          <p className="text-sm text-gray-600">{student.grade_level} {student.grade_class}{student.class_division}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-red-600">
                          {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                        </p>
                        <p className="text-xs text-gray-500">من 100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}