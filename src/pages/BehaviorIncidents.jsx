import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Plus, X, Save, Search, FileText, ClipboardEdit, Trash2, Edit } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import BehaviorIncidentsReport from '../components/reports/BehaviorIncidentsReport';
import AdvancedIncidentForm from '../components/incidents/AdvancedIncidentForm';

export default function BehaviorIncidents() {
  const [showForm, setShowForm] = useState(false);
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIncident, setEditingIncident] = useState(null);
  const [selectedIncidents, setSelectedIncidents] = useState([]);

  // ✅ هذا مفتاح الخصوصية: لا نحمّل الطلاب إلا عند الحاجة
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    student_id: '',
    misconduct_type_id: '',
    date: new Date().toISOString().split('T')[0],
    actions_taken: '',
    notes: '',
    procedure_number: 1
  });

  const queryClient = useQueryClient();

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list('-date'),
  });

  // ✅ تحميل الطلاب مشروط (لا يظهرون عند أول فتح)
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
    enabled: studentsLoaded || showForm || showAdvancedForm,
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  const createIncident = useMutation({
    mutationFn: async (data) => {
      const student = students.find(s => s.id === data.student_id);
      const misconduct = misconductTypes.find(m => m.id === data.misconduct_type_id);

      const incidentData = {
        ...data,
        student_name: student?.full_name,
        misconduct_title: misconduct?.title,
        degree: misconduct?.degree,
        points_deducted: misconduct?.points_deduction
      };

      if (editingIncident) {
        // تعديل مخالفة موجودة
        const oldIncident = incidents.find(i => i.id === editingIncident);
        await base44.entities.BehaviorIncident.update(editingIncident, incidentData);

        // إرجاع النقاط القديمة وخصم النقاط الجديدة
        const oldPoints = oldIncident?.points_deducted ?? 0;
        const newPoints = misconduct?.points_deduction ?? 0;
        const pointsDiff = newPoints - oldPoints;

        const currentScore = student?.behavior_score ?? 80;
        const newScore = Math.max(0, currentScore - pointsDiff);

        if (student?.id) {
          await base44.entities.Student.update(student.id, { behavior_score: newScore });
        }
      } else {
        // إنشاء مخالفة جديدة
        await base44.entities.BehaviorIncident.create(incidentData);

        // تحديث درجة الطالب
        const currentScore = student?.behavior_score ?? 80;
        const deduct = misconduct?.points_deduction ?? 0;
        const newScore = Math.max(0, currentScore - deduct);

        if (student?.id) {
          await base44.entities.Student.update(student.id, { behavior_score: newScore });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowForm(false);
      setEditingIncident(null);
      setFormData({
        student_id: '',
        misconduct_type_id: '',
        date: new Date().toISOString().split('T')[0],
        actions_taken: '',
        notes: '',
        procedure_number: 1
      });
    },
  });

  const deleteIncident = useMutation({
    mutationFn: async (incidentId) => {
      const incident = incidents.find(i => i.id === incidentId);

      // ✅ إصلاح: الطالب مرتبط بـ incident.student_id = student.id
      const student = students.find(s => s.id === incident?.student_id);

      // حذف المخالفة
      await base44.entities.BehaviorIncident.delete(incidentId);

      // إرجاع النقاط للطالب
      if (student && incident) {
        const newScore = Math.min(100, (student.behavior_score || 0) + (incident.points_deducted || 0));
        await base44.entities.Student.update(student.id, { behavior_score: newScore });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const deleteMultipleIncidents = useMutation({
    mutationFn: async (incidentIds) => {
      for (const incidentId of incidentIds) {
        const incident = incidents.find(i => i.id === incidentId);

        // ✅ إصلاح: الطالب مرتبط بـ incident.student_id = student.id
        const student = students.find(s => s.id === incident?.student_id);

        await base44.entities.BehaviorIncident.delete(incidentId);

        if (student && incident) {
          const newScore = Math.min(100, (student.behavior_score || 0) + (incident.points_deducted || 0));
          await base44.entities.Student.update(student.id, { behavior_score: newScore });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelectedIncidents([]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createIncident.mutate(formData);
  };

  const handleEdit = (incident) => {
    // ✅ إصلاح: الطالب مرتبط بـ incident.student_id = student.id
    const student = students.find(s => s.id === incident.student_id);
    const misconduct = misconductTypes.find(m => m.title === incident.misconduct_title);

    setEditingIncident(incident.id);
    setFormData({
      student_id: student?.id || '',
      misconduct_type_id: misconduct?.id || '',
      date: incident.date,
      actions_taken: incident.actions_taken || '',
      notes: incident.notes || '',
      procedure_number: incident.procedure_number || 1
    });
    setShowForm(true);
  };

  const handleDelete = (incidentId) => {
    if (confirm('هل أنت متأكد من حذف هذه المخالفة؟ سيتم إرجاع النقاط للطالب.')) {
      deleteIncident.mutate(incidentId);
    }
  };

  const filteredIncidents = useMemo(() => {
    const t = (searchTerm || '').trim();
    if (!t) return incidents;
    return incidents.filter(inc =>
      (inc.student_name || '').includes(t) || (inc.misconduct_title || '').includes(t)
    );
  }, [incidents, searchTerm]);

  const handleSelectAll = (checked) => {
    const all = filteredIncidents.map(i => i.id);
    if (checked) setSelectedIncidents(all);
    else setSelectedIncidents([]);
  };

  const handleSelectIncident = (incidentId, checked) => {
    if (checked) setSelectedIncidents(prev => [...prev, incidentId]);
    else setSelectedIncidents(prev => prev.filter(id => id !== incidentId));
  };

  const handleDeleteSelected = () => {
    if (selectedIncidents.length === 0) {
      alert('الرجاء اختيار مخالفات للحذف');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف ${selectedIncidents.length} مخالفة؟ سيتم إرجاع النقاط للطلاب.`)) {
      deleteMultipleIncidents.mutate(selectedIncidents);
    }
  };

  const resetForm = () => {
    setEditingIncident(null);
    setFormData({
      student_id: '',
      misconduct_type_id: '',
      date: new Date().toISOString().split('T')[0],
      actions_taken: '',
      notes: '',
      procedure_number: 1
    });
  };

  const openQuickForm = () => {
    // ✅ عند فتح النموذج: نسمح بتحميل الطلاب (للاختيار)
    setStudentsLoaded(true);
    setShowForm(true);
  };

  const openAdvancedForm = () => {
    // ✅ عند فتح النموذج المتقدم: نسمح بتحميل الطلاب
    setStudentsLoaded(true);
    setShowAdvancedForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المخالفات السلوكية</h1>
          <p className="text-gray-600 mt-1">تسجيل ومتابعة المخالفات</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {selectedIncidents.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              حذف المحدد ({selectedIncidents.length})
            </Button>
          )}

          {/* ✅ زر خصوصية: تحميل الطلاب فقط عند الطلب */}
          <Button
            onClick={() => setStudentsLoaded(true)}
            variant="outline"
            className="gap-2"
            title="لن يتم تحميل أسماء الطلاب إلا عند الضغط هنا أو عند فتح نموذج التسجيل"
          >
            تحميل قائمة الطلاب
          </Button>

          <Button onClick={() => setShowReport(true)} variant="outline" className="gap-2">
            <FileText className="w-5 h-5" />
            تقرير قابل للطباعة
          </Button>

          <Button
            onClick={openAdvancedForm}
            variant="outline"
            className="gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300"
          >
            <ClipboardEdit className="w-5 h-5" />
            نموذج متقدم
          </Button>

          <Button onClick={openQuickForm} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-5 h-5 ml-2" />
            تسجيل سريع
          </Button>
        </div>
      </div>

      {/* Search & Select All */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Checkbox
              checked={selectedIncidents.length === filteredIncidents.length && filteredIncidents.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث في المخالفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incidents List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredIncidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedIncidents.includes(incident.id)}
                  onCheckedChange={(checked) => handleSelectIncident(incident.id, checked)}
                  className="mt-1"
                />

                <div className="flex-1 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{incident.student_name}</h3>
                      <Badge className={
                        incident.degree <= 2 ? 'bg-blue-100 text-blue-800' :
                        incident.degree === 3 ? 'bg-yellow-100 text-yellow-800' :
                        incident.degree === 4 ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }>
                        الدرجة {['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'][incident.degree - 1]}
                      </Badge>
                    </div>

                    <p className="text-gray-700 font-semibold mb-2">{incident.misconduct_title}</p>

                    {incident.actions_taken && (
                      <p className="text-sm text-gray-600 mb-2">الإجراءات: {incident.actions_taken}</p>
                    )}

                    {incident.notes && (
                      <p className="text-sm text-gray-500">ملاحظات: {incident.notes}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(incident.date).toLocaleDateString('ar-SA')} - الإجراء رقم {incident.procedure_number}
                    </p>
                  </div>

                  <div className="text-left flex flex-col gap-2">
                    <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-center shadow-lg">
                      <p className="text-sm">محسوم</p>
                      <p className="text-3xl font-bold">-{incident.points_deducted}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // للتعديل نضمن تحميل الطلاب
                          setStudentsLoaded(true);
                          handleEdit(incident);
                        }}
                        className="gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(incident.id)}
                        className="gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-red-600 text-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  {editingIncident ? 'تعديل مخالفة سلوكية' : 'تسجيل مخالفة سلوكية'}
                </CardTitle>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-red-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* تنبيه لو الطلاب ما تحمّلوا بعد */}
              {!studentsLoaded && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                  لإظهار أسماء الطلاب داخل النموذج اضغط أولاً: <b>تحميل قائمة الطلاب</b>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>الطالب *</Label>
                  <Select
                    required
                    value={formData.student_id}
                    onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                    disabled={!studentsLoaded}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!studentsLoaded ? "حمّل قائمة الطلاب أولاً" : "اختر الطالب"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} - {student.grade_level} {student.grade_class}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع المخالفة *</Label>
                  <Select
                    required
                    value={formData.misconduct_type_id}
                    onValueChange={(value) => setFormData({ ...formData, misconduct_type_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المخالفة" />
                    </SelectTrigger>
                    <SelectContent>
                      {misconductTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.title} - الدرجة {type.degree} ({type.points_deduction} درجة)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>التاريخ *</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الإجراء *</Label>
                  <Select
                    value={formData.procedure_number.toString()}
                    onValueChange={(value) => setFormData({ ...formData, procedure_number: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">الإجراء الأول</SelectItem>
                      <SelectItem value="2">الإجراء الثاني</SelectItem>
                      <SelectItem value="3">الإجراء الثالث</SelectItem>
                      <SelectItem value="4">الإجراء الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الإجراءات المتخذة</Label>
                  <Textarea
                    value={formData.actions_taken}
                    onChange={(e) => setFormData({ ...formData, actions_taken: e.target.value })}
                    placeholder="وصف الإجراءات التربوية المتخذة..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية..."
                    rows={2}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>

                  <Button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={!studentsLoaded}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {editingIncident ? 'حفظ التعديلات' : 'حفظ المخالفة'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Form Dialog */}
      {showAdvancedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-7xl my-8">
            <div className="sticky top-0 bg-emerald-600 text-white p-6 flex items-center justify-between rounded-t-xl z-10">
              <h2 className="text-2xl font-bold">نموذج تسجيل المخالفات السلوكية - متقدم</h2>
              <Button
                onClick={() => setShowAdvancedForm(false)}
                variant="ghost"
                className="text-white hover:bg-emerald-500"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <AdvancedIncidentForm onClose={() => setShowAdvancedForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Report Dialog */}
      {showReport && (
        <BehaviorIncidentsReport onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
