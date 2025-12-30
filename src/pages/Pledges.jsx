import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSignature, Plus, X, Save, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function Pledges() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'سلوكي',
    content: '',
    misconduct_related: '',
    signed_by_student: false,
    signed_by_guardian: false
  });

  const queryClient = useQueryClient();

  const { data: pledges = [] } = useQuery({
    queryKey: ['pledges'],
    queryFn: () => base44.entities.WrittenPledge.list('-date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const createPledge = useMutation({
    mutationFn: async (data) => {
      const student = students.find(s => s.id === data.student_id);
      await base44.entities.WrittenPledge.create({
        ...data,
        student_name: student?.full_name,
        student_id: student?.student_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      setShowForm(false);
      setFormData({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'سلوكي',
        content: '',
        misconduct_related: '',
        signed_by_student: false,
        signed_by_guardian: false
      });
    },
  });

  const updateSignature = useMutation({
    mutationFn: ({ id, field, value }) => {
      return base44.entities.WrittenPledge.update(id, { [field]: value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPledge.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التعهدات الخطية</h1>
          <p className="text-gray-600 mt-1">إدارة التعهدات السلوكية وتعهدات المواظبة</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-5 h-5 ml-2" />
          تعهد جديد
        </Button>
      </div>

      {/* Pledges List */}
      <div className="grid grid-cols-1 gap-4">
        {pledges.map((pledge) => (
          <Card key={pledge.id} className="hover:shadow-lg transition-all">
            <CardHeader className={pledge.type === 'سلوكي' ? 'bg-purple-50' : 'bg-blue-50'}>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  {pledge.student_name}
                </CardTitle>
                <Badge className={pledge.type === 'سلوكي' ? 'bg-purple-600' : 'bg-blue-600'}>
                  {pledge.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{pledge.content}</p>
              
              {pledge.misconduct_related && (
                <p className="text-sm text-gray-600 mb-4">المخالفة المرتبطة: {pledge.misconduct_related}</p>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  {pledge.signed_by_student ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">توقيع الطالب</span>
                  {!pledge.signed_by_student && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSignature.mutate({ id: pledge.id, field: 'signed_by_student', value: true })}
                    >
                      توقيع
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {pledge.signed_by_guardian ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm">توقيع ولي الأمر</span>
                  {!pledge.signed_by_guardian && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateSignature.mutate({ id: pledge.id, field: 'signed_by_guardian', value: true })}
                    >
                      توقيع
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                {new Date(pledge.date).toLocaleDateString('ar-SA')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle>تعهد خطي جديد</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="text-white hover:bg-indigo-500">
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
                  <Label>نوع التعهد *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({...formData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سلوكي">تعهد سلوكي</SelectItem>
                      <SelectItem value="مواظبة">تعهد بالمواظبة</SelectItem>
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
                  <Label>نص التعهد *</Label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="أتعهد بعدم تكرار..."
                    rows={4}
                  />
                </div>

                {formData.type === 'سلوكي' && (
                  <div className="space-y-2">
                    <Label>المخالفة المرتبطة</Label>
                    <Input
                      value={formData.misconduct_related}
                      onChange={(e) => setFormData({...formData, misconduct_related: e.target.value})}
                      placeholder="اسم المخالفة المرتبطة بهذا التعهد"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التعهد
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