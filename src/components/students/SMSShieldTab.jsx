import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileUp, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Save,
  Eye,
  UserCheck
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

  // Placeholder student data
  const students = [
    { id: 1, name: 'أحمد محمد' },
    { id: 2, name: 'فاطمة علي' },
    { id: 3, name: 'عمر خالد' },
  ];

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

  const handleSendMessage = () => {
    console.log('إرسال رسالة:', { messageText, recipient, chosenStudents });
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
                  <Label className="cursor-pointer">خدمة ثانية</Label>
                </div>
              </div>

              <Button onClick={handleSendMessage} className="w-full bg-green-600 hover:bg-green-700">
                إرسال
              </Button>
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
    </div>
  );
}