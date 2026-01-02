import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Save, Edit, Trash, UserPlus } from 'lucide-react';

export default function GroupsTab() {
  const [groupForm, setGroupForm] = useState({
    name: '',
    driverName: '',
    driverMobile: ''
  });

  const [groups, setGroups] = useState([
    { id: 1, groupno: 1, groupname: 'مجموعة الصباح', drivername: '', drivermobile: '' },
    { id: 2, groupno: 2, groupname: 'مجموعة المسائية', drivername: '', drivermobile: '' }
  ]);

  const [supervisors, setSupervisors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  const students = [];

  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

  const handleAddGroup = () => {
    if (groupForm.name) {
      const newGroup = {
        id: groups.length + 1,
        groupno: groups.length + 1,
        groupname: groupForm.name,
        drivername: groupForm.driverName,
        drivermobile: groupForm.driverMobile
      };
      setGroups([...groups, newGroup]);
      setGroupForm({ name: '', driverName: '', driverMobile: '' });
    }
  };

  const handleAddToGroup = () => {
    console.log('إضافة للمجموعة:', { selectedGroup, selectedDay, selectedStudents });
  };

  const handleRemoveFromGroup = () => {
    console.log('حذف العضو المحدد');
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* القسم الأيسر - إنشاء/تحرير مجموعات */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">إنشاء / تحرير مجموعات</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>اسم المجموعة</Label>
                <Input
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                  placeholder="أدخل اسم المجموعة"
                />
              </div>

              <div className="space-y-2">
                <Label>اسم السائق</Label>
                <Input
                  value={groupForm.driverName}
                  onChange={(e) => setGroupForm({...groupForm, driverName: e.target.value})}
                  placeholder="أدخل اسم السائق"
                />
              </div>

              <div className="space-y-2">
                <Label>رقم جواله</Label>
                <Input
                  value={groupForm.driverMobile}
                  onChange={(e) => setGroupForm({...groupForm, driverMobile: e.target.value})}
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleAddGroup} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Save className="w-4 h-4" />
                  حفظ
                </Button>
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  تعديل
                </Button>
                <Button variant="destructive" className="gap-2">
                  <Trash className="w-4 h-4" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* القسم الأيمن - قائمة المجموعات وإضافة الطلاب */}
        <div className="lg:col-span-8 space-y-4">
          {/* قائمة المجموعات */}
          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-lg">قائمة المجموعات</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="text-right p-3 border-l">groupno</th>
                      <th className="text-right p-3 border-l">groupname</th>
                      <th className="text-right p-3 border-l">drivername</th>
                      <th className="text-right p-3">drivermobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center p-8 text-gray-500">
                          لا توجد مجموعات
                        </td>
                      </tr>
                    ) : (
                      groups.map(group => (
                        <tr key={group.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 border-l">{group.groupno}</td>
                          <td className="p-3 border-l">{group.groupname}</td>
                          <td className="p-3 border-l">{group.drivername}</td>
                          <td className="p-3">{group.drivermobile}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* إضافة المعلم إلى مجموعة */}
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-lg">إضافة المعلم إلى مجموعة</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>المجموعة:</Label>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المجموعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.groupname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>اليوم:</Label>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اليوم" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label>اسم المعلم:</Label>
                <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">لا يوجد معلمين</p>
                  ) : (
                    students.map(student => (
                      <div key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <Checkbox 
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents([...selectedStudents, student.id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }
                          }}
                        />
                        <label className="cursor-pointer flex-1">{student.name}</label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddToGroup} className="flex-1 bg-green-600 hover:bg-green-700 gap-2">
                  <UserPlus className="w-4 h-4" />
                  إضافة للمجموعة
                </Button>
                <Button onClick={handleRemoveFromGroup} variant="destructive" className="flex-1 gap-2">
                  <Trash className="w-4 h-4" />
                  حذف العضو المحدد من المجموعة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* الإشراف على المجموعات */}
      <Card>
        <CardHeader className="bg-amber-50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            الإشراف على المجموعات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label>مشرفين المجموعة</Label>
            <div className="border rounded-lg p-4 bg-white min-h-32">
              {supervisors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا يوجد مشرفين مضافين</p>
              ) : (
                <div className="space-y-2">
                  {supervisors.map((supervisor, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded">
                      {supervisor.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}