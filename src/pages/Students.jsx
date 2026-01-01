import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  UserCircle, 
  Phone, 
  LogOut,
  FileText,
  ClipboardList,
  Calendar,
  FileSignature
} from 'lucide-react';
import BasicInfoTab from '../components/students/BasicInfoTab';
import ContactInfoTab from '../components/students/ContactInfoTab';
import StudentReportsTab from '../components/students/StudentReportsTab';
import ExcuseManagementTab from '../components/students/ExcuseManagementTab';
import AbsencesTab from '../components/students/AbsencesTab';
import PledgesTab from '../components/students/PledgesTab';
import TrackingTab from '../components/students/TrackingTab';

export default function Students() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
        <p className="text-gray-600 mt-1">عرض وإدارة بيانات جميع الطلاب</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2 justify-center">
            <TabsTrigger value="basic" className="gap-2 bg-white border-2 border-blue-300 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500 px-3 py-2 text-sm">
              <UserCircle className="w-4 h-4" />
              <span className="truncate">بيانات أساسية</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2 bg-white border-2 border-emerald-300 text-emerald-700 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500 px-3 py-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="truncate">بيانات الاتصال</span>
            </TabsTrigger>
            <TabsTrigger value="excuse" className="gap-2 bg-white border-2 border-purple-300 text-purple-700 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500 px-3 py-2 text-sm">
              <ClipboardList className="w-4 h-4" />
              <span className="truncate">استئذان الطلاب</span>
            </TabsTrigger>
            <TabsTrigger value="absences" className="gap-2 bg-white border-2 border-orange-300 text-orange-700 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-orange-500 px-3 py-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="truncate">أعذار الطلاب</span>
            </TabsTrigger>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <TabsTrigger value="pledges" className="gap-2 bg-white border-2 border-pink-300 text-pink-700 data-[state=active]:bg-pink-500 data-[state=active]:text-white data-[state=active]:border-pink-500 px-3 py-2 text-sm">
              <FileSignature className="w-4 h-4" />
              <span className="truncate">التعهدات الخطية</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2 bg-white border-2 border-teal-300 text-teal-700 data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:border-teal-500 px-3 py-2 text-sm">
              <ClipboardList className="w-4 h-4" />
              <span className="truncate">سجل متابعة الطلاب</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2 bg-white border-2 border-amber-300 text-amber-700 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-500 px-3 py-2 text-sm">
              <FileText className="w-4 h-4" />
              <span className="truncate">التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="exit" className="gap-2 bg-white border-2 border-red-300 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 px-3 py-2 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="truncate">خروج</span>
            </TabsTrigger>
          </div>
        </div>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactInfoTab />
        </TabsContent>

        <TabsContent value="excuse" className="mt-6">
          <ExcuseManagementTab />
        </TabsContent>

        <TabsContent value="absences" className="mt-6">
          <AbsencesTab />
        </TabsContent>

        <TabsContent value="pledges" className="mt-6">
          <PledgesTab />
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <TrackingTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <StudentReportsTab />
        </TabsContent>

        <TabsContent value="exit" className="mt-6">
          <Card>
            <div className="p-12 text-center">
              <LogOut className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">الخروج من إدارة الطلاب</h3>
              <p className="text-gray-600 mb-6">سيتم حفظ جميع التغييرات تلقائياً</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}