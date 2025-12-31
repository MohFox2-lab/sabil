import React from 'react';
import GroupsTab from '../components/students/GroupsTab';

export default function GroupsSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">المجموعات والمناوبين</h1>
        <p className="text-gray-600 mt-1">إدارة مجموعات الطلاب والجداول المناوبة</p>
      </div>
      
      <GroupsTab />
    </div>
  );
}