import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Printer, Trash2, User, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdvancedIncidentForm({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    grade_level: 'متوسط',
    grade_class: 1,
    class_division: 'عام',
    misconduct_type_id: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  const { data: studentIncidents = [] } = useQuery({
    queryKey: ['student-incidents', selectedStudent?.student_id],
    queryFn: () => selectedStudent 
      ? base44.entities.BehaviorIncident.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const createIncident = useMutation({
    mutationFn: async (data) => {
      const misconduct = misconductTypes.find(m => m.id === data.misconduct_type_id);
      
      const incidentData = {
        student_id: selectedStudent.student_id,
        student_name: selectedStudent.full_name,
        misconduct_type_id: data.misconduct_type_id,
        misconduct_title: misconduct?.title,
        date: selectedDate.toISOString().split('T')[0],
        degree: misconduct?.degree,
        points_deducted: misconduct?.points_deduction,
        actions_taken: data.notes,
        notes: data.notes,
        procedure_number: 1
      };

      await base44.entities.BehaviorIncident.create(incidentData);

      const newScore = Math.max(0, (selectedStudent.behavior_score || 80) - misconduct.points_deduction);
      await base44.entities.Student.update(selectedStudent.id, {
        behavior_score: newScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-incidents'] });
      setFormData({
        ...formData,
        misconduct_type_id: '',
        notes: ''
      });
    },
  });

  const deleteIncident = useMutation({
    mutationFn: async (incidentId) => {
      const incident = studentIncidents.find(i => i.id === incidentId);
      await base44.entities.BehaviorIncident.delete(incidentId);
      
      if (incident && selectedStudent) {
        const newScore = Math.min(100, (selectedStudent.behavior_score || 80) + incident.points_deducted);
        await base44.entities.Student.update(selectedStudent.id, {
          behavior_score: newScore
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-incidents'] });
    },
  });

  const handleSubmit = () => {
    if (!selectedStudent || !formData.misconduct_type_id) {
      alert('الرجاء اختيار الطالب ونوع المخالفة');
      return;
    }
    createIncident.mutate(formData);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const filteredStudents = students.filter(s => 
    s.grade_level === formData.grade_level && 
    s.grade_class === parseInt(formData.grade_class)
  );

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg">معلومات الصف</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الصف</Label>
              <Select
                value={`${formData.grade_level}-${formData.grade_class}`}
                onValueChange={(value) => {
                  const [level, classNum] = value.split('-');
                  setFormData({...formData, grade_level: level, grade_class: parseInt(classNum)});
                  setSelectedStudent(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ابتدائي-1">الأول الابتدائي</SelectItem>
                  <SelectItem value="ابتدائي-2">الثاني الابتدائي</SelectItem>
                  <SelectItem value="ابتدائي-3">الثالث الابتدائي</SelectItem>
                  <SelectItem value="ابتدائي-4">الرابع الابتدائي</SelectItem>
                  <SelectItem value="ابتدائي-5">الخامس الابتدائي</SelectItem>
                  <SelectItem value="ابتدائي-6">السادس الابتدائي</SelectItem>
                  <SelectItem value="متوسط-1">الأول المتوسط</SelectItem>
                  <SelectItem value="متوسط-2">الثاني المتوسط</SelectItem>
                  <SelectItem value="متوسط-3">الثالث المتوسط</SelectItem>
                  <SelectItem value="ثانوي-1">الأول الثانوي</SelectItem>
                  <SelectItem value="ثانوي-2">الثاني الثانوي</SelectItem>
                  <SelectItem value="ثانوي-3">الثالث الثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>القسم</Label>
              <Input
                value={formData.class_division}
                onChange={(e) => setFormData({...formData, class_division: e.target.value})}
                placeholder="عام / علمي / أدبي"
              />
            </div>

            <div className="space-y-2">
              <Label>الفصل</Label>
              <Input
                type="number"
                value={formData.grade_class}
                onChange={(e) => setFormData({...formData, grade_class: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-lg">التاريخ</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Student Info */}
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              بيانات الطالب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم الطالب</Label>
                <Select
                  value={selectedStudent?.id || ''}
                  onValueChange={(value) => {
                    const student = students.find(s => s.id === value);
                    setSelectedStudent(student);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">رقم الطالب: {selectedStudent.student_id}</p>
                  <p className="text-sm text-gray-600">المرحلة: {selectedStudent.grade_level} - الصف {selectedStudent.grade_class}</p>
                  <p className="text-sm font-semibold text-blue-700">
                    رصيد السلوك الحالي: {(selectedStudent.behavior_score || 0) + (selectedStudent.distinguished_score || 0)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Misconduct Form */}
      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            المخالفة السلوكية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>نوع وسلوك الفعل</Label>
            <Select
              value={formData.misconduct_type_id}
              onValueChange={(value) => setFormData({...formData, misconduct_type_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المخالفة" />
              </SelectTrigger>
              <SelectContent>
                {misconductTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.title} - الدرجة {type.degree} ({type.points_deduction} نقطة)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>الملاحظات والإجراءات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="اكتب الملاحظات والإجراءات المتخذة..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700 gap-2">
              <Plus className="w-4 h-4" />
              إضافة المخالفة السلوكية
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Incidents List */}
      {selectedStudent && (
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">قائمة المخالفات المسجلة على الطالب</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handlePrintSummary} variant="outline" size="sm" className="gap-2">
                  <Printer className="w-4 h-4" />
                  طباعة مختصر المخالفة
                </Button>
                <Button onClick={handlePrintSummary} variant="outline" size="sm" className="gap-2">
                  <Printer className="w-4 h-4" />
                  طباعة كشف مخالفات الطالب
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {studentIncidents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد مخالفات مسجلة</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-4 py-3 text-right">التاريخ</th>
                      <th className="border px-4 py-3 text-right">نوع المخالفة</th>
                      <th className="border px-4 py-3 text-center">الدرجة</th>
                      <th className="border px-4 py-3 text-center">النقاط</th>
                      <th className="border px-4 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentIncidents.map((incident) => (
                      <tr key={incident.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-3">
                          {new Date(incident.date).toLocaleDateString('ar-SA-u-ca-islamic')}
                          <br />
                          <span className="text-xs text-gray-500">
                            {new Date(incident.date).toLocaleDateString('ar-SA')}
                          </span>
                        </td>
                        <td className="border px-4 py-3">{incident.misconduct_title}</td>
                        <td className="border px-4 py-3 text-center">
                          <Badge className={
                            incident.degree <= 2 ? 'bg-blue-600' :
                            incident.degree === 3 ? 'bg-yellow-600' :
                            incident.degree === 4 ? 'bg-orange-600' :
                            'bg-red-600'
                          }>
                            {incident.degree}
                          </Badge>
                        </td>
                        <td className="border px-4 py-3 text-center text-red-600 font-bold">
                          -{incident.points_deducted}
                        </td>
                        <td className="border px-4 py-3 text-center">
                          <Button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذه المخالفة؟')) {
                                deleteIncident.mutate(incident.id);
                              }
                            }}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
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
      )}
    </div>
  );
}