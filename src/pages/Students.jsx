import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Phone, 
  LogOut,
  FileText,
  ClipboardList,
  Calendar,
  FileSignature,
  AlertTriangle,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';
import ContactInfoTab from '../components/students/ContactInfoTab';
import StudentReportsTab from '../components/students/StudentReportsTab';
import ExcuseManagementTab from '../components/students/ExcuseManagementTab';
import AbsencesTab from '../components/students/AbsencesTab';
import PledgesTab from '../components/students/PledgesTab';
import TrackingTab from '../components/students/TrackingTab';
import SMSShieldTab from '../components/students/SMSShieldTab';
import RegisterIncidentTab from '../components/affairs/RegisterIncidentTab';
import BehaviorContractTab from '../components/students/BehaviorContractTab';
import ExcelViewerTab from '../components/students/ExcelViewerTab';
import ImportWizardTab from '../components/students/ImportWizardTab';

export default function Students() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">شؤون الطلاب</h1>
        <p className="text-gray-600 mt-1">عرض وإدارة بيانات جميع الطلاب</p>
      </div>

      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="h-auto flex flex-col gap-2 bg-transparent p-0">
          <div className="flex flex-wrap gap-2 justify-center">
            <TabsTrigger value="contact" className="gap-2 bg-white border-2 border-emerald-300 text-emerald-700 data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500 px-3 py-2 text-sm">
              <Phone className="w-4 h-4" />
              <span className="truncate">بيانات الاتصال</span>
            </TabsTrigger>
            <TabsTrigger value="misconduct" className="gap-2 bg-white border-2 border-red-300 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 px-3 py-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span className="truncate">المخالفات السلوكية</span>
            </TabsTrigger>
            <TabsTrigger value="contract" className="gap-2 bg-white border-2 border-blue-300 text-blue-700 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500 px-3 py-2 text-sm">
              <FileCheck className="w-4 h-4" />
              <span className="truncate">التعاقد السلوكي</span>
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
            <TabsTrigger value="sms-shield" className="gap-2 bg-white border-2 border-indigo-300 text-indigo-700 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-500 px-3 py-2 text-sm">
              <FileText className="w-4 h-4" />
              <span className="truncate">درع الرسائل</span>
            </TabsTrigger>
            <TabsTrigger value="excel-viewer" className="gap-2 bg-white border-2 border-green-300 text-green-700 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500 px-3 py-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="truncate">استيراد Excel (عرض فقط)</span>
            </TabsTrigger>
            <TabsTrigger value="import-wizard" className="gap-2 bg-white border-2 border-violet-300 text-violet-700 data-[state=active]:bg-violet-500 data-[state=active]:text-white data-[state=active]:border-violet-500 px-3 py-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              <span className="truncate">🧙 معالج الاستيراد</span>
            </TabsTrigger>
            <TabsTrigger value="exit" className="gap-2 bg-white border-2 border-red-300 text-red-700 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 px-3 py-2 text-sm">
              <LogOut className="w-4 h-4" />
              <span className="truncate">خروج</span>
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="contact" className="mt-6">
          <ContactInfoTab />
        </TabsContent>

        <TabsContent value="misconduct" className="mt-6">
          <RegisterIncidentTab />
        </TabsContent>

        <TabsContent value="contract" className="mt-6">
          <BehaviorContractTab />
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

        <TabsContent value="sms-shield" className="mt-6">
          <SMSShieldTab />
        </TabsContent>

        <TabsContent value="excel-viewer" className="mt-6">
          <ExcelViewerTab />
        </TabsContent>

        <TabsContent value="import-wizard" className="mt-6">
          <ImportWizardTab />
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