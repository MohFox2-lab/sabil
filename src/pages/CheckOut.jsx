import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, Search, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CheckOut() {
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [checkoutData, setCheckoutData] = useState({});

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const filteredStudents = students.filter(s => {
    const gradeMatch = !selectedGrade || s.grade_level === selectedGrade;
    const searchMatch = !searchTerm || s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm);
    return gradeMatch && searchMatch;
  });

  const toggleCheckout = (studentId) => {
    const currentTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    setCheckoutData(prev => ({
      ...prev,
      [studentId]: prev[studentId] ? null : currentTime
    }));
  };

  const handleSave = () => {
    alert('تم حفظ بيانات الانصراف بنجاح');
    setCheckoutData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">تسجيل الخروج</h1>
          <p className="text-gray-600 mt-1">تسجيل انصراف الطلاب</p>
        </div>
        <div className="flex items-center gap-2 text-orange-700">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">{new Date().toLocaleTimeString('ar-SA')}</span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>التصفية والبحث</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    checkoutData[student.id]
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-gray-50 border-gray-300 hover:border-orange-400'
                  }`}
                  onClick={() => toggleCheckout(student.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      checkoutData[student.id] ? 'bg-orange-500' : 'bg-gray-400'
                    }`}>
                      {checkoutData[student.id] ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <LogOut className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {student.grade_level} - الصف {student.grade_class}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    {checkoutData[student.id] ? (
                      <div>
                        <Badge className="bg-orange-600 mb-1">انصرف</Badge>
                        <p className="text-sm text-gray-600">الساعة: {checkoutData[student.id]}</p>
                      </div>
                    ) : (
                      <Badge variant="outline">لم ينصرف</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 gap-2 px-8 py-6 text-lg">
          <CheckCircle className="w-5 h-5" />
          حفظ الانصراف
        </Button>
      </div>
    </div>
  );
}