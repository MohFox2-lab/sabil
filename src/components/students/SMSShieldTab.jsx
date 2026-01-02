import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileUp, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Save,
  Eye,
  UserCheck,
  Bell,
  History,
  Send
} from 'lucide-react';

export default function SMSShieldTab() {
  const [gradeText, setGradeText] = useState('');
  const [classText, setClassText] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [chosenStudents, setChosenStudents] = useState([]);
  const [recipient, setRecipient] = useState('parent');
  const [messageText, setMessageText] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [messageService, setMessageService] = useState('sms');
  const [readyMessage, setReadyMessage] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const queryClient = useQueryClient();

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 50),
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Message.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText('');
      setChosenStudents([]);
      setSelectedStudents([]);
    },
  });

  // Calendar data
  const currentMonth = 'December';
  const currentYear = 2025;
  const daysInMonth = 31;

  const handleSelectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleChooseSelected = () => {
    const selected = students.filter(s => selectedStudents.includes(s.id));
    setChosenStudents([...chosenStudents, ...selected.filter(s => !chosenStudents.find(cs => cs.id === s.id))]);
  };

  const handleRemoveAll = () => {
    setChosenStudents([]);
  };

  const handleRemoveSelected = () => {
    const selectedIds = selectedStudents;
    setChosenStudents(chosenStudents.filter(s => !selectedIds.includes(s.id)));
    setSelectedStudents([]);
  };

  const handleShowClass = () => {
    console.log('عرض الفصل:', gradeText, classText);
  };

  const handleSendMessage = async () => {
    if (!messageText || chosenStudents.length === 0) {
      return;
    }

    const messageData = {
      message_text: messageText,
      recipient_type: recipient,
      student_ids: chosenStudents.map(s => s.student_id),
      student_names: chosenStudents.map(s => s.full_name),
      message_service: messageService,
      scheduled_date: selectedDate ? `2025-12-${selectedDate}` : null,
      sent_date: new Date().toISOString(),
      status: 'sent',
      push_notification_enabled: pushEnabled,
      sender_name: 'النظام'
    };

    sendMessage.mutate(messageData);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* القسم الأيسر - قائمة الأسماء المختارة */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">قائمة الأسماء المختارة</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border rounded-lg h-96 overflow-y-auto p-2 bg-white">
                {chosenStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا يوجد طلاب محددين</p>
                ) : (
                  <div className="space-y-2">
                    {chosenStudents.map(student => (
                      <div key={student.id} className="p-2 bg-gray-50 hover:bg-gray-100 rounded">
                        {student.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* القسم الأوسط - اختيار الطلاب */}
        <div className="lg:col-span-6 space-y-4">
          {/* عوامل اختيار الطلاب */}
          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-lg">عوامل اختيار الطلاب</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>الصف:</Label>
                  <Input
                    value={gradeText}
                    onChange={(e) => setGradeText(e.target.value)}
                    placeholder="مثال: الأول أو 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفصل:</Label>
                  <Input
                    value={classText}
                    onChange={(e) => setClassText(e.target.value)}
                    placeholder="مثال: أ أو A"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleShowClass} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    عرض
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* قائمة الطلاب */}
          <Card>
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">اختيار الاسم</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedStudents.length === students.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSelectAll();
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                  />
                  <Label className="cursor-pointer">تحديد الكل</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="border rounded-lg p-3 bg-white max-h-64 overflow-y-auto">
                <div className="space-y-2">
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
                      <label className="cursor-pointer flex-1">{student.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleChooseSelected} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  &lt;&lt; اختيار
                </Button>
                <Button onClick={handleRemoveAll} variant="destructive" className="flex-1">
                  حذف الكل
                </Button>
                <Button onClick={handleRemoveSelected} variant="outline" className="flex-1">
                  حذف المحدد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* القسم الأيمن - التوجيه والجدولة */}
        <div className="lg:col-span-3 space-y-4">
          {/* توجيه الرسالة */}
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-lg">توجيه الرسالة إلى:</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup value={recipient} onValueChange={setRecipient}>
                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent" className="cursor-pointer">ولي أمر الطالب</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="cursor-pointer">الطالب</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* إرسال رسائل بالمجموعات */}
          <Card>
            <CardHeader className="bg-pink-50">
              <CardTitle className="text-lg">إرسال رسائل بالمجموعات</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Calendar */}
              <div className="border rounded-lg p-3 bg-white">
                <div className="text-center font-bold mb-2">
                  {currentMonth} {currentYear}
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['S', 'S', 'M', 'T', 'W', 'T', 'F'].map((day, i) => (
                    <div key={i} className="text-center font-semibold p-1 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div 
                      key={day} 
                      className={`text-center p-1 hover:bg-blue-100 cursor-pointer rounded border ${
                        selectedDate === day ? 'bg-blue-500 text-white' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Buttons */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full text-sm">
                  إرسال رسائل للطلاب في اليوم المحدد
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  إرسال رسائل للمعلمين في اليوم المحدد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* نص الرسالة وخيارات الإرسال */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-lg">نص الرسالة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="اكتب نص الرسالة هنا..."
                rows={6}
                className="resize-none"
              />
              
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      checked={messageService === 'sms'}
                      onCheckedChange={(checked) => setMessageService(checked ? 'sms' : '')}
                    />
                    <Label className="cursor-pointer">رسالة نصية قصيرة</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      checked={messageService === 'whatsapp'}
                      onCheckedChange={(checked) => setMessageService(checked ? 'whatsapp' : '')}
                    />
                    <Label className="cursor-pointer">واتساب</Label>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Checkbox 
                    checked={pushEnabled}
                    onCheckedChange={setPushEnabled}
                  />
                  <Bell className="w-5 h-5 text-blue-600" />
                  <Label className="cursor-pointer font-semibold text-blue-900">
                    تفعيل الإشعارات الفورية (Push Notifications)
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                  disabled={sendMessage.isPending || !messageText || chosenStudents.length === 0}
                >
                  <Send className="w-4 h-4" />
                  إرسال
                </Button>
                <Button 
                  onClick={() => setShowHistory(true)} 
                  variant="outline"
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  السجل
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="bg-indigo-50">
              <CardTitle className="text-lg">رسالة جاهزة</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Select value={readyMessage} onValueChange={setReadyMessage}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر رسالة جاهزة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">رسالة ترحيب</SelectItem>
                  <SelectItem value="absence">إشعار غياب</SelectItem>
                  <SelectItem value="misconduct">إشعار مخالفة</SelectItem>
                  <SelectItem value="excellence">إشعار تميز</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" className="gap-2">
              إخراج من النظام
            </Button>
            <Button variant="outline" className="gap-2">
              عدد الطلاب
            </Button>
            <Button variant="outline" className="gap-2">
              عدد المخالفات السلوكية
            </Button>
            <Button variant="outline" className="gap-2">
              إخراج بيانات الغياب
            </Button>
            <Button variant="outline" className="gap-2">
              إخراج درجات الطلاب
            </Button>
            <Button variant="outline" className="gap-2">
              إرجاع من الآخر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-3">
          <p className="text-sm text-center text-gray-600">
            استعراض بيانات الطلاب المختارين وإرسال رسائل مجملة وتفصيلية لكل طالب
          </p>
        </CardContent>
      </Card>

      {/* Message History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader className="bg-blue-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  سجل الرسائل
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowHistory(false)}
                  className="text-white hover:bg-blue-500"
                >
                  <Eye className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد رسائل مسجلة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={
                                message.status === 'sent' ? 'bg-green-600' :
                                message.status === 'pending' ? 'bg-yellow-600' :
                                'bg-red-600'
                              }>
                                {message.status === 'sent' ? 'تم الإرسال' :
                                 message.status === 'pending' ? 'قيد الإرسال' :
                                 'فشل'}
                              </Badge>
                              <Badge variant="outline">
                                {message.recipient_type === 'parent' ? 'ولي الأمر' :
                                 message.recipient_type === 'student' ? 'الطالب' :
                                 'المعلم'}
                              </Badge>
                              {message.push_notification_enabled && (
                                <Badge className="bg-blue-600 gap-1">
                                  <Bell className="w-3 h-3" />
                                  إشعار فوري
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-800 mb-2">{message.message_text}</p>
                            <div className="text-sm text-gray-600">
                              <p>المستقبلين: {message.student_names?.join('، ') || 'غير محدد'}</p>
                              <p>الخدمة: {
                                message.message_service === 'sms' ? 'رسالة نصية' :
                                message.message_service === 'whatsapp' ? 'واتساب' :
                                message.message_service === 'push' ? 'إشعار فوري' : 
                                message.message_service
                              }</p>
                            </div>
                          </div>
                          <div className="text-left text-sm text-gray-500">
                            <p>{new Date(message.created_date).toLocaleDateString('ar-SA')}</p>
                            <p>{new Date(message.created_date).toLocaleTimeString('ar-SA')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}