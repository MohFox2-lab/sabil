import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Book, Database, Shield } from 'lucide-react';

export default function ApiDocs() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-xl">
          <Book className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📘 Base44 SDK - توثيق API</h1>
          <p className="text-gray-600 mt-1">توثيق كامل لاستخدام Base44 SDK في درع المخالفات السلوكية</p>
        </div>
      </div>

      <Tabs defaultValue="auth" className="w-full">
        <TabsList className="grid grid-cols-6 gap-2">
          <TabsTrigger value="auth"><Shield className="w-4 h-4 ml-2" />المصادقة</TabsTrigger>
          <TabsTrigger value="student"><Database className="w-4 h-4 ml-2" />الطلاب</TabsTrigger>
          <TabsTrigger value="incidents"><Database className="w-4 h-4 ml-2" />المخالفات</TabsTrigger>
          <TabsTrigger value="contract"><Database className="w-4 h-4 ml-2" />التعاقد</TabsTrigger>
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
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { base44 } from '@/api/base44Client';

// الحصول على بيانات المستخدم الحالي
const user = await base44.auth.me();
// Response: { id, email, full_name, role: 'admin' | 'user' }

// التحقق من حالة المصادقة
const isAuthenticated = await base44.auth.isAuthenticated();
// Response: true | false

// تسجيل الخروج
base44.auth.logout(); // يعيد تحميل الصفحة

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
                <h3 className="font-bold text-lg mb-3">Schema - البنية الكاملة</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><code className="bg-blue-100 px-2 py-1 rounded">student_id</code> - string (رقم الطالب) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">full_name</code> - string (الاسم الكامل) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">grade_level</code> - enum (المرحلة) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">grade_class</code> - number (الصف 1-12) *</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">class_division</code> - string (الشعبة)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">national_id</code> - string (الهوية)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">nationality</code> - string (الجنسية)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">birth_date</code> - date (تاريخ الميلاد)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">behavior_score</code> - number (السلوك: 80)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">attendance_score</code> - number (المواظبة: 100)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">distinguished_score</code> - number (التميز: 0)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">guardian_name</code> - string (ولي الأمر)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">guardian_phone</code> - string (جوال ولي الأمر)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">student_phone</code> - string (جوال الطالب)</div>
                  </div>
                  <p className="text-blue-600 font-semibold mt-3">* حقول مطلوبة (Required)</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">1️⃣ عرض جميع الطلاب (List)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// عرض جميع الطلاب
const students = await base44.entities.Student.list();

// ترتيب حسب الأحدث (20 طالب)
const recent = await base44.entities.Student.list('-created_date', 20);

// ترتيب أبجدياً
const sorted = await base44.entities.Student.list('full_name', 50);`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">2️⃣ البحث والتصفية (Filter)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// طلاب صف معين
const class1A = await base44.entities.Student.filter({
  grade_class: 1,
  class_division: 'أ'
});

// طلاب المرحلة المتوسطة
const middleSchool = await base44.entities.Student.filter({
  grade_level: 'متوسط'
});

// طلاب بدرجة سلوك منخفضة
const lowBehavior = await base44.entities.Student.filter({
  behavior_score: { $lt: 60 }
}, '-behavior_score');

// بحث متقدم
const filtered = await base44.entities.Student.filter({
  grade_level: 'ثانوي',
  grade_class: 3,
  behavior_score: { $gte: 70 }
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">3️⃣ إضافة طالب (Create)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const newStudent = await base44.entities.Student.create({
  student_id: '2026001',
  full_name: 'أحمد محمد علي',
  grade_level: 'متوسط',
  grade_class: 2,
  class_division: 'ب',
  guardian_name: 'محمد علي',
  guardian_phone: '0501234567',
  student_phone: '0509876543'
});

// Response يحتوي على: id, created_date, created_by`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">4️⃣ تحديث بيانات (Update)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// تحديث درجة السلوك
await base44.entities.Student.update(studentId, {
  behavior_score: 75
});

