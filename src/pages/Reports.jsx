import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export default function Reports() {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list(),
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['absences'],
    queryFn: () => base44.entities.Absence.list(),
  });

  // Incidents by degree
  const incidentsByDegree = [1, 2, 3, 4, 5].map(degree => ({
    name: `الدرجة ${degree}`,
    count: incidents.filter(i => i.degree === degree).length
  }));

  // Students by grade level
  const studentsByLevel = ['ابتدائي', 'متوسط', 'ثانوي'].map(level => ({
    name: level,
    count: students.filter(s => s.grade_level === level).length
  }));

  // Behavior score distribution
  const behaviorDistribution = [
    { name: 'ممتاز (90-100)', count: students.filter(s => (s.behavior_score + s.distinguished_score) >= 90).length },
    { name: 'جيد جداً (80-89)', count: students.filter(s => (s.behavior_score + s.distinguished_score) >= 80 && (s.behavior_score + s.distinguished_score) < 90).length },
    { name: 'جيد (70-79)', count: students.filter(s => (s.behavior_score + s.distinguished_score) >= 70 && (s.behavior_score + s.distinguished_score) < 80).length },
    { name: 'مقبول (أقل من 70)', count: students.filter(s => (s.behavior_score + s.distinguished_score) < 70).length }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Top 10 students
  const topStudents = [...students]
    .sort((a, b) => (b.behavior_score + b.distinguished_score) - (a.behavior_score + a.distinguished_score))
    .slice(0, 10);

  // Students needing attention
  const studentsNeedingAttention = students
    .filter(s => (s.behavior_score + s.distinguished_score) < 70 || s.attendance_score < 80)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <FileBarChart className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
            <p className="text-indigo-100 mt-1">تحليل شامل لسلوك ومواظبة الطلاب</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>المخالفات حسب الدرجة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsByDegree}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الطلاب حسب المرحلة</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={studentsByLevel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {studentsByLevel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>توزيع درجات السلوك</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behaviorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <TrendingUp className="w-5 h-5" />
              أفضل 10 طلاب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{student.full_name}</p>
                      <p className="text-xs text-gray-600">{student.grade_level} {student.grade_class}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-emerald-600">
                      {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              طلاب يحتاجون متابعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {studentsNeedingAttention.length === 0 ? (
              <p className="text-center text-gray-500 py-8">جميع الطلاب في وضع جيد</p>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map((student) => (
                  <div key={student.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-xs text-gray-600">{student.grade_level} {student.grade_class}</p>
                      </div>
                      <div className="text-left space-y-1">
                        <p className="text-sm">
                          السلوك: <span className="font-bold text-red-600">
                            {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                          </span>
                        </p>
                        <p className="text-sm">
                          المواظبة: <span className="font-bold text-red-600">
                            {student.attendance_score || 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}