import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Award, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ReportsTab() {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list(),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  // Incidents by degree
  const incidentsByDegree = [1, 2, 3, 4, 5].map(degree => ({
    name: `الدرجة ${degree}`,
    العدد: incidents.filter(i => i.degree === degree).length
  }));

  // Students by behavior score range
  const behaviorDistribution = [
    { name: 'ممتاز (90-100)', العدد: students.filter(s => (s.behavior_score + s.distinguished_score) >= 90).length },
    { name: 'جيد جداً (80-89)', العدد: students.filter(s => {
      const total = s.behavior_score + s.distinguished_score;
      return total >= 80 && total < 90;
    }).length },
    { name: 'جيد (70-79)', العدد: students.filter(s => {
      const total = s.behavior_score + s.distinguished_score;
      return total >= 70 && total < 80;
    }).length },
    { name: 'يحتاج تحسين (أقل من 70)', العدد: students.filter(s => (s.behavior_score + s.distinguished_score) < 70).length }
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  // Most common misconducts
  const misconductCounts = {};
  incidents.forEach(inc => {
    misconductCounts[inc.misconduct_title] = (misconductCounts[inc.misconduct_title] || 0) + 1;
  });
  
  const topMisconducts = Object.entries(misconductCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([title, count]) => ({ المخالفة: title, العدد: count }));

  // Top students
  const topStudents = [...students]
    .sort((a, b) => (b.behavior_score + b.distinguished_score) - (a.behavior_score + a.distinguished_score))
    .slice(0, 10);

  // Students needing attention
  const studentsNeedingAttention = students
    .filter(s => (s.behavior_score + s.distinguished_score) < 70)
    .sort((a, b) => (a.behavior_score + a.distinguished_score) - (b.behavior_score + b.distinguished_score))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">إجمالي المخالفات</p>
            <p className="text-4xl font-bold">{incidents.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">أنواع المخالفات</p>
            <p className="text-4xl font-bold">{misconductTypes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">متوسط السلوك</p>
            <p className="text-4xl font-bold">
              {students.length > 0 
                ? Math.round(students.reduce((sum, s) => sum + (s.behavior_score || 0) + (s.distinguished_score || 0), 0) / students.length)
                : 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm opacity-90 mb-1">طلاب متميزون</p>
            <p className="text-4xl font-bold">
              {students.filter(s => (s.behavior_score + s.distinguished_score) >= 90).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-red-50 to-orange-50 border-b-2">
            <CardTitle>المخالفات حسب الدرجة</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentsByDegree}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="العدد" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b-2">
            <CardTitle>توزيع مستويات السلوك</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={behaviorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.العدد}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="العدد"
                >
                  {behaviorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {topMisconducts.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-l from-orange-50 to-red-50 border-b-2">
              <CardTitle>أكثر المخالفات تكراراً</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topMisconducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="المخالفة" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="العدد" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top and Bottom Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-2 border-emerald-200">
          <CardHeader className="bg-emerald-50 border-b-2">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5" />
              الطلاب الأكثر التزاماً
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {topStudents.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{student.full_name}</p>
                      <p className="text-sm text-gray-600">{student.grade_level} {student.grade_class}{student.class_division}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-bold text-emerald-600">
                      {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                    </p>
                    <p className="text-xs text-gray-500">من 100</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2 border-red-200">
          <CardHeader className="bg-red-50 border-b-2">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              طلاب يحتاجون متابعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {studentsNeedingAttention.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <p className="text-emerald-600 font-semibold">جميع الطلاب في وضع جيد!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studentsNeedingAttention.map((student, idx) => (
                  <div key={student.id} className="p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{student.full_name}</p>
                          <p className="text-sm text-gray-600">{student.grade_level} {student.grade_class}{student.class_division}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-red-600">
                          {(student.behavior_score || 0) + (student.distinguished_score || 0)}
                        </p>
                        <p className="text-xs text-gray-500">من 100</p>
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