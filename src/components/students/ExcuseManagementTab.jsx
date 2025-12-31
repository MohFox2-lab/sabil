import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Printer, Calendar as CalendarIcon } from 'lucide-react';

export default function ExcuseManagementTab() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    excuseReason: '',
    checkoutTime: '',
    returnTime: ''
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const filteredStudents = students.filter(s =>
    s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm)
  );

  const handlePrintStudent = () => {
    if (selectedStudent) {
      window.print();
    }
  };

  const handlePrintRecord = () => {
    if (selectedStudent) {
      window.print();
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handleSave = () => {
    if (selectedStudent) {
      alert('تم حفظ البيانات بنجاح');
    }
  };

  const handleDelete = () => {
    if (selectedStudent && confirm('هل أنت متأكد من الحذف؟')) {
      setSelectedStudent(null);
      setFormData({
        excuseReason: '',
        checkoutTime: '',
        returnTime: ''
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Section - Search and List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>البحث</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>غير موجود علي الاسم</Label>
            <Select
              value={selectedStudent?.id || ''}
              onValueChange={(value) => {
                const student = students.find(s => s.id === value);
                setSelectedStudent(student);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="allNames" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <p className="font-semibold">{selectedStudent.full_name}</p>
              <p className="text-sm text-gray-600">رقم: {selectedStudent.student_id}</p>
              <p className="text-sm text-gray-600">
                {selectedStudent.grade_level} - الصف {selectedStudent.grade_class}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Section - Student Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>تفاصيل الطالب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رقم الطالب</Label>
              <Input
                value={selectedStudent?.student_id || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label>اسم الطالب</Label>
              <Input
                value={selectedStudent?.full_name || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>دوافع الاستئذان</Label>
            <Textarea
              value={formData.excuseReason}
              onChange={(e) => setFormData({...formData, excuseReason: e.target.value})}
              placeholder="اكتب سبب الاستئذان..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calendar */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                التاريخ
              </Label>
              <div className="border rounded-lg p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                />
              </div>
            </div>

            {/* Time and Actions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>وقت الخروج</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={formData.checkoutTime}
                    onChange={(e) => setFormData({...formData, checkoutTime: e.target.value})}
                  />
                  <Button variant="outline" className="whitespace-nowrap">
                    تسجيل خروج
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>وقت العودة</Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={formData.returnTime}
                    onChange={(e) => setFormData({...formData, returnTime: e.target.value})}
                  />
                  <Button variant="outline" className="whitespace-nowrap">
                    تسجيل عودة
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>طباعة</Label>
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={handlePrintStudent}
                    variant="outline" 
                    className="gap-2 justify-start"
                    disabled={!selectedStudent}
                  >
                    <Printer className="w-4 h-4" />
                    طباعة للطالب المحدد
                  </Button>
                  <Button 
                    onClick={handlePrintRecord}
                    variant="outline" 
                    className="gap-2 justify-start"
                    disabled={!selectedStudent}
                  >
                    <Printer className="w-4 h-4" />
                    طباعة سجل الطالب المحدد
                  </Button>
                  <Button 
                    onClick={handlePrintAll}
                    variant="outline" 
                    className="gap-2 justify-start"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة الجميع
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleDelete}
              variant="destructive" 
              className="flex-1"
              disabled={!selectedStudent}
            >
              حذف
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!selectedStudent}
            >
              عودة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}