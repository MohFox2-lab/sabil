import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Book, Database, Shield } from 'lucide-react';

export default function ApiDocumentation() {
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Book className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📘 Base44 SDK - توثيق API</h1>
          <p className="text-gray-600 mt-1">توثيق كامل لاستخدام Base44 SDK في درع المخالفات السلوكية</p>
        </div>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="auth"><Shield className="w-4 h-4 ml-2" />المصادقة</TabsTrigger>
          <TabsTrigger value="student"><Database className="w-4 h-4 ml-2" />الطلاب</TabsTrigger>
          <TabsTrigger value="incidents"><Database className="w-4 h-4 ml-2" />المخالفات</TabsTrigger>
          <TabsTrigger value="absence"><Database className="w-4 h-4 ml-2" />الغياب</TabsTrigger>
          <TabsTrigger value="examples"><Code className="w-4 h-4 ml-2" />أمثلة</TabsTrigger>
        </TabsList>

        {/* Authentication */}
        <TabsContent value="auth">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>🔐 المصادقة (Authentication)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Base44 SDK يدير المصادقة تلقائياً</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { base44 } from '@/api/base44Client';

// الحصول على بيانات المستخدم الحالي
const user = await base44.auth.me();
// Response: { id, email, full_name, role: 'admin' | 'user' }

// التحقق من حالة المصادقة
const isAuthenticated = await base44.auth.isAuthenticated();

// تسجيل الخروج
base44.auth.logout();

// تحديث بيانات المستخدم
await base44.auth.updateMe({ full_name: 'اسم جديد' });`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Entity */}
        <TabsContent value="student">
          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle>👨‍🎓 Student Entity - كيان الطالب</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">الحقول الأساسية</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li><code className="bg-gray-200 px-2 py-1 rounded">student_id</code> - رقم الطالب</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">full_name</code> - الاسم الكامل</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">grade_level</code> - المرحلة (ابتدائي | متوسط | ثانوي)</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">grade_class</code> - الصف (1-12)</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">behavior_score</code> - رصيد السلوك (default: 80)</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">attendance_score</code> - المواظبة (default: 100)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">أمثلة الاستخدام</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// عرض جميع الطلاب
const students = await base44.entities.Student.list();

// ترتيب حسب الأحدث
const recent = await base44.entities.Student.list('-created_date', 20);

// البحث بالصف والشعبة
const class1A = await base44.entities.Student.filter({
  grade_class: 1,
  class_division: 'أ'
});

// طلاب بدرجة سلوك منخفضة
const lowBehavior = await base44.entities.Student.filter({
  behavior_score: { $lt: 60 }
});

// إضافة طالب جديد
await base44.entities.Student.create({
  student_id: '2025001',
  full_name: 'أحمد محمد',
  grade_level: 'متوسط',
  grade_class: 2,
  guardian_phone: '0501234567'
});

// تحديث درجة السلوك
await base44.entities.Student.update(studentId, {
  behavior_score: 75
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Incidents */}
        <TabsContent value="incidents">
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle>⚠️ BehaviorIncident - المخالفات السلوكية</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">الحقول الأساسية</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li><code className="bg-gray-200 px-2 py-1 rounded">student_id</code> - رقم الطالب</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">misconduct_type_id</code> - نوع المخالفة</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">date</code> - تاريخ الحادثة</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">degree</code> - درجة المخالفة (1-6)</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">points_deducted</code> - النقاط المحسومة</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">أمثلة الاستخدام</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// عرض أحدث المخالفات
const incidents = await base44.entities.BehaviorIncident.list('-date', 50);

// مخالفات طالب محدد
const studentIncidents = await base44.entities.BehaviorIncident.filter({
  student_id: 'STU123'
});

// مخالفات خطيرة
const severe = await base44.entities.BehaviorIncident.filter({
  degree: { $gte: 4 }
});

// تسجيل مخالفة جديدة
const incident = await base44.entities.BehaviorIncident.create({
  student_id: student.student_id,
  student_name: student.full_name,
  misconduct_type_id: type.id,
  misconduct_title: type.title,
  date: '2025-12-15',
  degree: type.degree,
  points_deducted: type.points_deduction
});

// تحديث درجة الطالب
await base44.entities.Student.update(student.id, {
  behavior_score: student.behavior_score - type.points_deduction
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Absence */}
        <TabsContent value="absence">
          <Card>
            <CardHeader className="bg-orange-50">
              <CardTitle>📅 Absence - الغياب</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">الحقول الأساسية</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    <li><code className="bg-gray-200 px-2 py-1 rounded">student_id</code> - رقم الطالب</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">date</code> - تاريخ الغياب</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">has_excuse</code> - يوجد عذر (boolean)</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">excuse_type</code> - نوع العذر</li>
                    <li><code className="bg-gray-200 px-2 py-1 rounded">points_deducted</code> - الدرجات المحسومة</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">أنواع الأعذار</h3>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg text-sm">
                  <div>• الإجازة المرضية</div>
                  <div>• مراجعة المستشفيات</div>
                  <div>• حدوث الكوارث</div>
                  <div>• وفاة أحد الأقارب</div>
                  <div>• مرافقة صحية</div>
                  <div>• مراجعة الجهات الرسمية</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">أمثلة الاستخدام</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`// عرض سجل الغياب
const absences = await base44.entities.Absence.list('-date');

// غياب بدون عذر
const unexcused = await base44.entities.Absence.filter({
  has_excuse: false
});

// تسجيل غياب جديد
await base44.entities.Absence.create({
  student_id: student.student_id,
  student_name: student.full_name,
  date: '2025-12-15',
  has_excuse: false,
  points_deducted: 2
});

// تصدير CSV
const csv = [
  ['الطالب', 'التاريخ', 'عذر', 'النوع'],
  ...absences.map(a => [
    a.student_name,
    a.date,
    a.has_excuse ? 'نعم' : 'لا',
    a.excuse_type || ''
  ])
].map(row => row.join(',')).join('\\n');`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples */}
        <TabsContent value="examples">
          <div className="space-y-4">
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle>📱 مثال: شاشة تسجيل المخالفات</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function BehaviorIncidents() {
  const queryClient = useQueryClient();

  // جلب البيانات
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['behavior-incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list('-date'),
  });

  // تسجيل مخالفة
  const recordIncident = useMutation({
    mutationFn: async (data) => {
      const incident = await base44.entities.BehaviorIncident.create(
        data.incidentData
      );
      
      await base44.entities.Student.update(data.studentId, {
        behavior_score: data.newScore
      });
      
      return incident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['behavior-incidents']);
      queryClient.invalidateQueries(['students']);
    }
  });

  const handleSubmit = (formData) => {
    const student = students.find(s => s.id === formData.studentId);
    
    recordIncident.mutate({
      incidentData: {
        student_id: student.student_id,
        student_name: student.full_name,
        date: formData.date,
        points_deducted: formData.points
      },
      studentId: student.id,
      newScore: student.behavior_score - formData.points
    });
  };
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle>📊 مثال: إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// عدد الطلاب
const studentCount = students.length;

// عدد المخالفات
const incidentCount = incidents.length;

// مخالفات اليوم
const today = new Date().toISOString().split('T')[0];
const todayIncidents = incidents.filter(i => i.date === today);

// طلاب بحاجة لمتابعة
const needsAttention = students.filter(s => 
  s.behavior_score < 60 || s.attendance_score < 80
);

// متوسط درجة السلوك
const avgBehavior = students.reduce(
  (sum, s) => sum + s.behavior_score, 0
) / students.length;`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle>🎯 Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2">✅ استخدم React Query للـ Caching</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
{`const { data } = useQuery({
  queryKey: ['students'],
  queryFn: () => base44.entities.Student.list(),
  staleTime: 5 * 60 * 1000 // 5 دقائق
});`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">✅ Invalidate بعد التحديثات</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
{`onSuccess: () => {
  queryClient.invalidateQueries(['students']);
}`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">✅ معالجة الأخطاء</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm">
{`if (isLoading) return <div>جاري التحميل...</div>;
if (error) return <div>خطأ: {error.message}</div>;`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-3">📄 ملخص سريع - العمليات الأساسية</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-300">
                  <th className="text-right p-2">العملية</th>
                  <th className="text-right p-2">الكود</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b"><td className="p-2">عرض جميع السجلات</td><td className="p-2 bg-gray-900 text-gray-100 rounded">base44.entities.Entity.list()</td></tr>
                <tr className="border-b"><td className="p-2">ترتيب</td><td className="p-2 bg-gray-900 text-gray-100 rounded">list('-field', 20)</td></tr>
                <tr className="border-b"><td className="p-2">تصفية</td><td className="p-2 bg-gray-900 text-gray-100 rounded">filter({'{field: value}'})</td></tr>
                <tr className="border-b"><td className="p-2">إنشاء</td><td className="p-2 bg-gray-900 text-gray-100 rounded">create(data)</td></tr>
                <tr className="border-b"><td className="p-2">تحديث</td><td className="p-2 bg-gray-900 text-gray-100 rounded">update(id, data)</td></tr>
                <tr><td className="p-2">حذف</td><td className="p-2 bg-gray-900 text-gray-100 rounded">delete(id)</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}