import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X, Edit, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function BasicInfoTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    national_id: '',
    full_name: '',
    nationality: 'سعودي',
    birth_date: '',
    place_of_birth: '',
    grade_level: 'متوسط',
    grade_class: 1,
    class_division: '',
    residential_address: '',
    city: '',
    district: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const createOrUpdate = useMutation({
    mutationFn: (data) => {
      if (editingStudent) {
        return base44.entities.Student.update(editingStudent.id, data);
      }
      return base44.entities.Student.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setEditingStudent(null);
      setFormData({
        student_id: '',
        national_id: '',
        full_name: '',
        nationality: 'سعودي',
        birth_date: '',
        place_of_birth: '',
        grade_level: 'متوسط',
        grade_class: 1,
        class_division: '',
        residential_address: '',
        city: '',
        district: '',
        notes: ''
      });
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteMultipleStudents = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.entities.Student.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedStudents([]);
    },
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      national_id: student.national_id || '',
      full_name: student.full_name,
      nationality: student.nationality || 'سعودي',
      birth_date: student.birth_date || '',
      place_of_birth: student.place_of_birth || '',
      grade_level: student.grade_level,
      grade_class: student.grade_class,
      class_division: student.class_division || '',
      residential_address: student.residential_address || '',
      city: student.city || '',
      district: student.district || '',
      notes: student.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrUpdate.mutate(formData);
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm)
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) {
      alert('الرجاء اختيار طلاب للحذف');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف ${selectedStudents.length} طالب؟`)) {
      deleteMultipleStudents.mutate(selectedStudents);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Input
            placeholder="البحث عن طالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          {selectedStudents.length > 0 && (
            <Button 
              onClick={handleDeleteSelected} 
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              حذف المحدد ({selectedStudents.length})
            </Button>
          )}
        </div>
        <Button onClick={() => {
          setEditingStudent(null);
          setShowForm(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-2" />
          إضافة طالب
        </Button>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-l from-blue-600 to-blue-700 text-white">
                  <th className="text-center p-3 w-12 border-l border-blue-500">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white"
                    />
                  </th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[100px]">رقم الطالب</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[100px]">معرف المدرسة</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[120px]">رقم الهوية</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[200px]">الاسم الأول</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[100px]">اسم الأب</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[100px]">اسم الجد</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[100px]">اسم العائلة</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[80px]">الجنسية</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[80px]">المرحلة</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[60px]">الصف</th>
                  <th className="text-center p-3 font-bold text-sm border-l border-blue-500 min-w-[60px]">الشعبة</th>
                  <th className="text-center p-3 font-bold text-sm min-w-[120px]">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const nameParts = student.full_name?.split(' ') || [];
                  const firstName = nameParts[0] || '-';
                  const secondName = nameParts[1] || '-';
                  const thirdName = nameParts[2] || '-';
                  const familyName = nameParts.slice(3).join(' ') || '-';
                  
                  return (
                    <tr key={student.id} className={`border-b hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-2 text-center border-l border-gray-200">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => handleSelectStudent(student.id, checked)}
                        />
                      </td>
                      <td className="p-2 text-center text-blue-700 font-mono text-sm border-l border-gray-200">{student.student_id}</td>
                      <td className="p-2 text-center text-gray-600 text-sm border-l border-gray-200">{student.city || '-'}</td>
                      <td className="p-2 text-center text-gray-600 font-mono text-sm border-l border-gray-200">{student.national_id || '-'}</td>
                      <td className="p-2 text-center font-semibold text-gray-900 text-sm border-l border-gray-200">{firstName}</td>
                      <td className="p-2 text-center text-gray-800 text-sm border-l border-gray-200">{secondName}</td>
                      <td className="p-2 text-center text-gray-800 text-sm border-l border-gray-200">{thirdName}</td>
                      <td className="p-2 text-center text-gray-800 text-sm border-l border-gray-200">{familyName}</td>
                      <td className="p-2 text-center text-gray-700 text-sm border-l border-gray-200">{student.nationality || '-'}</td>
                      <td className="p-2 text-center border-l border-gray-200">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700">
                          {student.grade_level}
                        </span>
                      </td>
                      <td className="p-2 text-center border-l border-gray-200">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 font-semibold">
                          {student.grade_class}
                        </span>
                      </td>
                      <td className="p-2 text-center text-gray-700 text-sm border-l border-gray-200">{student.class_division || '-'}</td>
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          <Button onClick={() => handleEdit(student)} size="sm" variant="outline" className="hover:bg-blue-50 h-8 px-2">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                                deleteStudent.mutate(student.id);
                              }
                            }}
                            size="sm" 
                            variant="destructive"
                            className="h-8 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
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

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-blue-600 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <CardTitle>{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم الطالب *</Label>
                    <Input
                      required
                      value={formData.student_id}
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهوية / الإقامة</Label>
                    <Input
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الاسم الكامل *</Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الجنسية</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
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
                    <Label>مكان الميلاد</Label>
                    <Input
                      value={formData.place_of_birth}
                      onChange={(e) => setFormData({...formData, place_of_birth: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>المرحلة *</Label>
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
                    <Label>الشعبة (الفصل)</Label>
                    <Input
                      value={formData.class_division}
                      onChange={(e) => setFormData({...formData, class_division: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>عنوان السكن</Label>
                  <Input
                    value={formData.residential_address}
                    onChange={(e) => setFormData({...formData, residential_address: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحي</Label>
                    <Input
                      value={formData.district}
                      onChange={(e) => setFormData({...formData, district: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
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