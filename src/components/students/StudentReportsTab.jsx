import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function StudentReportsTab() {
  const [filters, setFilters] = useState({
    grade_level: 'all',
    grade_class: 'all',
    min_behavior_score: 0,
    max_behavior_score: 200
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const filteredStudents = students.filter(student => {
    if (filters.grade_level !== 'all' && student.grade_level !== filters.grade_level) return false;
    if (filters.grade_class !== 'all' && student.grade_class !== parseInt(filters.grade_class)) return false;
    
    const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
    if (totalScore < filters.min_behavior_score || totalScore > filters.max_behavior_score) return false;
    
    return true;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add Arabic font support
    doc.setLanguage("ar");
    
    // Title
    doc.setFontSize(18);
    doc.text('تقرير بيانات الطلاب', 105, 20, { align: 'center' });
    
    // Filters info
    doc.setFontSize(10);
    let yPos = 35;
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 20, yPos);
    yPos += 7;
    doc.text(`المرحلة: ${filters.grade_level === 'all' ? 'الكل' : filters.grade_level}`, 20, yPos);
    yPos += 7;
    doc.text(`الصف: ${filters.grade_class === 'all' ? 'الكل' : filters.grade_class}`, 20, yPos);
    yPos += 7;
    doc.text(`عدد الطلاب: ${filteredStudents.length}`, 20, yPos);
    
    // Table headers
    yPos += 15;
    doc.setFontSize(9);
    doc.text('رقم الطالب', 20, yPos);
    doc.text('الاسم', 60, yPos);
    doc.text('المرحلة', 120, yPos);
    doc.text('الصف', 150, yPos);
    doc.text('السلوك', 170, yPos);
    doc.text('المواظبة', 190, yPos);
    
    // Table content
    yPos += 7;
    filteredStudents.forEach((student, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
      
      doc.text(student.student_id || '', 20, yPos);
      doc.text(student.full_name || '', 60, yPos);
      doc.text(student.grade_level || '', 120, yPos);
      doc.text(String(student.grade_class || ''), 150, yPos);
      doc.text(String(totalScore), 170, yPos);
      doc.text(String(student.attendance_score || 0), 190, yPos);
      
      yPos += 7;
    });
    
    // Save
    doc.save(`تقرير_الطلاب_${new Date().getTime()}.pdf`);
  };

  const exportToCSV = () => {
    // CSV Headers
    const headers = [
      'رقم الطالب',
      'رقم الهوية',
      'الاسم الكامل',
      'الجنسية',
      'تاريخ الميلاد',
      'المرحلة',
      'الصف',
      'الشعبة (الفصل)',
      'رصيد السلوك',
      'السلوك المتميز',
      'المجموع',
      'المواظبة',
      'اسم ولي الأمر',
      'جوال ولي الأمر',
      'جوال الطالب',
      'البريد الإلكتروني',
      'المدينة',
      'الحي'
    ];
    
    // CSV Rows
    const rows = filteredStudents.map(student => {
      const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
      return [
        student.student_id || '',
        student.national_id || '',
        student.full_name || '',
        student.nationality || '',
        student.birth_date || '',
        student.grade_level || '',
        student.grade_class || '',
        student.class_division || '',
        student.behavior_score || 0,
        student.distinguished_score || 0,
        totalScore,
        student.attendance_score || 0,
        student.guardian_name || '',
        student.guardian_phone || '',
        student.student_phone || '',
        student.guardian_email || '',
        student.city || '',
        student.district || ''
      ];
    });
    
    // Create CSV content with UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_الطلاب_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            إنشاء تقرير مخصص
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>المرحلة الدراسية</Label>
              <Select
                value={filters.grade_level}
                onValueChange={(value) => setFilters({...filters, grade_level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الصف</Label>
              <Select
                value={filters.grade_class}
                onValueChange={(value) => setFilters({...filters, grade_class: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحد الأدنى للسلوك</Label>
              <Select
                value={String(filters.min_behavior_score)}
                onValueChange={(value) => setFilters({...filters, min_behavior_score: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (الكل)</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="70">70</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحد الأقصى للسلوك</Label>
              <Select
                value={String(filters.max_behavior_score)}
                onValueChange={(value) => setFilters({...filters, max_behavior_score: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="70">70</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200 (الكل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600">عدد الطلاب</p>
              <p className="text-2xl font-bold text-blue-600">{filteredStudents.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">متوسط السلوك</p>
              <p className="text-2xl font-bold text-emerald-600">
                {filteredStudents.length > 0
                  ? (filteredStudents.reduce((sum, s) => sum + (s.behavior_score || 0) + (s.distinguished_score || 0), 0) / filteredStudents.length).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">متوسط المواظبة</p>
              <p className="text-2xl font-bold text-amber-600">
                {filteredStudents.length > 0
                  ? (filteredStudents.reduce((sum, s) => sum + (s.attendance_score || 0), 0) / filteredStudents.length).toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">طلاب متميزون</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredStudents.filter(s => (s.behavior_score || 0) + (s.distinguished_score || 0) >= 90).length}
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 justify-end border-t pt-6">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              تصدير CSV
            </Button>
            <Button onClick={exportToPDF} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Download className="w-4 h-4" />
              تصدير PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>معاينة البيانات ({filteredStudents.length} طالب)</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="text-right p-2 border">رقم الطالب</th>
                  <th className="text-right p-2 border">الاسم</th>
                  <th className="text-right p-2 border">المرحلة</th>
                  <th className="text-right p-2 border">الصف</th>
                  <th className="text-center p-2 border">السلوك</th>
                  <th className="text-center p-2 border">المواظبة</th>
                  <th className="text-right p-2 border">الجوال</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="p-2 border">{student.student_id}</td>
                      <td className="p-2 border">{student.full_name}</td>
                      <td className="p-2 border">{student.grade_level}</td>
                      <td className="p-2 border">{student.grade_class}</td>
                      <td className="p-2 border text-center font-bold">
                        <span className={
                          totalScore >= 90 ? 'text-emerald-600' :
                          totalScore >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        }>
                          {totalScore}
                        </span>
                      </td>
                      <td className="p-2 border text-center">{student.attendance_score || 0}</td>
                      <td className="p-2 border">{student.guardian_phone || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}