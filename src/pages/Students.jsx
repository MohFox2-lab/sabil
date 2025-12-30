import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  UserCircle, 
  Phone, 
  MessageSquare, 
  Users, 
  LogOut,
  FileText
} from 'lucide-react';
import BasicInfoTab from '../components/students/BasicInfoTab';
import ContactInfoTab from '../components/students/ContactInfoTab';
import SMSTab from '../components/students/SMSTab';
import GroupsTab from '../components/students/GroupsTab';
import StudentReportsTab from '../components/students/StudentReportsTab';

export default function Students() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
        <p className="text-gray-600 mt-1">عرض وإدارة بيانات جميع الطلاب</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-transparent gap-2">
          <TabsTrigger value="basic" className="gap-2 bg-white border-2 border-blue-300 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500">
            <UserCircle className="w-4 h-4" />
            بيانات أساسية
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2 bg-white border-2 border-emerald-300 text-emerald-700 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500">
            <Phone className="w-4 h-4" />
            بيانات الاتصال
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2 bg-white border-2 border-purple-300 text-purple-700 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500">
            <MessageSquare className="w-4 h-4" />
            نظام الرسائل النصية
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2 bg-white border-2 border-indigo-300 text-indigo-700 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-500">
            <Users className="w-4 h-4" />
            المجموعات والمناوبين
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2 bg-white border-2 border-amber-300 text-amber-700 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:border-amber-500">
            <FileText className="w-4 h-4" />
            التقارير
          </TabsTrigger>
          <TabsTrigger value="exit" className="gap-2 bg-white border-2 border-red-300 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500">
            <LogOut className="w-4 h-4" />
            خروج
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactInfoTab />
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <SMSTab />
        </TabsContent>

        <TabsContent value="groups" className="mt-6">
          <GroupsTab />
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