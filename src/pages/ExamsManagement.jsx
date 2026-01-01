import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

export default function ExamsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الاختبارات</h1>
        <p className="text-gray-600 mt-1">إدارة وتنظيم الاختبارات الدراسية</p>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-l from-blue-600 to-blue-700 text-white">
          <CardTitle className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8" />
            نظام إدارة الاختبارات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600 text-lg">سيتم إضافة ميزات إدارة الاختبارات قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}