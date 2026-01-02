import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Bell, 
  Send, 
  Users,
  UserCheck,
  GraduationCap
} from 'lucide-react';

export default function PushNotificationsTab() {
  const [notificationData, setNotificationData] = useState({
    recipient_type: 'parent',
    message_content: '',
    title: ''
  });
  const [selectedStudents, setSelectedStudents] = useState([]);

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const sendNotification = useMutation({
    mutationFn: async (data) => {
      const messages = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          message_type: 'push_notification',
          recipient_type: data.recipient_type,
          student_id: student?.student_id,
          student_name: student?.full_name,
          recipient_email: data.recipient_type === 'parent' ? student?.guardian_email : null,
          message_content: data.message_content,
          status: 'sent',
          sent_date: new Date().toISOString(),
          sender_name: 'النظام'
        };
      });
      
      for (const msg of messages) {
        await base44.entities.SMSMessage.create(msg);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-messages'] });
      setNotificationData({ recipient_type: 'parent', message_content: '', title: '' });
      setSelectedStudents([]);
      alert('تم إرسال الإشعارات بنجاح');
    },
  });

  const handleSend = () => {
    if (!notificationData.message_content || selectedStudents.length === 0) {
      alert('يرجى إدخال المحتوى واختيار الطلاب');
      return;
    }
    sendNotification.mutate(notificationData);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-to-l from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-xl">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">الإشعارات الفورية</h3>
              <p className="text-gray-600">إرسال إشعارات فورية للمعلمين وأولياء الأمور عبر البريد الإلكتروني والتطبيق</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* إحصائيات */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أولياء أمور مسجلين</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {students.filter(s => s.guardian_email).length}
                </p>
              </div>
              <UserCheck className="w-12 h-12 text-indigo-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">طلاب نشطين</p>
                <p className="text-3xl font-bold text-emerald-600">{students.length}</p>
              </div>
              <GraduationCap className="w-12 h-12 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معلمين نشطين</p>
                <p className="text-3xl font-bold text-blue-600">-</p>
              </div>
              <Users className="w-12 h-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نموذج الإرسال */}
        <Card>
          <CardHeader className="bg-indigo-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              إرسال إشعار فوري
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>عنوان الإشعار</Label>
              <Input
                value={notificationData.title}
                onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                placeholder="مثال: تنبيه مهم"
              />
            </div>

            <div className="space-y-2">
              <Label>نوع المستلم</Label>
              <Select 
                value={notificationData.recipient_type} 
                onValueChange={(value) => setNotificationData({...notificationData, recipient_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">ولي أمر الطالب</SelectItem>
                  <SelectItem value="student">الطالب</SelectItem>
                  <SelectItem value="teacher">المعلم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>محتوى الإشعار</Label>
              <Textarea
                value={notificationData.message_content}
                onChange={(e) => setNotificationData({...notificationData, message_content: e.target.value})}
                placeholder="اكتب محتوى الإشعار هنا..."
                rows={4}
              />
            </div>

            <Button 
              onClick={handleSend} 
              disabled={sendNotification.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Bell className="w-4 h-4 ml-2" />
              إرسال الإشعار
            </Button>
          </CardContent>
        </Card>

        {/* اختيار الطلاب */}
        <Card>
          <CardHeader className="bg-purple-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              اختيار الطلاب ({selectedStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <Label>قائمة الطلاب</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedStudents.length === students.length) {
                      setSelectedStudents([]);
                    } else {
                      setSelectedStudents(students.map(s => s.id));
                    }
                  }}
                >
                  {selectedStudents.length === students.length ? 'إلغاء الكل' : 'تحديد الكل'}
                </Button>
              </div>
              
              <div className="border rounded-lg p-3 bg-white max-h-96 overflow-y-auto">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox 
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                    />
                    <label className="cursor-pointer flex-1">
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-sm text-gray-500">{student.grade_level} - الصف {student.grade_class}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}