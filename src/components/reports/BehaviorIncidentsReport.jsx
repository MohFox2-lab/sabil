import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BehaviorIncidentsReport({ onClose }) {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    misconductTypeId: 'all',
    degree: 'all'
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list('-date'),
  });

  const { data: misconductTypes = [] } = useQuery({
    queryKey: ['misconduct-types'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  const filteredIncidents = incidents.filter(incident => {
    let matches = true;

    if (filters.dateFrom && incident.date < filters.dateFrom) matches = false;
    if (filters.dateTo && incident.date > filters.dateTo) matches = false;
    if (filters.misconductTypeId !== 'all' && incident.misconduct_type_id !== filters.misconductTypeId) matches = false;
    if (filters.degree !== 'all' && incident.degree !== parseInt(filters.degree)) matches = false;

    return matches;
  });

  const handlePrint = () => {
    window.print();
  };

  const totalPointsDeducted = filteredIncidents.reduce((sum, inc) => sum + (inc.points_deducted || 0), 0);

  const degreeLabels = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header - Hide on print */}
        <div className="sticky top-0 bg-emerald-600 text-white p-6 flex items-center justify-between print:hidden z-10">
          <div className="flex items-center gap-3">
            <Filter className="w-6 h-6" />
            <h2 className="text-2xl font-bold">تقرير المخالفات السلوكية</h2>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="secondary" className="gap-2">
              <Printer className="w-5 h-5" />
              طباعة
            </Button>
            <Button onClick={onClose} variant="ghost" className="text-white hover:bg-emerald-500">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters - Hide on print */}
        <div className="p-6 bg-gray-50 border-b print:hidden">
          <h3 className="text-lg font-bold mb-4">خيارات التقرير</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>نوع المخالفة</Label>
              <Select
                value={filters.misconductTypeId}
                onValueChange={(value) => setFilters({...filters, misconductTypeId: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {misconductTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>درجة المخالفة</Label>
              <Select
                value={filters.degree}
                onValueChange={(value) => setFilters({...filters, degree: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدرجات</SelectItem>
                  <SelectItem value="1">الدرجة الأولى</SelectItem>
                  <SelectItem value="2">الدرجة الثانية</SelectItem>
                  <SelectItem value="3">الدرجة الثالثة</SelectItem>
                  <SelectItem value="4">الدرجة الرابعة</SelectItem>
                  <SelectItem value="5">الدرجة الخامسة</SelectItem>
                  <SelectItem value="6">الدرجة السادسة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عدد المخالفات المطابقة</p>
              <p className="text-2xl font-bold text-blue-600">{filteredIncidents.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي النقاط المحسومة</p>
              <p className="text-2xl font-bold text-red-600">{totalPointsDeducted}</p>
            </div>
          </div>
        </div>

        {/* Report Content - Printable */}
        <div className="p-8">
          {/* Print Header */}
          <div className="hidden print:block mb-8 text-center border-b-4 border-emerald-600 pb-4">
            <h1 className="text-3xl font-bold text-emerald-800 mb-2">تقرير المخالفات السلوكية</h1>
            <p className="text-gray-600">وزارة التعليم - المملكة العربية السعودية</p>
            <p className="text-gray-600">قواعد السلوك والمواظبة - الإصدار الخامس 1447هـ</p>
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <div>تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</div>
              <div>عدد المخالفات: {filteredIncidents.length}</div>
              <div>إجمالي النقاط: {totalPointsDeducted}</div>
            </div>
          </div>

          {/* Screen Header */}
          <div className="print:hidden mb-6">
            <h3 className="text-2xl font-bold text-emerald-800 mb-2">نتائج التقرير</h3>
            <p className="text-gray-600">عدد المخالفات: {filteredIncidents.length} | إجمالي النقاط المحسومة: {totalPointsDeducted}</p>
          </div>

          {/* Table */}
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">لا توجد مخالفات تطابق المعايير المحددة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-right">#</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">اسم الطالب</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">نوع المخالفة</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">الدرجة</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">التاريخ</th>
                    <th className="border border-gray-300 px-4 py-3 text-center">النقاط المحسومة</th>
                    <th className="border border-gray-300 px-4 py-3 text-right print:hidden">الإجراءات المتخذة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((incident, index) => (
                    <tr key={incident.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                      <td className="border border-gray-300 px-4 py-3 font-semibold">{incident.student_name}</td>
                      <td className="border border-gray-300 px-4 py-3">{incident.misconduct_title}</td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <Badge className={
                          incident.degree <= 2 ? 'bg-blue-100 text-blue-800' :
                          incident.degree === 3 ? 'bg-yellow-100 text-yellow-800' :
                          incident.degree === 4 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {degreeLabels[incident.degree - 1]}
                        </Badge>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center text-sm">
                        {new Date(incident.date).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <span className="font-bold text-red-600 text-lg">-{incident.points_deducted}</span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm print:hidden">
                        {incident.actions_taken || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan="5" className="border border-gray-300 px-4 py-3 text-left">الإجمالي</td>
                    <td className="border border-gray-300 px-4 py-3 text-center text-red-600 text-xl">-{totalPointsDeducted}</td>
                    <td className="border border-gray-300 px-4 py-3 print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Print Footer */}
          <div className="hidden print:block mt-8 pt-4 border-t-2 text-center text-sm text-gray-600">
            <p>هذا التقرير صادر من نظام إدارة قواعد السلوك والمواظبة</p>
            <p className="mt-2">© وزارة التعليم - المملكة العربية السعودية</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}