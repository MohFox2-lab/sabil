import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ClipboardList, AlertTriangle, FileBarChart, Upload, Users, Settings } from 'lucide-react';
import MisconductsTab from '../components/affairs/MisconductsTab';
import RegisterIncidentTab from '../components/affairs/RegisterIncidentTab';
import StudentRecordTab from '../components/affairs/StudentRecordTab';
import ReportsTab from '../components/affairs/ReportsTab';
import StudentDataTab from '../components/affairs/StudentDataTab';
import ImportStudentsTab from '../components/affairs/ImportStudentsTab';

export default function StudentAffairs() {
  const [activeTab, setActiveTab] = useState('misconducts');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 p-4 rounded-xl shadow-lg">
            <Shield className="w-12 h-12 text-emerald-900" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">درع شؤون الطلاب</h1>
            <p className="text-emerald-100 mt-2">إدارة متكاملة للسلوك والمواظبة وفق لائحة وزارة التعليم - الإصدار الخامس 1447هـ</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Card className="shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-transparent h-auto">
              <TabsTrigger 
                value="misconducts" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-4 text-sm md:text-base font-bold"
              >
                <ClipboardList className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                <span className="hidden md:inline">لائحة </span>المخالفات
              </TabsTrigger>
              <TabsTrigger 
                value="students" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-4 text-sm md:text-base font-bold"
              >
                <Users className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                بيانات الطلاب
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white py-4 text-sm md:text-base font-bold"
              >
                <Upload className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                استيراد ملف
              </TabsTrigger>
              <TabsTrigger 
                value="records" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-4 text-sm md:text-base font-bold"
              >
                <FileBarChart className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                سجل الطالب
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white py-4 text-sm md:text-base font-bold"
              >
                <FileBarChart className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                التقارير
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            <TabsContent value="misconducts" className="mt-0">
              <MisconductsTab />
            </TabsContent>

            <TabsContent value="students" className="mt-0">
              <StudentDataTab />
            </TabsContent>

            <TabsContent value="import" className="mt-0">
              <ImportStudentsTab />
            </TabsContent>

            <TabsContent value="records" className="mt-0">
              <StudentRecordTab />
            </TabsContent>

            <TabsContent value="reports" className="mt-0">
              <ReportsTab />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}