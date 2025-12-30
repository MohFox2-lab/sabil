import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GroupsTab() {
  const [groups] = useState([
    { id: 1, name: 'مجموعة الأنشطة', members: 12, color: 'bg-blue-500' },
    { id: 2, name: 'المناوبون الصباحيون', members: 8, color: 'bg-green-500' },
    { id: 3, name: 'المناوبون المسائيون', members: 8, color: 'bg-orange-500' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المجموعات والمناوبين</h2>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="w-4 h-4" />
          إنشاء مجموعة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card key={group.id} className="hover:shadow-lg transition-all">
            <CardHeader className={`${group.color} text-white`}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                {group.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">عدد الأعضاء</span>
                  <Badge variant="secondary">{group.members} طالب</Badge>
                </div>
                <Button variant="outline" className="w-full">
                  إدارة المجموعة
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            جدول المناوبة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">اليوم</th>
                  <th className="text-right p-3">الفترة الصباحية</th>
                  <th className="text-right p-3">الفترة المسائية</th>
                </tr>
              </thead>
              <tbody>
                {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((day, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{day}</td>
                    <td className="p-3">
                      <Badge className="bg-green-600">مجموعة {idx + 1}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-orange-600">مجموعة {idx + 2}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}