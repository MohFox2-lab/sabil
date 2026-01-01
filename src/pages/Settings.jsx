import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
        <p className="text-gray-600 mt-1">إعدادات النظام والتخصيصات</p>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-l from-gray-600 to-gray-700 text-white">
          <CardTitle className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            إعدادات النظام
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600 text-lg">سيتم إضافة صفحة الإعدادات قريباً</p>
        </CardContent>
      </Card>
    </div>
  );
}