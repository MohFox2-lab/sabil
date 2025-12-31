import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, X, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function AbsencesTab() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    has_excuse: false,
    excuse_type: '',
    notes: '',
    points_deducted: 0
  });

  const queryClient = useQueryClient();

  const { data: absences = [] } = useQuery({
    queryKey: ['absences'],
    queryFn: () => base44.entities.Absence.list('-date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const createAbsence = useMutation({
    mutationFn: async (data) => {
      const student = students.find(s => s.id === data.student_id);
      
      const absenceData = {
        ...data,
        student_name: student?.full_name,
        student_id: student?.student_id,
        points_deducted: data.has_excuse ? 0 : 1
      };

      await base44.entities.Absence.create(absenceData);

      if (!data.has_excuse) {
        const newScore = Math.max(0, (student.attendance_score || 100) - 1);
        await base44.entities.Student.update(student.id, {
          attendance_score: newScore
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setFormData({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        has_excuse: false,
        excuse_type: '',
        notes: '',
        points_deducted: 0
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAbsence.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">أعذار الطلاب والغياب</h2>
          <p className="text-gray-600 mt-1">تسجيل ومتابعة حالات الغياب</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="w-5 h-5 ml-2" />
          تسجيل غياب
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {absences.map((absence) => (
          <Card key={absence.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-800">{absence.student_name}</h3>
                    <Badge className={absence.has_excuse ? 'bg-green-600' : 'bg-red-600'}>
                      {absence.has_excuse ? 'بعذر' : 'بدون عذر'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    التاريخ: {new Date(absence.date).toLocaleDateString('ar-SA')}
                  </p>
                  
                  {absence.excuse_type && (
                    <p className="text-sm text-gray-600 mb-2">نوع العذر: {absence.excuse_type}</p>
                  )}
                  
                  {absence.notes && (
                    <p className="text-sm text-gray-500">ملاحظات: {absence.notes}</p>
                  )}
                </div>

                {!absence.has_excuse && (
                  <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-center">
                    <p className="text-sm">محسوم</p>
                    <p className="text-2xl font-bold">-1</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-amber-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle>تسجيل غياب</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="text-white hover:bg-amber-500">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>الطالب *</Label>
                  <Select
                    required
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({...formData, student_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} - {student.grade_level} {student.grade_class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>التاريخ *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>هل يوجد عذر؟</Label>
                  <Select
                    value={formData.has_excuse ? 'yes' : 'no'}
                    onValueChange={(value) => setFormData({...formData, has_excuse: value === 'yes'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">نعم، يوجد عذر</SelectItem>
                      <SelectItem value="no">لا، بدون عذر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.has_excuse && (
                  <div className="space-y-2">
                    <Label>نوع العذر</Label>
                    <Select
                      value={formData.excuse_type}
                      onValueChange={(value) => setFormData({...formData, excuse_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع العذر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الإجازة المرضية">الإجازة المرضية</SelectItem>
                        <SelectItem value="مراجعة المستشفيات والمراكز الصحية">مراجعة المستشفيات</SelectItem>
                        <SelectItem value="حدوث الكوارث">حدوث الكوارث</SelectItem>
                        <SelectItem value="وفاة أحد الأقارب">وفاة أحد الأقارب</SelectItem>
                        <SelectItem value="مرافقة صحية">مرافقة صحية</SelectItem>
                        <SelectItem value="مراجعة الجهات الرسمية">مراجعة الجهات الرسمية</SelectItem>
                        <SelectItem value="المشاركات في المسابقات">المشاركات في المسابقات</SelectItem>
                        <SelectItem value="ظروف صحية أخرى">ظروف صحية أخرى</SelectItem>
                        <SelectItem value="حماية الطفل">حماية الطفل</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="ملاحظات إضافية..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}