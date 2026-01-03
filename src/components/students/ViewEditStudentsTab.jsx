import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Save, 
  X, 
  Search, 
  Filter,
  Trash2,
  RotateCcw
} from 'lucide-react';

export default function ViewEditStudentsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date'),
  });

  const updateStudent = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setEditingStudent(null);
      setEditForm({});
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.national_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = filterGrade === 'all' || student.grade_level === filterGrade;
    const matchesClass = filterClass === 'all' || student.grade_class?.toString() === filterClass;

    return matchesSearch && matchesGrade && matchesClass;
  });

  const handleEdit = (student) => {
    setEditingStudent(student.id);
    setEditForm({ ...student });
  };

  const handleSave = () => {
    if (!editingStudent) return;
    updateStudent.mutate({ id: editingStudent, data: editForm });
  };

  const handleDelete = (student) => {
    if (confirm(`هل أنت متأكد من حذف الطالب: ${student.full_name}؟`)) {
      deleteStudent.mutate(student.id);
    }
  };

  const handleCancel = () => {
    setEditingStudent(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">إجمالي الطلاب</p>
            <p className="text-3xl font-bold text-blue-600">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">معروض</p>
            <p className="text-3xl font-bold text-green-600">{filteredStudents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">قيد التعديل</p>
            <p className="text-3xl font-bold text-orange-600">{editingStudent ? '1' : '0'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-600">المرشح</p>
            <p className="text-3xl font-bold text-purple-600">{students.length - filteredStudents.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="اسم الطالب، رقم الطالب، أو الهوية..."
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>المرحلة</Label>
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراحل</SelectItem>
                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الصف</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || filterGrade !== 'all' || filterClass !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterGrade('all');
                setFilterClass('all');
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة تعيين الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            بيانات الطلاب ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl mb-2">لا توجد بيانات</p>
              <p className="text-sm">قم بتعديل معايير البحث أو قم بإضافة طلاب جدد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right p-3 font-semibold text-sm border-b">#</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">رقم الطالب</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">رقم الهوية</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">الاسم الأول</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">اسم الأب</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">اسم الجد</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">اسم العائلة</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">المرحلة</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">الصف</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">الشعبة</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">السلوك</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">المواظبة</th>
                    <th className="text-right p-3 font-semibold text-sm border-b">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const isEditing = editingStudent === student.id;
                    
                    return (
                      <tr key={student.id} className={`border-b hover:bg-gray-50 ${isEditing ? 'bg-blue-50' : ''}`}>
                        <td className="p-3 text-sm">{idx + 1}</td>
                        
                        {isEditing ? (
                          <>
                            <td className="p-3">
                              <Input
                                value={editForm.student_id || ''}
                                onChange={(e) => setEditForm({...editForm, student_id: e.target.value})}
                                className="text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.national_id || ''}
                                onChange={(e) => setEditForm({...editForm, national_id: e.target.value})}
                                className="text-sm"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.first_name || ''}
                                onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                className="text-sm"
                                placeholder="الاسم الأول"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.father_name || ''}
                                onChange={(e) => setEditForm({...editForm, father_name: e.target.value})}
                                className="text-sm"
                                placeholder="اسم الأب"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.grandfather_name || ''}
                                onChange={(e) => setEditForm({...editForm, grandfather_name: e.target.value})}
                                className="text-sm"
                                placeholder="اسم الجد"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.family_name || ''}
                                onChange={(e) => setEditForm({...editForm, family_name: e.target.value})}
                                className="text-sm"
                                placeholder="اسم العائلة"
                              />
                            </td>
                            <td className="p-3">
                              <Select
                                value={editForm.grade_level || 'متوسط'}
                                onValueChange={(value) => setEditForm({...editForm, grade_level: value})}
                              >
                                <SelectTrigger className="text-sm h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                                  <SelectItem value="متوسط">متوسط</SelectItem>
                                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editForm.grade_class || ''}
                                onChange={(e) => setEditForm({...editForm, grade_class: parseInt(e.target.value) || 1})}
                                className="text-sm w-16"
                                min="1"
                                max="12"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editForm.class_division || ''}
                                onChange={(e) => setEditForm({...editForm, class_division: e.target.value})}
                                className="text-sm w-16"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editForm.behavior_score || ''}
                                onChange={(e) => setEditForm({...editForm, behavior_score: parseInt(e.target.value) || 0})}
                                className="text-sm w-16"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editForm.attendance_score || ''}
                                onChange={(e) => setEditForm({...editForm, attendance_score: parseInt(e.target.value) || 0})}
                                className="text-sm w-16"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={handleSave}
                                  disabled={updateStudent.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm">{student.student_id || '-'}</td>
                            <td className="p-3 text-sm">{student.national_id || '-'}</td>
                            <td className="p-3 text-sm font-medium">{student.first_name || '-'}</td>
                            <td className="p-3 text-sm font-medium">{student.father_name || '-'}</td>
                            <td className="p-3 text-sm font-medium">{student.grandfather_name || '-'}</td>
                            <td className="p-3 text-sm font-medium">{student.family_name || '-'}</td>
                            <td className="p-3 text-sm">
                              <Badge className="bg-blue-600">{student.grade_level || '-'}</Badge>
                            </td>
                            <td className="p-3 text-sm">{student.grade_class || '-'}</td>
                            <td className="p-3 text-sm">{student.class_division || '-'}</td>
                            <td className="p-3 text-sm">
                              <Badge className={
                                (student.behavior_score || 0) >= 70 ? 'bg-green-600' :
                                (student.behavior_score || 0) >= 50 ? 'bg-orange-600' :
                                'bg-red-600'
                              }>
                                {student.behavior_score || 0}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm">
                              <Badge className={
                                (student.attendance_score || 0) >= 90 ? 'bg-green-600' :
                                (student.attendance_score || 0) >= 70 ? 'bg-orange-600' :
                                'bg-red-600'
                              }>
                                {student.attendance_score || 0}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(student)}
                                  disabled={editingStudent !== null}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(student)}
                                  disabled={editingStudent !== null || deleteStudent.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}