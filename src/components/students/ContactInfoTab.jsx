import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Phone, Mail } from 'lucide-react';

export default function ContactInfoTab() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [contactData, setContactData] = useState({
    guardian_name: '',
    guardian_phone: '',
    guardian_work_phone: '',
    student_phone: '',
    guardian_email: ''
  });

  const queryClient = useQueryClient();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const updateContact = useMutation({
    mutationFn: (data) => base44.entities.Student.update(selectedStudent, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      alert('تم حفظ بيانات الاتصال بنجاح');
    },
  });

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    const student = students.find(s => s.id === studentId);
    if (student) {
      setContactData({
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        guardian_work_phone: student.guardian_work_phone || '',
        student_phone: student.student_phone || '',
        guardian_email: student.guardian_email || ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('الرجاء اختيار طالب');
      return;
    }
    updateContact.mutate(contactData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label>اختر الطالب</Label>
            <Select value={selectedStudent} onValueChange={handleStudentChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر طالب..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name} - {student.student_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  بيانات ولي الأمر
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم ولي الأمر</Label>
                    <Input
                      value={contactData.guardian_name}
                      onChange={(e) => setContactData({...contactData, guardian_name: e.target.value})}
                      placeholder="أدخل اسم ولي الأمر"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم جوال ولي الأمر</Label>
                    <Input
                      value={contactData.guardian_phone}
                      onChange={(e) => setContactData({...contactData, guardian_phone: e.target.value})}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم عمل ولي الأمر</Label>
                    <Input
                      value={contactData.guardian_work_phone}
                      onChange={(e) => setContactData({...contactData, guardian_work_phone: e.target.value})}
                      placeholder="011xxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني لولي الأمر</Label>
                    <Input
                      type="email"
                      value={contactData.guardian_email}
                      onChange={(e) => setContactData({...contactData, guardian_email: e.target.value})}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  بيانات الطالب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم جوال الطالب</Label>
                    <Input
                      value={contactData.student_phone}
                      onChange={(e) => setContactData({...contactData, student_phone: e.target.value})}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <Save className="w-4 h-4" />
                  حفظ بيانات الاتصال
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}