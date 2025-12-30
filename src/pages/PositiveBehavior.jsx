import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus, X, Save, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function PositiveBehavior() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    positive_action_id: '',
    date: new Date().toISOString().split('T')[0],
    points_earned: 0,
    evidence: '',
    approved: true
  });

  const queryClient = useQueryClient();

  const { data: actions = [] } = useQuery({
    queryKey: ['student-positive-actions'],
    queryFn: () => base44.entities.StudentPositiveAction.list('-date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: positiveActionTypes = [] } = useQuery({
    queryKey: ['positive-action-types'],
    queryFn: () => base44.entities.PositiveAction.list(),
  });

  const createAction = useMutation({
    mutationFn: async (data) => {
      const student = students.find(s => s.id === data.student_id);
      const actionType = positiveActionTypes.find(a => a.id === data.positive_action_id);
      
      const actionData = {
        ...data,
        student_name: student?.full_name,
        positive_action_title: actionType?.title,
        student_id: student?.student_id
      };

      await base44.entities.StudentPositiveAction.create(actionData);

      // Update student distinguished score
      const currentTotal = (student.behavior_score || 80) + (student.distinguished_score || 0);
      const newDistinguished = Math.min(20, (student.distinguished_score || 0) + data.points_earned);
      const finalTotal = Math.min(100, currentTotal + data.points_earned);
      
      await base44.entities.Student.update(student.id, {
        distinguished_score: newDistinguished
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-positive-actions'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setFormData({
        student_id: '',
        positive_action_id: '',
        date: new Date().toISOString().split('T')[0],
        points_earned: 0,
        evidence: '',
        approved: true
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAction.mutate(formData);
  };

  const selectedActionType = positiveActionTypes.find(a => a.id === formData.positive_action_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">السلوك المتميز</h1>
          <p className="text-gray-600 mt-1">تسجيل السلوكيات المتميزة وتعويض الدرجات</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-5 h-5 ml-2" />
          تسجيل سلوك متميز
        </Button>
      </div>

      {/* Actions List */}
      <div className="grid grid-cols-1 gap-4">
        {actions.map((action) => (
          <Card key={action.id} className="hover:shadow-lg transition-all border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{action.student_name}</h3>
                    {action.approved && (
                      <Badge className="bg-emerald-600">معتمد</Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 font-semibold mb-2">{action.positive_action_title}</p>
                  
                  {action.evidence && (
                    <p className="text-sm text-gray-600 mb-2">الشواهد: {action.evidence}</p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(action.date).toLocaleDateString('ar-SA')}
                  </p>
                </div>

                <div className="text-left">
                  <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-center shadow-lg">
                    <p className="text-sm">مكتسب</p>
                    <p className="text-3xl font-bold">+{action.points_earned}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-emerald-600 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  تسجيل سلوك متميز
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="text-white hover:bg-emerald-500">
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
                  <Label>نوع النشاط *</Label>
                  <Select
                    required
                    value={formData.positive_action_id}
                    onValueChange={(value) => {
                      const actionType = positiveActionTypes.find(a => a.id === value);
                      setFormData({
                        ...formData, 
                        positive_action_id: value,
                        points_earned: actionType?.max_points || 0
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النشاط" />
                    </SelectTrigger>
                    <SelectContent>
                      {positiveActionTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.title} ({type.max_points} درجة)
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
                  <Label>الدرجات المكتسبة *</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    max={selectedActionType?.max_points || 20}
                    value={formData.points_earned}
                    onChange={(e) => setFormData({...formData, points_earned: parseInt(e.target.value)})}
                  />
                  {selectedActionType && (
                    <p className="text-xs text-gray-500">الحد الأقصى: {selectedActionType.max_points} درجة</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>الشواهد والأدلة</Label>
                  <Textarea
                    value={formData.evidence}
                    onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                    placeholder="وصف الشواهد التي تثبت قيام الطالب بالنشاط..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
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