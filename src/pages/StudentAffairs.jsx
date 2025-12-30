import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ClipboardList, AlertTriangle, FileBarChart, Settings } from 'lucide-react';
import MisconductsTab from '../components/affairs/MisconductsTab';
import RegisterIncidentTab from '../components/affairs/RegisterIncidentTab';
import StudentRecordTab from '../components/affairs/StudentRecordTab';
import ReportsTab from '../components/affairs/ReportsTab';

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
            <h1 className="text-4xl font-bold">شؤون الطلاب</h1>
            <p className="text-emerald-100 mt-2">إدارة متكاملة للسلوك والمواظبة وفق لائحة وزارة التعليم</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Card className="shadow-xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="bg-gradient-to-l from-gray-50 to-gray-100 border-b-2">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto">
              <TabsTrigger 
                value="misconducts" 
                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-4 text-base font-bold"
              >
                <ClipboardList className="w-5 h-5 ml-2" />
                المخالفات
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-4 text-base font-bold"
              >
                <AlertTriangle className="w-5 h-5 ml-2" />
                تسجيل مخالفة
              </TabsTrigger>
              <TabsTrigger 
                value="records" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white py-4 text-base font-bold"
              >
                <FileBarChart className="w-5 h-5 ml-2" />
                سجل الطالب
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white py-4 text-base font-bold"
              >
                <FileBarChart className="w-5 h-5 ml-2" />
                التقارير
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="p-6">
            <TabsContent value="misconducts" className="mt-0">
              <MisconductsTab />
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <RegisterIncidentTab />
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