import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, RotateCcw, Search, Eye, Trash2, UserPlus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function StudentDataTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    nationality: '',
    birth_date: '',
    grade_level: 'متوسط',
    grade_class: 1,
    class_division: 'أ',
    guardian_name: '',
    guardian_phone: '',
    student_phone: '',
    guardian_email: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingId) {
        return base44.entities.Student.update(editingId, data);
      }
      return base44.entities.Student.create({
        ...data,
        behavior_score: 80,
        distinguished_score: 0,
        attendance_score: 100
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      resetForm();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const loadStudent = (student) => {
    setFormData({
      student_id: student.student_id || '',
      full_name: student.full_name || '',
      nationality: student.nationality || '',
      birth_date: student.birth_date || '',
      grade_level: student.grade_level || 'متوسط',
      grade_class: student.grade_class || 1,
      class_division: student.class_division || 'أ',
      guardian_name: student.guardian_name || '',
      guardian_phone: student.guardian_phone || '',
      student_phone: student.student_phone || '',
      guardian_email: student.guardian_email || '',
      notes: student.notes || ''
    });
    setEditingId(student.id);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      full_name: '',
      nationality: '',
      birth_date: '',
      grade_level: 'متوسط',
      grade_class: 1,
      class_division: 'أ',
      guardian_name: '',
      guardian_phone: '',
      student_phone: '',
      guardian_email: '',
      notes: ''
    });
    setEditingId(null);
  };

  const filteredStudents = students.filter(s =>
    s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-l from-blue-50 to-indigo-50 border-b-2">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <UserPlus className="w-6 h-6" />
            {editingId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">رقم الطالب *</Label>
                <Input
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  placeholder="رقم الطالب الوطني"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الجنسية</Label>
                <Input
                  value={formData.nationality}
                  onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                  placeholder="سعودي"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="font-bold">الاسم الكامل رباعياً *</Label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="الاسم الكامل رباعياً"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">تاريخ الميلاد</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">المرحلة الدراسية *</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) => setFormData({...formData, grade_level: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ابتدائي">الابتدائية</SelectItem>
                    <SelectItem value="متوسط">المتوسطة</SelectItem>
                    <SelectItem value="ثانوي">الثانوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الصف *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.grade_class}
                  onChange={(e) => setFormData({...formData, grade_class: parseInt(e.target.value)})}
                  placeholder="1-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الفصل/الشعبة</Label>
                <Input
                  value={formData.class_division}
                  onChange={(e) => setFormData({...formData, class_division: e.target.value})}
                  placeholder="أ، ب، ج..."
                />
              </div>
            </div>

            {/* Guardian Info */}
            <div className="border-t-2 pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">بيانات ولي الأمر</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم ولي الأمر</Label>
                  <Input
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                    placeholder="الاسم الكامل لولي الأمر"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">جوال ولي الأمر</Label>
                  <Input
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">جوال الطالب</Label>
                  <Input
                    value={formData.student_phone}
                    onChange={(e) => setFormData({...formData, student_phone: e.target.value})}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">البريد الإلكتروني</Label>
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
              <Label className="font-bold">ملاحظات إضافية</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="أي ملاحظات خاصة بالطالب..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                جديد
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 ml-2" />
                {editingId ? 'تحديث البيانات' : 'حفظ الطالب'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-l from-indigo-50 to-purple-50 border-b-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قائمة الطلاب ({filteredStudents.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold">رقم الطالب</th>
                  <th className="px-4 py-3 text-right text-sm font-bold">الاسم</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">المرحلة</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">الصف</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">الفصل</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">الرصيد</th>
                  <th className="px-4 py-3 text-center text-sm font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);
                  return (
                    <tr key={student.id} className="hover:bg-blue-50 transition-colors border-b">
                      <td className="px-4 py-3 text-sm">{student.student_id}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{student.full_name}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{student.grade_level}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{student.grade_class}</td>
                      <td className="px-4 py-3 text-center text-sm">{student.class_division}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${
                          totalScore >= 90 ? 'text-emerald-600' :
                          totalScore >= 70 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {totalScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => loadStudent(student)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطالب: ${student.full_name}؟`)) {
                                deleteMutation.mutate(student.id);
                              }
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
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