import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSignature, Plus, X, Save, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function PledgesTab() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'سلوكي',
    content: '',
    misconduct_related: ''
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
      
      const pledgeData = {
        ...data,
        student_name: student?.full_name,
        student_id: student?.student_id,
        signed_by_student: false,
        signed_by_guardian: false
      };

      await base44.entities.WrittenPledge.create(pledgeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pledges'] });
      setShowForm(false);
      setFormData({
        student_id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'سلوكي',
        content: '',
        misconduct_related: ''
      });
    },
  });

  const updateSignature = useMutation({
    mutationFn: ({ pledgeId, field }) => {
      const pledge = pledges.find(p => p.id === pledgeId);
      return base44.entities.WrittenPledge.update(pledgeId, {
        [field]: !pledge[field]
      });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التعهدات الخطية</h2>
          <p className="text-gray-600 mt-1">إدارة التعهدات الخطية للطلاب</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-5 h-5 ml-2" />
          تعهد جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pledges.map((pledge) => (
          <Card key={pledge.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileSignature className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-xl font-bold text-gray-800">{pledge.student_name}</h3>
                    <Badge className={pledge.type === 'سلوكي' ? 'bg-red-600' : 'bg-blue-600'}>
                      {pledge.type}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    التاريخ: {new Date(pledge.date).toLocaleDateString('ar-SA')}
                  </p>
                  
                  <p className="text-sm text-gray-700 mb-3">{pledge.content}</p>
                  
                  {pledge.misconduct_related && (
                    <p className="text-sm text-gray-600 mb-2">المخالفة: {pledge.misconduct_related}</p>
                  )}

                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      variant={pledge.signed_by_student ? "default" : "outline"}
                      onClick={() => updateSignature.mutate({ pledgeId: pledge.id, field: 'signed_by_student' })}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      توقيع الطالب
                    </Button>
                    <Button
                      size="sm"
                      variant={pledge.signed_by_guardian ? "default" : "outline"}
                      onClick={() => updateSignature.mutate({ pledgeId: pledge.id, field: 'signed_by_guardian' })}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      توقيع ولي الأمر
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  <Label>التاريخ *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
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
                      <SelectItem value="سلوكي">سلوكي</SelectItem>
                      <SelectItem value="مواظبة">مواظبة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نص التعهد *</Label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="أتعهد بـ..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>المخالفة المرتبطة</Label>
                  <Input
                    value={formData.misconduct_related}
                    onChange={(e) => setFormData({...formData, misconduct_related: e.target.value})}
                    placeholder="إن وجدت"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
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