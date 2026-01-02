import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Bell, History, FileText } from 'lucide-react';
import SMSShieldTab from '../components/students/SMSShieldTab';
import PushNotificationsTab from '../components/sms/PushNotificationsTab';
import MessageHistoryTab from '../components/sms/MessageHistoryTab';

export default function SMSSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">نظام الرسائل والإشعارات</h1>
        <p className="text-gray-600 mt-1">إدارة شاملة للرسائل النصية والإشعارات الفورية</p>
      </div>
      
      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>الرسائل النصية</span>
          </TabsTrigger>
          <TabsTrigger value="push" className="gap-2">
            <Bell className="w-4 h-4" />
            <span>الإشعارات الفورية</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span>سجل الرسائل</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="mt-6">
          <SMSShieldTab />
        </TabsContent>

        <TabsContent value="push" className="mt-6">
          <PushNotificationsTab />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <MessageHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}