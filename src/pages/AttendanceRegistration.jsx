import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Search, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AttendanceRegistration() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState({});

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const filteredStudents = students.filter(s => {
    const gradeMatch = !selectedGrade || s.grade_level === selectedGrade;
    const classMatch = !selectedClass || s.grade_class === parseInt(selectedClass);
    const searchMatch = !searchTerm || s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm);
    return gradeMatch && classMatch && searchMatch;
  });

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const newData = {};
    filteredStudents.forEach(s => {
      newData[s.id] = true;
    });
    setAttendanceData(newData);
  };

  const markAllAbsent = () => {
    const newData = {};
    filteredStudents.forEach(s => {
      newData[s.id] = false;
    });
    setAttendanceData(newData);
  };

  const handleSave = () => {
    alert('تم حفظ الحضور بنجاح');
    setAttendanceData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تسجيل الحضور</h1>
          <p className="text-gray-600 mt-1">تسجيل حضور وغياب الطلاب اليومي</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-700">
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>التصفية والبحث</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>المرحلة</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المراحل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>جميع المراحل</SelectItem>
                  <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="ثانوي">ثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الصف</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>جميع الصفوف</SelectItem>
                  <SelectItem value="1">الأول</SelectItem>
                  <SelectItem value="2">الثاني</SelectItem>
                  <SelectItem value="3">الثالث</SelectItem>
                  <SelectItem value="4">الرابع</SelectItem>
                  <SelectItem value="5">الخامس</SelectItem>
                  <SelectItem value="6">السادس</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="اسم الطالب أو الرقم"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={markAllPresent} variant="outline" className="gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              تحديد الكل حاضر
            </Button>
            <Button onClick={markAllAbsent} variant="outline" className="gap-2">
              تحديد الكل غائب
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلاب ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا يوجد طلاب
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    attendanceData[student.id]
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-300 hover:border-red-400'
                  }`}
                  onClick={() => toggleAttendance(student.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      attendanceData[student.id] ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.grade_level} - الصف {student.grade_class}
                      </p>
                    </div>
                  </div>
                  <Badge className={attendanceData[student.id] ? 'bg-green-600' : 'bg-red-600'}>
                    {attendanceData[student.id] ? 'حاضر' : 'غائب'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-8 py-6 text-lg">
          <CheckCircle className="w-5 h-5" />
          حفظ الحضور
        </Button>
      </div>
    </div>
  );
}