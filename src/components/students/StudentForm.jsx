import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';

export default function StudentForm({ student, onClose }) {
  const [formData, setFormData] = useState(student || {
    student_id: '',
    full_name: '',
    nationality: '',
    birth_date: '',
    grade_level: 'ابتدائي',
    grade_class: 1,
    class_division: 'أ',
    behavior_score: 80,
    distinguished_score: 0,
    attendance_score: 100,
    guardian_name: '',
    guardian_phone: '',
    student_phone: '',
    guardian_email: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (student) {
        return base44.entities.Student.update(student.id, data);
      }
      return base44.entities.Student.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle>{student ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-emerald-500">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الطالب *</Label>
                <Input
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  placeholder="رقم الطالب الوطني"
                />
              </div>

              <div className="space-y-2">
                <Label>الجنسية</Label>
                <Input
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  placeholder="سعودي"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>الاسم الكامل رباعياً *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="الاسم الكامل رباعياً"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ الميلاد</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>المرحلة الدراسية *</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) => setFormData({...formData, grade_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="ثانوي">ثانوي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الصف *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.grade_class}
                  onChange={(e) => setFormData({...formData, grade_class: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>الشعبة</Label>
                <Input
                  value={formData.class_division}
                  onChange={(e) => setFormData({...formData, class_division: e.target.value})}
                  placeholder="مثال: أ، ب، ج"
                />
              </div>
            </div>

            {/* Guardian Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">بيانات ولي الأمر</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم ولي الأمر</Label>
                  <Input
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>جوال ولي الأمر</Label>
                  <Input
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label>جوال الطالب</Label>
                  <Input
                    value={formData.student_phone}
                    onChange={(e) => setFormData({...formData, student_phone: e.target.value})}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={formData.guardian_email}
                    onChange={(e) => setFormData({...formData, guardian_email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="ملاحظات إضافية"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 ml-2" />
                حفظ
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}