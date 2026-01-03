import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar, Search, TrendingDown, AlertCircle } from 'lucide-react';

export default function StudentMisconductHistoryTab() {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: allIncidents = [] } = useQuery({
    queryKey: ['behavior-incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list('-date'),
  });

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  
  const studentIncidents = allIncidents.filter(
    inc => inc.student_id === selectedStudent?.student_id
  );

  const incidentsByDegree = studentIncidents.reduce((acc, inc) => {
    if (!acc[inc.degree]) acc[inc.degree] = [];
    acc[inc.degree].push(inc);
    return acc;
  }, {});

  const totalDeducted = studentIncidents.reduce((sum, inc) => sum + (inc.points_deducted || 0), 0);

  const degreeColors = {
    1: 'bg-blue-600',
    2: 'bg-yellow-600',
    3: 'bg-orange-600',
    4: 'bg-red-600',
    5: 'bg-purple-600'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            سجل المخالفات السلوكية للطالب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>بحث عن طالب</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="اسم الطالب أو رقمه..."
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>اختر الطالب</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر طالب" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - {student.grade_level} {student.grade_class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <>
          <Card className="bg-gradient-to-l from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">الطالب</p>
                  <p className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">إجمالي المخالفات</p>
                  <p className="text-3xl font-bold text-red-600">{studentIncidents.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">النقاط المحسومة</p>
                  <p className="text-3xl font-bold text-orange-600">-{totalDeducted}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">رصيد السلوك الحالي</p>
                  <p className={`text-3xl font-bold ${
                    selectedStudent.behavior_score >= 70 ? 'text-green-600' :
                    selectedStudent.behavior_score >= 50 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {selectedStudent.behavior_score || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">الحالة</p>
                  {studentIncidents.filter(i => i.degree >= 4).length > 0 ? (
                    <Badge className="bg-red-600 text-lg px-3 py-1">حرج ⚠️</Badge>
                  ) : studentIncidents.length > 5 ? (
                    <Badge className="bg-orange-600 text-lg px-3 py-1">متابعة</Badge>
                  ) : (
                    <Badge className="bg-green-600 text-lg px-3 py-1">جيد ✓</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(degree => (
              <Card key={degree}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">الدرجة {degree}</p>
                  <p className={`text-4xl font-bold ${degreeColors[degree].replace('bg-', 'text-')}`}>
                    {incidentsByDegree[degree]?.length || 0}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {studentIncidents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">سجل نظيف! ✨</h3>
                <p className="text-gray-600">لا توجد مخالفات سلوكية مسجلة لهذا الطالب</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  سجل المخالفات ({studentIncidents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentIncidents.map((incident, idx) => (
                    <div 
                      key={incident.id} 
                      className={`border-r-4 ${degreeColors[incident.degree].replace('bg-', 'border-')} bg-white rounded-lg p-4 hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={degreeColors[incident.degree]}>
                              الدرجة {incident.degree}
                            </Badge>
                            <Badge variant="outline">
                              الإجراء {incident.procedure_number || 1}
                            </Badge>
                            <Badge className="bg-red-100 text-red-800">
                              <TrendingDown className="w-3 h-3 ml-1" />
                              -{incident.points_deducted} درجة
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg mb-1">{incident.misconduct_title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <Calendar className="w-3 h-3 inline ml-1" />
                            {new Date(incident.date).toLocaleDateString('ar-SA')} - {incident.day_of_week}
                          </p>
                          {incident.actions_taken && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                              <p className="text-xs font-semibold text-blue-800">الإجراءات المتخذة:</p>
                              <p className="text-xs text-gray-700">{incident.actions_taken}</p>
                            </div>
                          )}
                          {incident.notes && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-2">
                              <p className="text-xs font-semibold text-gray-700">ملاحظات:</p>
                              <p className="text-xs text-gray-600">{incident.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          #{studentIncidents.length - idx}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}