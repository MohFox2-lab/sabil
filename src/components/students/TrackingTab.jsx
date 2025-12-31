import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TrackingTab() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents', selectedStudent?.student_id],
    queryFn: () => selectedStudent 
      ? base44.entities.BehaviorIncident.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['absences', selectedStudent?.student_id],
    queryFn: () => selectedStudent 
      ? base44.entities.Absence.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const filteredStudents = students.filter(s =>
    s.full_name?.includes(searchTerm) || s.student_id?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">سجل متابعة الطلاب</h2>
        <p className="text-gray-600 mt-1">عرض السجل الكامل للطلاب</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختر الطالب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select
            value={selectedStudent?.id || ''}
            onValueChange={(value) => {
              const student = students.find(s => s.id === value);
              setSelectedStudent(student);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الطالب" />
            </SelectTrigger>
            <SelectContent>
              {filteredStudents.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name} - {student.grade_level} {student.grade_class}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>معلومات الطالب</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">الاسم</p>
                  <p className="font-bold text-lg">{selectedStudent.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">رقم الطالب</p>
                  <p className="font-bold text-lg">{selectedStudent.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الصف</p>
                  <p className="font-bold text-lg">{selectedStudent.grade_level} - {selectedStudent.grade_class}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">رصيد السلوك</p>
                    <p className="text-4xl font-bold text-blue-700">{selectedStudent.behavior_score || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">السلوك المتميز</p>
                    <p className="text-4xl font-bold text-purple-700">{selectedStudent.distinguished_score || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">المواظبة</p>
                    <p className="text-4xl font-bold text-green-700">{selectedStudent.attendance_score || 0}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                المخالفات السلوكية ({incidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {incidents.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد مخالفات</p>
              ) : (
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{incident.misconduct_title}</p>
                        <p className="text-sm text-gray-600">{new Date(incident.date).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <Badge className="bg-red-600">-{incident.points_deducted}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-orange-50">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-orange-600" />
                الغياب ({absences.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {absences.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد غيابات</p>
              ) : (
                <div className="space-y-3">
                  {absences.map((absence) => (
                    <div key={absence.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{new Date(absence.date).toLocaleDateString('ar-SA')}</p>
                        {absence.excuse_type && (
                          <p className="text-sm text-gray-600">العذر: {absence.excuse_type}</p>
                        )}
                      </div>
                      <Badge className={absence.has_excuse ? 'bg-green-600' : 'bg-red-600'}>
                        {absence.has_excuse ? 'بعذر' : 'بدون عذر'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}