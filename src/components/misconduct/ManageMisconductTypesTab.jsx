import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Edit, Trash2, Save, X, Database } from 'lucide-react';

export default function ManageMisconductTypesTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    degree: 1,
    points_deduction: 1,
    category: 'انضباط مدرسي',
    applicable_stages: ['متوسط', 'ثانوي'],
    procedure_1: 'تنبيه شفوي من المعلم',
    procedure_2: 'استدعاء ولي الأمر وأخذ تعهد خطي',
    procedure_3: 'حسم درجات السلوك وإنذار كتابي',
    procedure_4: 'إحالة للجنة التوجيه والإرشاد',
    is_critical: false
  });

  const queryClient = useQueryClient();

  const { data: misconductTypes = [], isLoading } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list('-degree'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MisconductType.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misconduct-types'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MisconductType.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misconduct-types'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MisconductType.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misconduct-types'] });
    },
  });

  const loadOfficialMisconducts = useMutation({
    mutationFn: async () => {
      const officialData = [
        // الدرجة الأولى
        { title: 'التأخر الصباحي', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'عدم حضور الاصطفاف الصباحي', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'العبث أثناء الاصطفاف', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'التأخر عن الدخول للحصص', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'إعاقة سير الحصة الدراسية', degree: 1, points_deduction: 1, category: 'سلوك تعليمي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'النوم داخل الفصل', degree: 1, points_deduction: 1, category: 'سلوك تعليمي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'التجمهر أمام بوابة المدرسة', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },
        { title: 'الدخول والخروج المتكرر من البوابة', degree: 1, points_deduction: 1, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه شفوي', procedure_2: 'إشعار ولي الأمر', procedure_3: 'حسم درجة + إنذار', procedure_4: 'إحالة للتوجيه' },

        // الدرجة الثانية
        { title: 'عدم حضور الحصة أو الهروب منها', degree: 2, points_deduction: 2, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إشعار ولي الأمر', procedure_2: 'حسم درجتين + تعهد خطي', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },
        { title: 'الدخول أو الخروج من الفصل بدون إذن', degree: 2, points_deduction: 2, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إشعار ولي الأمر', procedure_2: 'حسم درجتين + تعهد خطي', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },
        { title: 'دخول فصل آخر دون استئذان', degree: 2, points_deduction: 2, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إشعار ولي الأمر', procedure_2: 'حسم درجتين + تعهد خطي', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },
        { title: 'إثارة الفوضى داخل الفصل أو المدرسة', degree: 2, points_deduction: 2, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إشعار ولي الأمر', procedure_2: 'حسم درجتين + تعهد خطي', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },

        // الدرجة الثالثة
        { title: 'عدم التقيد بالزي المدرسي', degree: 3, points_deduction: 3, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه + إشعار ولي الأمر', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه + عقوبة' },
        { title: 'الشجار أو الاشتراك في مضاربة', degree: 3, points_deduction: 3, category: 'احترام الآخرين', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'فصل الأطراف + إشعار ولي الأمر', procedure_2: 'حسم 3 درجات + تعهد', procedure_3: 'استدعاء الأولياء', procedure_4: 'إحالة للتوجيه' },
        { title: 'الإشارة بحركات مخلة بالأدب تجاه الطلبة', degree: 3, points_deduction: 3, category: 'احترام الآخرين', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه + إشعار ولي الأمر', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'التلفظ بألفاظ سلبية أو التهديد', degree: 3, points_deduction: 3, category: 'احترام الآخرين', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'تنبيه + إشعار ولي الأمر', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'إلحاق الضرر بممتلكات الطلبة', degree: 3, points_deduction: 3, category: 'احترام الممتلكات', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'تعويض الضرر + إشعار', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'العبث بتجهيزات المدرسة أو مبانيها', degree: 3, points_deduction: 3, category: 'احترام الممتلكات', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إصلاح الضرر + إشعار', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'إحضار مواد أو ألعاب خطرة', degree: 3, points_deduction: 3, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'مصادرة + إشعار فوري', procedure_2: 'حسم 3 درجات', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },
        { title: 'إحضار السجائر بأنواعها', degree: 3, points_deduction: 3, category: 'مخالفات خطيرة', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'مصادرة + إشعار فوري', procedure_2: 'حسم 3 درجات', procedure_3: 'استدعاء ولي الأمر', procedure_4: 'إحالة للتوجيه' },
        { title: 'إحضار مواد إعلامية ممنوعة', degree: 3, points_deduction: 3, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'مصادرة + إشعار', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'التوقيع عن ولي الأمر بدون علمه', degree: 3, points_deduction: 3, category: 'انضباط مدرسي', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إشعار ولي الأمر فوراً', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },
        { title: 'إتلاف الكتب الدراسية', degree: 3, points_deduction: 3, category: 'احترام الممتلكات', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'استبدال الكتاب + إشعار', procedure_2: 'حسم 3 درجات', procedure_3: 'تعهد خطي', procedure_4: 'إحالة للتوجيه' },

        // الدرجة الرابعة
        { title: 'تهديد المعلمين أو الإداريين', degree: 4, points_deduction: 10, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري للإدارة', procedure_2: 'حسم 10 درجات', procedure_3: 'إحالة للتوجيه', procedure_4: 'نقل أو فصل مؤقت', is_critical: true },
        { title: 'التلفظ بألفاظ غير لائقة تجاه المعلمين', degree: 4, points_deduction: 10, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري للإدارة', procedure_2: 'حسم 10 درجات', procedure_3: 'إحالة للتوجيه', procedure_4: 'نقل أو فصل مؤقت', is_critical: true },
        { title: 'السخرية من المعلمين أو الإداريين', degree: 4, points_deduction: 10, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري للإدارة', procedure_2: 'حسم 10 درجات', procedure_3: 'إحالة للتوجيه', procedure_4: 'نقل أو فصل مؤقت', is_critical: true },
        { title: 'التوقيع عن مسؤولي المدرسة', degree: 4, points_deduction: 10, category: 'مخالفات خطيرة', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري', procedure_2: 'حسم 10 درجات', procedure_3: 'إحالة للتوجيه', procedure_4: 'إحالة للجهات المختصة', is_critical: true },
        { title: 'تصوير المعلمين بدون إذن', degree: 4, points_deduction: 10, category: 'مخالفات خطيرة', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'مصادرة الجهاز + إبلاغ', procedure_2: 'حسم 10 درجات', procedure_3: 'إحالة للتوجيه', procedure_4: 'إجراء قانوني', is_critical: true },

        // الدرجة الخامسة
        { title: 'إلحاق الضرر بممتلكات المعلمين', degree: 5, points_deduction: 15, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري + تعويض', procedure_2: 'حسم 15 درجة', procedure_3: 'إحالة للتوجيه', procedure_4: 'نقل/فصل + إجراء قانوني', is_critical: true },
        { title: 'الإشارة بحركات مخلة تجاه المعلمين', degree: 5, points_deduction: 15, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري للإدارة', procedure_2: 'حسم 15 درجة', procedure_3: 'إحالة للتوجيه', procedure_4: 'نقل/فصل + إجراء قانوني', is_critical: true },
        { title: 'الاعتداء بالضرب على المعلمين', degree: 5, points_deduction: 15, category: 'مخالفات خطيرة', applicable_stages: ['ابتدائي', 'متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري + أمني', procedure_2: 'حسم 15 درجة', procedure_3: 'فصل فوري', procedure_4: 'إجراء قانوني + بلاغ رسمي', is_critical: true },
        { title: 'ابتزاز المعلمين أو الإداريين', degree: 5, points_deduction: 15, category: 'مخالفات خطيرة', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري + أمني', procedure_2: 'حسم 15 درجة', procedure_3: 'فصل فوري', procedure_4: 'إجراء قانوني + بلاغ رسمي', is_critical: true },
        { title: 'الجرائم المعلوماتية تجاه المعلمين', degree: 5, points_deduction: 15, category: 'مخالفات خطيرة', applicable_stages: ['متوسط', 'ثانوي'], procedure_1: 'إبلاغ فوري + جهات أمنية', procedure_2: 'حسم 15 درجة', procedure_3: 'فصل فوري', procedure_4: 'بلاغ هيئة الأمن السيبراني', is_critical: true },
      ];

      for (const item of officialData) {
        await base44.entities.MisconductType.create(item);
      }
      return { success: officialData.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['misconduct-types'] });
      alert(`✅ تم إضافة ${result.success} مخالفة رسمية بنجاح`);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      degree: 1,
      points_deduction: 1,
      category: 'انضباط مدرسي',
      applicable_stages: ['متوسط', 'ثانوي'],
      procedure_1: 'تنبيه شفوي من المعلم',
      procedure_2: 'استدعاء ولي الأمر وأخذ تعهد خطي',
      procedure_3: 'حسم درجات السلوك وإنذار كتابي',
      procedure_4: 'إحالة للجنة التوجيه والإرشاد',
      is_critical: false
    });
  };

  const handleEdit = (misconduct) => {
    setEditingId(misconduct.id);
    setFormData({ ...misconduct });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id, title) => {
    if (confirm(`هل تريد حذف المخالفة: ${title}؟`)) {
      deleteMutation.mutate(id);
    }
  };

  const degreeColors = {
    1: 'bg-blue-600',
    2: 'bg-yellow-600',
    3: 'bg-orange-600',
    4: 'bg-red-600',
    5: 'bg-purple-600'
  };

  const groupedByDegree = misconductTypes.reduce((acc, item) => {
    if (!acc[item.degree]) acc[item.degree] = [];
    acc[item.degree].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              إدارة أنواع المخالفات
            </span>
            <div className="flex gap-2">
              {misconductTypes.length === 0 && (
                <Button
                  onClick={() => loadOfficialMisconducts.mutate()}
                  disabled={loadOfficialMisconducts.isPending}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <Database className="w-4 h-4" />
                  {loadOfficialMisconducts.isPending ? 'جاري التحميل...' : 'تحميل المخالفات الرسمية (52)'}
                </Button>
              )}
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة مخالفة
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[1, 2, 3, 4, 5].map(deg => (
              <div key={deg} className={`${degreeColors[deg]} text-white p-4 rounded-lg text-center`}>
                <p className="text-sm">الدرجة {deg}</p>
                <p className="text-3xl font-bold">{groupedByDegree[deg]?.length || 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-2 border-blue-500">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'تعديل المخالفة' : 'إضافة مخالفة جديدة'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان المخالفة *</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="انضباط مدرسي">انضباط مدرسي</SelectItem>
                      <SelectItem value="سلوك تعليمي">سلوك تعليمي</SelectItem>
                      <SelectItem value="احترام الممتلكات">احترام الممتلكات</SelectItem>
                      <SelectItem value="احترام الآخرين">احترام الآخرين</SelectItem>
                      <SelectItem value="مخالفات خطيرة">مخالفات خطيرة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>وصف المخالفة</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الدرجة *</Label>
                  <Select
                    value={formData.degree.toString()}
                    onValueChange={(v) => setFormData({...formData, degree: parseInt(v)})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الدرجة الأولى</SelectItem>
                      <SelectItem value="2">الدرجة الثانية</SelectItem>
                      <SelectItem value="3">الدرجة الثالثة</SelectItem>
                      <SelectItem value="4">الدرجة الرابعة</SelectItem>
                      <SelectItem value="5">الدرجة الخامسة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>النقاط المحسومة *</Label>
                  <Input
                    type="number"
                    required
                    value={formData.points_deduction}
                    onChange={(e) => setFormData({...formData, points_deduction: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>الإجراء الأول</Label>
                <Input
                  value={formData.procedure_1}
                  onChange={(e) => setFormData({...formData, procedure_1: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>الإجراء الثاني</Label>
                <Input
                  value={formData.procedure_2}
                  onChange={(e) => setFormData({...formData, procedure_2: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>الإجراء الثالث</Label>
                <Input
                  value={formData.procedure_3}
                  onChange={(e) => setFormData({...formData, procedure_3: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>الإجراء الرابع</Label>
                <Input
                  value={formData.procedure_4}
                  onChange={(e) => setFormData({...formData, procedure_4: e.target.value})}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_critical}
                  onChange={(e) => setFormData({...formData, is_critical: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label>مخالفة حرجة (تتطلب تدخل فوري)</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save className="w-4 h-4 ml-2" />
                  {editingId ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {[1, 2, 3, 4, 5].map(degree => {
        const items = groupedByDegree[degree] || [];
        if (items.length === 0) return null;

        return (
          <Card key={degree}>
            <CardHeader className={`${degreeColors[degree]} text-white`}>
              <CardTitle>الدرجة {['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'][degree - 1]} ({items.length} مخالفة)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          {item.is_critical && <Badge className="bg-red-600">حرجة ⚠️</Badge>}
                          <Badge className={degreeColors[item.degree]}>-{item.points_deduction} درجة</Badge>
                        </div>
                        {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>• الإجراء 1: {item.procedure_1}</p>
                          <p>• الإجراء 2: {item.procedure_2}</p>
                          <p>• الإجراء 3: {item.procedure_3}</p>
                          <p>• الإجراء 4: {item.procedure_4}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id, item.title)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}