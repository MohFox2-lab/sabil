import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserCheck, Plus, X, Save, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LeaveRequest() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    leave_time: '',
    return_time: '',
    reason: '',
    guardian_notified: false
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  // قائمة وهمية للاستئذانات (يمكن استبدالها بـ entity حقيقي)
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      student_name: 'أحمد محمد',
      date: new Date().toISOString().split('T')[0],
      leave_time: '09:30',
      return_time: '10:30',
      reason: 'موعد طبي',
      status: 'approved'
    }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.student_id);
    
    const newRequest = {
      id: Date.now(),
      student_name: student?.full_name,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      status: 'approved'
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setShowForm(false);
    setFormData({
      student_id: '',
      leave_time: '',
      return_time: '',
      reason: '',
      guardian_notified: false
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الاستئذان</h1>
          <p className="text-gray-600 mt-1">إدارة طلبات الاستئذان للطلاب</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-5 h-5 ml-2" />
          تسجيل استئذان جديد
        </Button>
      </div>

      {/* Leave Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {leaveRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">{request.student_name}</h3>
                    <Badge className="bg-green-600">موافق عليه</Badge>
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      من الساعة {request.leave_time} إلى {request.return_time}
                    </p>
                    <p>السبب: {request.reason}</p>
                    <p className="text-xs text-gray-400">
                      التاريخ: {new Date(request.date).toLocaleDateString('ar-SA')}
                    </p>
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
          <Card className="w-full max-w-2xl">
            <CardHeader className="bg-blue-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-6 h-6" />
                  تسجيل استئذان
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="text-white hover:bg-blue-500">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>وقت الخروج *</Label>
                    <Input
                      type="time"
                      required
                      value={formData.leave_time}
                      onChange={(e) => setFormData({...formData, leave_time: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>وقت العودة المتوقع</Label>
                    <Input
                      type="time"
                      value={formData.return_time}
                      onChange={(e) => setFormData({...formData, return_time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>سبب الاستئذان *</Label>
                  <Textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="اذكر سبب الاستئذان..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="guardian_notified"
                    checked={formData.guardian_notified}
                    onChange={(e) => setFormData({...formData, guardian_notified: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="guardian_notified">تم إبلاغ ولي الأمر</Label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 ml-2" />
                    حفظ الاستئذان
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