// تحديث عدة حقول
await base44.entities.Student.update(studentId, {
  guardian_phone: '0509876543',
  behavior_score: 78,
  notes: 'تحسن ملحوظ'
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">5️⃣ حذف طالب (Delete)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`await base44.entities.Student.delete(studentId);`}
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
                <h3 className="font-bold text-lg mb-3">Schema - البنية الكاملة</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><code className="bg-red-100 px-2 py-1 rounded">student_id</code> - string (رقم الطالب) *</div>
                    <div><code className="bg-red-100 px-2 py-1 rounded">misconduct_type_id</code> - string (نوع المخالفة) *</div>
                    <div><code className="bg-red-100 px-2 py-1 rounded">date</code> - date (تاريخ الحادثة) *</div>
                    <div><code className="bg-red-100 px-2 py-1 rounded">points_deducted</code> - number (النقاط المحسومة) *</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">student_name</code> - string (اسم الطالب)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">misconduct_title</code> - string (عنوان المخالفة)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">day_of_week</code> - string (اليوم)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">degree</code> - number (درجة 1-6)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">actions_taken</code> - string (الإجراءات)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">notes</code> - string (ملاحظات)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">procedure_number</code> - number (رقم الإجراء 1-4)</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">1️⃣ عرض المخالفات (List)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// أحدث 50 مخالفة
const incidents = await base44.entities.BehaviorIncident.list('-date', 50);

// جميع المخالفات
const all = await base44.entities.BehaviorIncident.list();`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">2️⃣ التصفية (Filter)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// مخالفات طالب محدد
const studentIncidents = await base44.entities.BehaviorIncident.filter({
  student_id: 'STU123'
}, '-date');

// مخالفات خطيرة (درجة 4+)
const severe = await base44.entities.BehaviorIncident.filter({
  degree: { $gte: 4 }
});

// مخالفات في فترة معينة
const rangeIncidents = await base44.entities.BehaviorIncident.filter({
  date: {
    $gte: '2026-01-01',
    $lte: '2026-01-31'
  }
});

// عدد المخالفات
const count = incidents.length;`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">3️⃣ تسجيل مخالفة (Create)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// خطوة 1: تسجيل المخالفة
const incident = await base44.entities.BehaviorIncident.create({
  student_id: student.student_id,
  student_name: student.full_name,
  misconduct_type_id: type.id,
  misconduct_title: type.title,
  date: '2026-01-15',
  day_of_week: 'الأحد',
  degree: type.degree,
  points_deducted: type.points_deduction,
  actions_taken: 'إنذار شفهي',
  notes: 'التحدث أثناء الحصة',
  procedure_number: 1
});

// خطوة 2: تحديث درجة الطالب
await base44.entities.Student.update(student.id, {
  behavior_score: student.behavior_score - type.points_deduction
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">4️⃣ حذف مخالفة + استرجاع النقاط (Delete)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// حذف المخالفة
await base44.entities.BehaviorIncident.delete(incidentId);

// إرجاع النقاط للطالب
await base44.entities.Student.update(student.id, {
  behavior_score: student.behavior_score + incident.points_deducted
});`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Contract */}
        <TabsContent value="contract">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle>📄 BehaviorContract - العقد السلوكي</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Schema - البنية الكاملة</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><code className="bg-blue-100 px-2 py-1 rounded">student_id</code> - string (رقم الطالب) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">student_name</code> - string (اسم الطالب) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">contract_date</code> - date (تاريخ العقد) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">violation_description</code> - string (وصف المخالفة) *</div>
                    <div><code className="bg-blue-100 px-2 py-1 rounded">contract_terms</code> - string (بنود العقد) *</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">grade</code> - string (الصف)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">counselor_notes</code> - string (ملاحظات المرشد)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">student_signature</code> - string (توقيع الطالب)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">guardian_signature</code> - string (توقيع ولي الأمر)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">counselor_signature</code> - string (توقيع المرشد)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">principal_signature</code> - string (توقيع القائد)</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">1️⃣ عرض العقود (List)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const contracts = await base44.entities.BehaviorContract.list('-contract_date');`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">2️⃣ عقود طالب محدد (Filter)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const studentContracts = await base44.entities.BehaviorContract.filter({
  student_id: 'STU123'
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">3️⃣ إنشاء عقد جديد (Create)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const contract = await base44.entities.BehaviorContract.create({
  student_id: student.id,
  student_name: student.full_name,
  grade: \`\${student.grade_level} - الصف \${student.grade_class}\`,
  contract_date: '2026-01-15',
  violation_description: 'تكرار التأخر عن الطابور الصباحي',
  contract_terms: \`1. ألتزم بالحضور في الوقت المحدد.
2. ألتزم باحترام الجميع.
3. أتعهد بعدم تكرار السلوك المخالف.\`,
  counselor_notes: 'متابعة يومية لمدة أسبوعين',
  student_signature: 'أحمد محمد',
  guardian_signature: 'محمد علي'
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
              <CardTitle>📅 Absence - الغياب والحضور</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-3">Schema - البنية الكاملة</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><code className="bg-orange-100 px-2 py-1 rounded">student_id</code> - string (رقم الطالب) *</div>
                    <div><code className="bg-orange-100 px-2 py-1 rounded">date</code> - date (تاريخ الغياب) *</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">student_name</code> - string (اسم الطالب)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">has_excuse</code> - boolean (عذر: false)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">excuse_type</code> - enum (نوع العذر)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">excuse_document_url</code> - string (مرفق العذر)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">notes</code> - string (ملاحظات)</div>
                    <div><code className="bg-gray-200 px-2 py-1 rounded">points_deducted</code> - number (النقاط: 0)</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">أنواع الأعذار المتاحة</h3>
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg text-sm">
                  <div>• الإجازة المرضية</div>
                  <div>• مراجعة المستشفيات</div>
                  <div>• حدوث الكوارث</div>
                  <div>• وفاة أحد الأقارب</div>
                  <div>• مرافقة صحية</div>
                  <div>• مراجعة الجهات الرسمية</div>
                  <div>• المشاركات في المسابقات</div>
                  <div>• ظروف صحية أخرى</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">1️⃣ عرض سجل الغياب (List)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`const absences = await base44.entities.Absence.list('-date');`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">2️⃣ تصفية الغياب (Filter)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// غياب طالب محدد
const studentAbs = await base44.entities.Absence.filter({
  student_id: 'STU123'
}, '-date');

// غياب بدون عذر
const unexcused = await base44.entities.Absence.filter({
  has_excuse: false
});

// غياب بعذر طبي
const medical = await base44.entities.Absence.filter({
  excuse_type: 'الإجازة المرضية'
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">3️⃣ تسجيل غياب (Create)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// تسجيل الغياب
const absence = await base44.entities.Absence.create({
  student_id: student.student_id,
  student_name: student.full_name,
  date: '2026-01-15',
  has_excuse: false,
  notes: 'غياب بدون عذر',
  points_deducted: 2
});

// تحديث درجة المواظبة
await base44.entities.Student.update(student.id, {
  attendance_score: student.attendance_score - 2
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">4️⃣ رفع عذر (Update)</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// تحديث الغياب بعذر
await base44.entities.Absence.update(absenceId, {
  has_excuse: true,
  excuse_type: 'الإجازة المرضية',
  excuse_document_url: 'https://...',
  points_deducted: 0
});

// إرجاع النقاط
await base44.entities.Student.update(student.id, {
  attendance_score: student.attendance_score + previousDeduction
});`}
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
                <CardTitle>📱 مثال عملي: تسجيل مخالفة</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function RegisterIncident() {
  const queryClient = useQueryClient();

  // جلب البيانات
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  // تسجيل مخالفة
  const recordIncident = useMutation({
    mutationFn: async ({ incidentData, studentId, newScore }) => {
      await base44.entities.BehaviorIncident.create(incidentData);
      await base44.entities.Student.update(studentId, {
        behavior_score: newScore
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['behavior-incidents']);
      queryClient.invalidateQueries(['students']);
      alert('تم تسجيل المخالفة بنجاح');
    }
  });

  const handleSubmit = (formData) => {
    const student = students.find(s => s.id === formData.studentId);
    const type = misconductTypes.find(m => m.id === formData.misconductId);
    
    recordIncident.mutate({
      incidentData: {
        student_id: student.student_id,
        student_name: student.full_name,
        misconduct_type_id: type.id,
        misconduct_title: type.title,
        date: formData.date,
        degree: type.degree,
        points_deducted: type.points_deduction,
        actions_taken: formData.actions
      },
      studentId: student.id,
      newScore: student.behavior_score - type.points_deduction
    });
  };
}`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle>📊 مثال: إحصائيات وعدادات</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// عدد الطلاب
const { data: students = [] } = useQuery({
  queryKey: ['students'],
  queryFn: () => base44.entities.Student.list(),
});
const studentCount = students.length;

// عدد المخالفات
const { data: incidents = [] } = useQuery({
  queryKey: ['incidents'],
  queryFn: () => base44.entities.BehaviorIncident.list(),
});
const incidentCount = incidents.length;

// مخالفات اليوم
const today = new Date().toISOString().split('T')[0];
const todayIncidents = incidents.filter(i => i.date === today);

// طلاب بحاجة لمتابعة
const needsAttention = students.filter(s => 
  s.behavior_score < 60 || s.attendance_score < 80
);

// متوسط السلوك
const avgBehavior = students.reduce((sum, s) => 
  sum + s.behavior_score, 0) / students.length;`}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle>🎯 Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="font-bold mb-2">✅ استخدم React Query</h4>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`const { data } = useQuery({
  queryKey: ['students'],
  queryFn: () => base44.entities.Student.list(),
  staleTime: 5 * 60 * 1000 // 5 دقائق
});`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold mb-2">✅ Invalidate بعد التحديثات</h4>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`onSuccess: () => {
  queryClient.invalidateQueries(['students']);
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-bold mb-2">✅ معالجة الأخطاء</h4>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs">
{`if (isLoading) return <div>جاري التحميل...</div>;
if (error) return <div>خطأ: {error.message}</div>;`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-lg mb-3">📄 ملخص العمليات الأساسية</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-blue-100 border-b-2">
                  <th className="text-right p-3 border-l">العملية</th>
                  <th className="text-right p-3">الكود</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs bg-white">
                <tr className="border-b"><td className="p-2 border-l">عرض الكل</td><td className="p-2">base44.entities.Entity.list()</td></tr>
                <tr className="border-b"><td className="p-2 border-l">ترتيب</td><td className="p-2">list('-field', 20)</td></tr>
                <tr className="border-b"><td className="p-2 border-l">تصفية</td><td className="p-2">filter({'{field: value}'})</td></tr>
                <tr className="border-b"><td className="p-2 border-l">إنشاء</td><td className="p-2">create(data)</td></tr>
                <tr className="border-b"><td className="p-2 border-l">تحديث</td><td className="p-2">update(id, data)</td></tr>
                <tr><td className="p-2 border-l">حذف</td><td className="p-2">delete(id)</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}