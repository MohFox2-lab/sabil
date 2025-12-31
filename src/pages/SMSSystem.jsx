import React from 'react';
import SMSTab from '../components/students/SMSTab';

export default function SMSSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">نظام الرسائل النصية</h1>
        <p className="text-gray-600 mt-1">إرسال رسائل نصية للطلاب وأولياء الأمور</p>
      </div>
      
      <SMSTab />
    </div>
  );
}