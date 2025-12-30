import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Award, AlertTriangle, Calendar, FileSignature, TrendingUp, User } from 'lucide-react';

export default function StudentRecordTab() {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const { data: incidents = [] } = useQuery({
    queryKey: ['student-incidents', selectedStudentId],
    queryFn: () => selectedStudent 
      ? base44.entities.BehaviorIncident.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const { data: positiveActions = [] } = useQuery({
    queryKey: ['student-positive', selectedStudentId],
    queryFn: () => selectedStudent
      ? base44.entities.StudentPositiveAction.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['student-absences', selectedStudentId],
    queryFn: () => selectedStudent
      ? base44.entities.Absence.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const { data: pledges = [] } = useQuery({
    queryKey: ['student-pledges', selectedStudentId],
    queryFn: () => selectedStudent
      ? base44.entities.WrittenPledge.filter({ student_id: selectedStudent.student_id }, '-date')
      : Promise.resolve([]),
    enabled: !!selectedStudent,
  });

  const timeline = [
    ...incidents.map(i => ({ ...i, type: 'incident', date: i.date })),
    ...positiveActions.map(p => ({ ...p, type: 'positive', date: p.date })),
    ...absences.map(a => ({ ...a, type: 'absence', date: a.date })),
    ...pledges.map(p => ({ ...p, type: 'pledge', date: p.date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <User className="w-6 h-6" />
            اختيار الطالب
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger className="text-lg">
              <SelectValue placeholder="اختر طالباً لعرض سجله الكامل" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.full_name} - {student.grade_level} {student.grade_class}{student.class_division} - رصيد: {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Student Summary */}
      {selectedStudent && (
        <Card className="bg-gradient-to-l from-emerald-50 to-teal-50 shadow-xl border-2 border-emerald-300">
          <CardHeader>
            <CardTitle className="text-2xl text-emerald-900">{selectedStudent.full_name}</CardTitle>
            <p className="text-emerald-700">
              {selectedStudent.grade_level} - الصف {selectedStudent.grade_class}{selectedStudent.class_division}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">السلوك الكلي</p>
                <p className="text-4xl font-bold text-blue-600">
                  {(selectedStudent.behavior_score || 0) + (selectedStudent.distinguished_score || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">من 100</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-emerald-200">
                <Award className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600 mb-1">الإيجابي</p>
                <p className="text-2xl font-bold text-emerald-600">{selectedStudent.behavior_score || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-amber-200">
                <TrendingUp className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600 mb-1">المتميز</p>
                <p className="text-2xl font-bold text-amber-600">{selectedStudent.distinguished_score || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-purple-200">
                <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600 mb-1">المواظبة</p>
                <p className="text-2xl font-bold text-purple-600">{selectedStudent.attendance_score || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg border-2 border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600 mb-1">المخالفات</p>
                <p className="text-2xl font-bold text-red-600">{incidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {selectedStudent && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b-2">
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              الخط الزمني الكامل ({timeline.length} حدث)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {timeline.length === 0 ? (
              <p className="text-center text-gray-500 py-12">لا توجد أحداث مسجلة لهذا الطالب</p>
            ) : (
              <div className="space-y-6">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pr-8 pb-6 border-r-4 border-gray-300 last:border-0 last:pb-0">
                    <div className="absolute right-0 top-0 transform translate-x-1/2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${
                        item.type === 'incident' ? 'bg-red-500' :
                        item.type === 'positive' ? 'bg-emerald-500' :
                        item.type === 'absence' ? 'bg-amber-500' :
                        'bg-indigo-500'
                      }`}>
                        {item.type === 'incident' && <AlertTriangle className="w-4 h-4 text-white" />}
                        {item.type === 'positive' && <Award className="w-4 h-4 text-white" />}
                        {item.type === 'absence' && <Calendar className="w-4 h-4 text-white" />}
                        {item.type === 'pledge' && <FileSignature className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    <Card className={`mr-6 shadow-md border-2 ${
                      item.type === 'incident' ? 'bg-red-50 border-red-200' :
                      item.type === 'positive' ? 'bg-emerald-50 border-emerald-200' :
                      item.type === 'absence' ? 'bg-amber-50 border-amber-200' :
                      'bg-indigo-50 border-indigo-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge className={`mb-2 ${
                              item.type === 'incident' ? 'bg-red-600' :
                              item.type === 'positive' ? 'bg-emerald-600' :
                              item.type === 'absence' ? 'bg-amber-600' :
                              'bg-indigo-600'
                            }`}>
                              {item.type === 'incident' ? '⚠️ مخالفة سلوكية' :
                               item.type === 'positive' ? '⭐ سلوك متميز' :
                               item.type === 'absence' ? '📅 غياب' :
                               '📝 تعهد خطي'}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {new Date(item.date).toLocaleDateString('ar-SA', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday: 'long'
                              })}
                            </p>
                          </div>
                          {(item.type === 'incident' || item.type === 'positive') && (
                            <div className={`px-4 py-2 rounded-full font-bold text-xl shadow-lg ${
                              item.type === 'incident' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                            }`}>
                              {item.type === 'incident' ? `-${item.points_deducted}` : `+${item.points_earned}`}
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-800 text-lg mb-2">
                          {item.misconduct_title || item.positive_action_title || item.excuse_type || item.type}
                        </h4>

                        {(item.actions_taken || item.evidence || item.notes || item.content) && (
                          <p className="text-sm text-gray-700 mb-2 bg-white p-3 rounded-lg">
                            {item.actions_taken || item.evidence || item.notes || item.content}
                          </p>
                        )}

                        {item.type === 'incident' && item.procedure_number && (
                          <Badge variant="outline" className="mt-2">
                            الإجراء رقم {item.procedure_number}
                          </Badge>
                        )}

                        {item.type === 'absence' && (
                          <Badge className={item.has_excuse ? 'bg-green-600' : 'bg-red-600'}>
                            {item.has_excuse ? 'بعذر' : 'بدون عذر'}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}