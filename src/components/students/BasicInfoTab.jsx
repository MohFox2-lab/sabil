import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X, Edit, Trash2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function BasicInfoTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);

  const [formData, setFormData] = useState({
    national_id: '',
    full_name: '',
    nationality: 'سعودي',
    birth_date: '',
    place_of_birth: '',

    school_code: '',
    school_name: '',
    school_code_ministry: '',

    grade_level: '',
    grade_class: '',
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
        national_id: '',
        full_name: '',
        nationality: 'سعودي',
        birth_date: '',
        place_of_birth: '',

        school_code: '',
        school_name: '',
        school_code_ministry: '',

        grade_level: '',
        grade_class: '',
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
      const batchSize = 5; // دفعات صغيرة لتجنب rate limit
      const total = ids.length;
      let deleted = 0;
      const failed = [];
      
      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        
        // حذف الدفعة الحالية واحدة تلو الأخرى
        for (const id of batch) {
          try {
            await base44.entities.Student.delete(id);
            deleted++;
            setDeleteProgress(Math.round((deleted / total) * 100));
            // تأخير بسيط بين كل عملية حذف
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (err) {
            failed.push(id);
          }
        }
        
        // تأخير إضافي بين الدفعات
        if (i + batchSize < ids.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return { deleted, failed, total };
    },
    onMutate: () => {
      setIsDeleting(true);
      setDeleteProgress(0);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedStudents([]);
      setIsDeleting(false);
      setDeleteProgress(0);
      
      if (result.failed.length === 0) {
        alert(`تم حذف جميع الطلاب بنجاح ✅ (${result.deleted})`);
      } else {
        alert(`تم حذف ${result.deleted} من ${result.total} طالب\nفشل حذف ${result.failed.length} طالب`);
      }
    },
    onError: (error) => {
      setIsDeleting(false);
      setDeleteProgress(0);
      alert(`حدث خطأ أثناء الحذف: ${error.message}`);
    }
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      national_id: student.national_id || '',
      full_name: student.full_name || '',
      nationality: student.nationality || 'سعودي',
      birth_date: student.birth_date || '',
      place_of_birth: student.place_of_birth || '',

      school_code: student.school_code || '',
      school_name: student.school_name || '',
      school_code_ministry: student.school_code_ministry || '',

      grade_level: student.grade_level || '',
      grade_class: student.grade_class || '',
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
    (s.full_name || '').includes(searchTerm) || (s.national_id || '').includes(searchTerm)
  );

  const handleSelectAll = (checked) => {
    if (checked) setSelectedStudents(filteredStudents.map(s => s.id));
    else setSelectedStudents([]);
  };

  const handleSelectStudent = (studentId, checked) => {
    if (checked) setSelectedStudents([...selectedStudents, studentId]);
    else setSelectedStudents(selectedStudents.filter(id => id !== studentId));
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
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDeleteSelected}
                variant="destructive"
                className="gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? `جاري الحذف... ${deleteProgress}%` : `حذف المحدد (${selectedStudents.length})`}
              </Button>
              {isDeleting && (
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${deleteProgress}%` }}
                  />
                </div>
              )}
            </div>
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
          <div className="overflow-x-auto" style={{ maxWidth: '100%' }}>
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b bg-blue-50">
                  <th className="text-center p-3 w-12 sticky right-0 bg-blue-50 z-10">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>

                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[150px]">رقم الهوية</th>

                  {/* أعمدة المدرسة */}
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[140px]">معرف المدرسة</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[220px]">اسم المدرسة</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[160px]">الرقم الوزاري</th>

                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[220px]">الاسم الكامل</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[100px]">الجنسية</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[100px]">تاريخ الميلاد</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[80px]">المرحلة</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[60px]">الصف</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[80px]">الشعبة</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[140px]">المدينة</th>
                  <th className="text-right p-3 font-bold whitespace-nowrap min-w-[140px]">الحي</th>

                  <th className="text-center p-3 font-bold whitespace-nowrap min-w-[120px] sticky left-0 bg-blue-50 z-10">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="p-3 text-center sticky right-0 bg-white hover:bg-blue-50 z-10">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleSelectStudent(student.id, checked)}
                      />
                    </td>

                    <td className="p-3 text-gray-600 font-mono whitespace-nowrap">{student.national_id || '-'}</td>
                    <td className="p-3 text-gray-700 font-mono whitespace-nowrap">{student.school_code || '-'}</td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">{student.school_name || '-'}</td>
                    <td className="p-3 text-gray-700 font-mono whitespace-nowrap">{student.school_code_ministry || '-'}</td>

                    <td className="p-3 font-semibold text-gray-900 whitespace-nowrap">{student.full_name || '-'}</td>
                    <td className="p-3 text-gray-700 whitespace-nowrap">{student.nationality || '-'}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">{student.birth_date || '-'}</td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded text-sm bg-emerald-100 text-emerald-700">
                        {student.grade_level || '-'}
                      </span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 rounded text-sm bg-blue-100 text-blue-700 font-semibold">
                        {student.grade_class ?? '-'}
                      </span>
                    </td>

                    <td className="p-3 text-gray-700 whitespace-nowrap">{student.class_division || '-'}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">{student.city || '-'}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">{student.district || '-'}</td>

                    <td className="p-3 sticky left-0 bg-white hover:bg-blue-50 z-10">
                      <div className="flex gap-2 justify-center whitespace-nowrap">
                        <Button onClick={() => handleEdit(student)} size="sm" variant="outline" className="hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                              deleteStudent.mutate(student.id);
                            }
                          }}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
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
                <div className="space-y-2">
                  <Label>رقم الهوية / الإقامة</Label>
                  <Input
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                    maxLength={10}
                  />
                </div>

                {/* ✅ حقول المدرسة */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>معرف المدرسة</Label>
                    <Input
                      value={formData.school_code}
                      onChange={(e) => setFormData({ ...formData, school_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم المدرسة</Label>
                    <Input
                      value={formData.school_name}
                      onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الرقم الوزاري</Label>
                    <Input
                      value={formData.school_code_ministry}
                      onChange={(e) => setFormData({ ...formData, school_code_ministry: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>الاسم الكامل *</Label>
                  <Input
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الجنسية</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>مكان الميلاد</Label>
                    <Input
                      value={formData.place_of_birth}
                      onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>المرحلة</Label>
                    <Select
                      value={formData.grade_level}
                      onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المرحلة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>بدون</SelectItem>
                        <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="ثانوي">ثانوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>الصف</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.grade_class}
                      onChange={(e) => setFormData({ ...formData, grade_class: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الشعبة (الفصل)</Label>
                    <Input
                      value={formData.class_division}
                      onChange={(e) => setFormData({ ...formData, class_division: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>عنوان السكن</Label>
                  <Input
                    value={formData.residential_address}
                    onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحي</Label>
                    <Input
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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