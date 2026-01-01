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
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [messageType, setMessageType] = useState('نصية');
  const [recipient, setRecipient] = useState('parent');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [messageData, setMessageData] = useState({
    from: '',
    to: '',
    content: ''
  });

  // Placeholder data
  const grades = ['الأول', 'الثاني', 'الثالث'];
  const classes = ['أ', 'ب', 'ج'];
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

  const handleShowClass = () => {
    // Placeholder function to load class students
    console.log('عرض الفصل:', selectedGrade, selectedClass);
  };

  const handleSendMessage = () => {
    // Placeholder function to send message
    console.log('إرسال رسالة:', messageData);
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* القسم الأيسر - Left Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* قائمة الفصول والطلاب */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">قائمة فصول و أسماء الطلاب</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border rounded-lg h-48 overflow-y-auto p-2 mb-4 bg-gray-50">
                {students.map(student => (
                  <div key={student.id} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                    {student.name}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2">
                  <Eye className="w-4 h-4" />
                  إظهار
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <Save className="w-4 h-4" />
                  حفظ الكل
                </Button>
                <Button variant="outline" className="w-full gap-2">
                  <UserCheck className="w-4 h-4" />
                  حفظ لمعلم
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* بيانات الرسالة */}
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-lg">بيانات الرسالة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label>من:</Label>
                <Input 
                  value={messageData.from}
                  onChange={(e) => setMessageData({...messageData, from: e.target.value})}
                  placeholder="اسم المرسل"
                />
              </div>
              <div className="space-y-2">
                <Label>إلى:</Label>
                <Input 
                  value={messageData.to}
                  onChange={(e) => setMessageData({...messageData, to: e.target.value})}
                  placeholder="اسم المستقبل"
                />
              </div>
              <div className="space-y-2">
                <Label>نوع الرسالة:</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نصية">نصية</SelectItem>
                    <SelectItem value="إنذار">إنذار</SelectItem>
                    <SelectItem value="متابعة">متابعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>محتوى الرسالة:</Label>
                <Textarea
                  value={messageData.content}
                  onChange={(e) => setMessageData({...messageData, content: e.target.value})}
                  placeholder="اكتب محتوى الرسالة هنا..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* القسم الأوسط - Middle Section */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-lg">تحديد الصف والفصل والطلاب</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>الصف:</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الفصل:</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleShowClass} className="w-full">
                    عرض
                  </Button>
                </div>
              </div>

              {/* قائمة الطلاب */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">الفصل</h3>
                  <Button 
                    variant="link" 
                    onClick={handleSelectAll}
                    className="text-blue-600"
                  >
                    تحديد الكل
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
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
            </CardContent>
          </Card>
        </div>

        {/* القسم الأيمن - Right Section */}
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
                  <Label htmlFor="student" className="cursor-pointer">الطلاب</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* الجدولة */}
          <Card>
            <CardHeader className="bg-pink-50">
              <CardTitle className="text-lg">رسائل الطلاب المجدولة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Calendar */}
              <div className="border rounded-lg p-3 bg-white">
                <div className="text-center font-bold mb-2">
                  {currentMonth} {currentYear}
                </div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                    <div key={day} className="text-center font-semibold p-1 bg-gray-100">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                    <div 
                      key={day} 
                      className="text-center p-1 hover:bg-blue-100 cursor-pointer rounded border border-gray-200"
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Options */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full text-sm">
                  إرسال رسائل جماعية في يوم محدد
                </Button>
                <Button variant="outline" className="w-full text-sm">
                  إرسال رسائل مخصصة في يوم محدد
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" className="gap-2">
              <FileUp className="w-4 h-4" />
              استيراد بيانات الطلاب
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              أنواع من الملفات
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              إدارة ملف إنجاز
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              إدارة السلوك والمخالفات
            </Button>
            <Button variant="outline" className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              إخراج إلى إكسل
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              إخراج إلى ملف
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              إخراج PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}