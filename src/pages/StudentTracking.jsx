import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Award, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

export default function StudentTracking() {
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

  // Combine all activities and sort by date
  const timeline = [
    ...incidents.map(i => ({ ...i, type: 'incident', date: i.date })),
    ...positiveActions.map(p => ({ ...p, type: 'positive', date: p.date })),
    ...absences.map(a => ({ ...a, type: 'absence', date: a.date })),
    ...pledges.map(p => ({ ...p, type: 'pledge', date: p.date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">سجل متابعة الطلاب</h1>
        <p className="text-gray-600 mt-1">خط زمني شامل لجميع الأنشطة والأحداث</p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">اختر الطالب</label>
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر طالباً لعرض سجله" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} - {student.grade_level} {student.grade_class} - {student.class_division}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student Summary */}
      {selectedStudent && (
        <Card className="bg-gradient-to-l from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedStudent.full_name}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">السلوك الكلي</p>
                <p className="text-3xl font-bold text-blue-600">
                  {(selectedStudent.behavior_score || 0) + (selectedStudent.distinguished_score || 0)}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">المواظبة</p>
                <p className="text-3xl font-bold text-purple-600">{selectedStudent.attendance_score || 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">المخالفات</p>
                <p className="text-3xl font-bold text-red-600">{incidents.length}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">السلوك المتميز</p>
                <p className="text-3xl font-bold text-emerald-600">{positiveActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              الخط الزمني للأنشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {timeline.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد أنشطة مسجلة لهذا الطالب</p>
            ) : (
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={idx} className="relative pr-8 pb-8 border-r-2 border-gray-200 last:border-0 last:pb-0">
                    <div className="absolute right-0 top-0 transform translate-x-1/2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.type === 'incident' ? 'bg-red-500' :
                        item.type === 'positive' ? 'bg-emerald-500' :
                        item.type === 'absence' ? 'bg-amber-500' :
                        'bg-indigo-500'
                      }`}>
                        {item.type === 'incident' && <AlertTriangle className="w-3 h-3 text-white" />}
                        {item.type === 'positive' && <Award className="w-3 h-3 text-white" />}
                        {item.type === 'absence' && <Calendar className="w-3 h-3 text-white" />}
                        {item.type === 'pledge' && <ClipboardList className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className={`mr-4 p-4 rounded-lg ${
                      item.type === 'incident' ? 'bg-red-50 border border-red-200' :
                      item.type === 'positive' ? 'bg-emerald-50 border border-emerald-200' :
                      item.type === 'absence' ? 'bg-amber-50 border border-amber-200' :
                      'bg-indigo-50 border border-indigo-200'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className={
                            item.type === 'incident' ? 'bg-red-600' :
                            item.type === 'positive' ? 'bg-emerald-600' :
                            item.type === 'absence' ? 'bg-amber-600' :
                            'bg-indigo-600'
                          }>
                            {item.type === 'incident' ? 'مخالفة سلوكية' :
                             item.type === 'positive' ? 'سلوك متميز' :
                             item.type === 'absence' ? 'غياب' :
                             'تعهد خطي'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        {(item.type === 'incident' || item.type === 'positive') && (
                          <div className={`px-3 py-1 rounded-full font-bold ${
                            item.type === 'incident' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {item.type === 'incident' ? `-${item.points_deducted}` : `+${item.points_earned}`}
                          </div>
                        )}
                      </div>

                      <p className="font-semibold text-gray-800">
                        {item.misconduct_title || item.positive_action_title || item.excuse_type || item.type}
                      </p>

                      {(item.actions_taken || item.evidence || item.notes || item.content) && (
                        <p className="text-sm text-gray-600 mt-2">
                          {item.actions_taken || item.evidence || item.notes || item.content}
                        </p>
                      )}
                    </div>
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