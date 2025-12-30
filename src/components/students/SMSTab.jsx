import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Send, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SMSTab() {
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSendSMS = () => {
    if (!message.trim()) {
      alert('الرجاء كتابة نص الرسالة');
      return;
    }
    if (selectedStudents.length === 0) {
      alert('الرجاء اختيار طالب واحد على الأقل');
      return;
    }
    
    alert(`سيتم إرسال الرسالة إلى ${selectedStudents.length} طالب\n\nملاحظة: يتطلب تفعيل خدمة الرسائل النصية`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            إرسال رسالة نصية
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>نص الرسالة</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={5}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">عدد الأحرف: {message.length}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">اختيار المستلمين</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label>تحديد الكل ({students.length})</Label>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <div>
                          <p className="font-semibold">{student.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {student.guardian_phone || 'لا يوجد رقم جوال'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {student.grade_level} {student.grade_class}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>المحدد: {selectedStudents.length} من {students.length}</span>
            </div>
            <Button 
              onClick={handleSendSMS}
              className="bg-purple-600 hover:bg-purple-700 gap-2"
            >
              <Send className="w-4 h-4" />
              إرسال الرسالة
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>ملاحظة:</strong> لاستخدام خدمة الرسائل النصية، يجب تفعيل الخدمة من خلال الإعدادات وربطها بمزود خدمة الرسائل.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}