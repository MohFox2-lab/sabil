import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

export default function StudentGroupDistribution() {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [groupStudents, setGroupStudents] = useState({});
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState([]);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);

  const { data: allStudents = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const groups = [
    { id: '1', name: 'مجموعة الصباح' },
    { id: '2', name: 'مجموعة المسائية' }
  ];

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const classes = ['أ', 'ب', 'ج', 'د', 'ه', 'و'];

  const handleShowGroupStudents = () => {
    if (!selectedGroup) {
      alert('الرجاء اختيار مجموعة');
      return;
    }
  };

  const handleShowAvailableStudents = () => {
    if (!selectedGrade || !selectedClass) {
      alert('الرجاء اختيار الصف والفصل');
      return;
    }

    const filtered = allStudents.filter(student => {
      const matchGrade = student.grade_class?.toString() === selectedGrade;
      const matchClass = student.class_division?.toLowerCase() === selectedClass.toLowerCase();
      return matchGrade && matchClass;
    });

    setDisplayedStudents(filtered);
  };

  const currentGroupStudents = groupStudents[selectedGroup] || [];
  const availableStudents = displayedStudents.filter(
    s => !currentGroupStudents.includes(s.id)
  );

  const handleSelectAll = (type) => {
    if (type === 'available') {
      setSelectedAvailableStudents(availableStudents.map(s => s.id));
    } else if (type === 'group') {
      setSelectedGroupStudents(currentGroupStudents);
    }
  };

  const handleAddToGroup = () => {
    if (!selectedGroup) {
      alert('الرجاء اختيار مجموعة');
      return;
    }

    if (selectedAvailableStudents.length === 0) {
      alert('الرجاء اختيار طلاب لإضافتهم');
      return;
    }

    const updatedGroupStudents = [...currentGroupStudents, ...selectedAvailableStudents];
    setGroupStudents({
      ...groupStudents,
      [selectedGroup]: updatedGroupStudents
    });

    setSelectedAvailableStudents([]);
    alert(`تم إضافة ${selectedAvailableStudents.length} طالب للمجموعة`);
  };

  const handleRemoveFromGroup = () => {
    if (!selectedGroup) {
      alert('الرجاء اختيار مجموعة');
      return;
    }

    if (selectedGroupStudents.length === 0) {
      alert('الرجاء اختيار طلاب لحذفهم');
      return;
    }

    const updatedGroupStudents = currentGroupStudents.filter(
      id => !selectedGroupStudents.includes(id)
    );

    setGroupStudents({
      ...groupStudents,
      [selectedGroup]: updatedGroupStudents
    });

    setSelectedGroupStudents([]);
    alert(`تم حذف ${selectedGroupStudents.length} طالب من المجموعة`);
  };

  const handlePrintGroupReport = () => {
    if (!selectedGroup) {
      alert('الرجاء اختيار مجموعة');
      return;
    }

    const groupName = groups.find(g => g.id === selectedGroup)?.name || 'غير محدد';
    const students = allStudents.filter(s => currentGroupStudents.includes(s.id));

    const doc = new jsPDF();
    doc.text(`كشف ${groupName}`, 105, 20, { align: 'center' });
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 105, 30, { align: 'center' });
    doc.text(`عدد الطلاب: ${students.length}`, 105, 40, { align: 'center' });

    let y = 60;
    students.forEach((student, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${idx + 1}. ${student.full_name || 'غير محدد'}`, 20, y);
      doc.text(`الصف: ${student.grade_class || '-'}  الفصل: ${student.class_division || '-'}`, 100, y);
      y += 10;
    });

    doc.save(`كشف-${groupName}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const studentsInGroup = allStudents.filter(s => currentGroupStudents.includes(s.id));

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">توزيع الطلاب على المجموعات</h1>
        <p className="text-gray-600 mt-1">إدارة توزيع الطلاب على مجموعات النقل</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* القسم الأيسر - المجموعة الحالية */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">اختيار المجموعة</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>المجموعة:</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleShowGroupStudents} className="w-full bg-blue-600 hover:bg-blue-700">
                عرض
              </Button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedGroupStudents.length === studentsInGroup.length && studentsInGroup.length > 0}
                    onCheckedChange={() => handleSelectAll('group')}
                  />
                  <Label className="cursor-pointer">اختيار الكل</Label>
                </div>

                <div className="border rounded-lg p-3 bg-white h-96 overflow-y-auto">
                  {studentsInGroup.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا يوجد طلاب في المجموعة</p>
                  ) : (
                    <div className="space-y-2">
                      {studentsInGroup.map(student => (
                        <div key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <Checkbox 
                            checked={selectedGroupStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGroupStudents([...selectedGroupStudents, student.id]);
                              } else {
                                setSelectedGroupStudents(selectedGroupStudents.filter(id => id !== student.id));
                              }
                            }}
                          />
                          <label className="cursor-pointer flex-1">
                            <div>{student.full_name}</div>
                            <div className="text-xs text-gray-500">
                              الصف {student.grade_class} - {student.class_division}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* القسم الأوسط - أزرار التحكم */}
        <div className="lg:col-span-4 flex flex-col justify-center gap-4">
          <Button 
            onClick={handleAddToGroup} 
            className="w-full bg-green-600 hover:bg-green-700 gap-2 h-16"
          >
            <ArrowLeft className="w-5 h-5" />
            اختيار &lt;&lt;
          </Button>

          <Button 
            onClick={handleRemoveFromGroup} 
            variant="destructive" 
            className="w-full gap-2 h-16"
          >
            حذف &gt;&gt;
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Button 
            onClick={handlePrintGroupReport} 
            variant="outline" 
            className="w-full gap-2 h-16 border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
          >
            <Printer className="w-5 h-5" />
            طباعة كشف لكل مجموعة
          </Button>
        </div>

        {/* القسم الأيمن - الطلاب المتاحون */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-lg">اختيار الطلاب حسب الصف والفصل</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الصف:</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>الفصل:</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleShowAvailableStudents} className="w-full bg-emerald-600 hover:bg-emerald-700">
                عرض
              </Button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedAvailableStudents.length === availableStudents.length && availableStudents.length > 0}
                    onCheckedChange={() => handleSelectAll('available')}
                  />
                  <Label className="cursor-pointer">اختيار الكل</Label>
                </div>

                <div className="border rounded-lg p-3 bg-white h-96 overflow-y-auto">
                  {availableStudents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {displayedStudents.length === 0 ? 'اختر الصف والفصل لعرض الطلاب' : 'لا يوجد طلاب متاحين'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <Checkbox 
                            checked={selectedAvailableStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAvailableStudents([...selectedAvailableStudents, student.id]);
                              } else {
                                setSelectedAvailableStudents(selectedAvailableStudents.filter(id => id !== student.id));
                              }
                            }}
                          />
                          <label className="cursor-pointer flex-1">
                            <div>{student.full_name}</div>
                            <div className="text-xs text-gray-500">
                              الصف {student.grade_class} - {student.class_division}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}