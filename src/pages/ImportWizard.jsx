import React from 'react';
import ImportWizardTab from '../components/students/ImportWizardTab';

export default function ImportWizard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🧙 معالج استيراد الطلاب</h1>
        <p className="text-gray-600 mt-1">استيراد بيانات الطلاب من ملفات Excel بطريقة ذكية</p>
      </div>

      <ImportWizardTab />
    </div>
  );
}