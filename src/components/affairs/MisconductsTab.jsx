import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, AlertCircle, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MisconductsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDegree, setFilterDegree] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  const { data: misconducts = [], isLoading } = useQuery({
    queryKey: ['misconducts'],
    queryFn: () => base44.entities.MisconductType.list(),
  });

  const filteredMisconducts = misconducts.filter(m => {
    const matchSearch = m.title?.includes(searchTerm) || m.description?.includes(searchTerm);
    const matchDegree = filterDegree === 'all' || m.degree === parseInt(filterDegree);
    const matchStage = filterStage === 'all' || m.applicable_stages?.includes(filterStage);
    return matchSearch && matchDegree && matchStage;
  });

  const getDegreeColor = (degree) => {
    const colors = {
      1: 'bg-blue-100 text-blue-800 border-blue-300',
      2: 'bg-green-100 text-green-800 border-green-300',
      3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      4: 'bg-orange-100 text-orange-800 border-orange-300',
      5: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[degree] || colors[1];
  };

  const getDegreeLabel = (degree) => {
    return ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة'][degree - 1] || degree;
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-emerald-800">
            <p className="font-semibold mb-1">لائحة المخالفات السلوكية</p>
            <p>وفقًا لقواعد السلوك والمواظبة للطلبة - الإصدار الخامس 1447هـ - وزارة التعليم</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="البحث في المخالفات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Select value={filterDegree} onValueChange={setFilterDegree}>
          <SelectTrigger>
            <SelectValue placeholder="فلترة حسب الدرجة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدرجات</SelectItem>
            <SelectItem value="1">الدرجة الأولى (1 درجة)</SelectItem>
            <SelectItem value="2">الدرجة الثانية (2 درجة)</SelectItem>
            <SelectItem value="3">الدرجة الثالثة (3 درجات)</SelectItem>
            <SelectItem value="4">الدرجة الرابعة (10 درجات)</SelectItem>
            <SelectItem value="5">الدرجة الخامسة (15 درجة)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger>
            <SelectValue placeholder="فلترة حسب المرحلة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المراحل</SelectItem>
            <SelectItem value="ابتدائي">ابتدائي</SelectItem>
            <SelectItem value="متوسط">متوسط</SelectItem>
            <SelectItem value="ثانوي">ثانوي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Misconduct Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      ) : filteredMisconducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مخالفات تطابق البحث</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50 border-b-2">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-emerald-700" />
              <span>لائحة المخالفات السلوكية ({filteredMisconducts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="text-right font-bold w-[250px]">المخالفة</TableHead>
                    <TableHead className="text-right font-bold">الوصف</TableHead>
                    <TableHead className="text-center font-bold w-[120px]">الدرجة</TableHead>
                    <TableHead className="text-center font-bold w-[120px]">النقاط</TableHead>
                    <TableHead className="text-right font-bold w-[180px]">المراحل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMisconducts.map((misconduct) => (
                    <TableRow key={misconduct.id} className="hover:bg-emerald-50 transition-colors">
                      <TableCell className="font-semibold text-gray-800">
                        {misconduct.title}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {misconduct.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getDegreeColor(misconduct.degree)} border font-bold px-3 py-1`}>
                          {getDegreeLabel(misconduct.degree)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center bg-red-100 text-red-800 font-bold px-4 py-2 rounded-full border-2 border-red-300">
                          -{misconduct.points_deduction}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {misconduct.applicable_stages?.map((stage, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(degree => {
          const count = misconducts.filter(m => m.degree === degree).length;
          return (
            <Card key={degree} className={`text-center border-2 ${
              degree === 1 ? 'border-blue-200' :
              degree === 2 ? 'border-green-200' :
              degree === 3 ? 'border-yellow-200' :
              degree === 4 ? 'border-orange-200' :
              'border-red-200'
            }`}>
              <CardContent className="p-4">
                <Badge className={getDegreeColor(degree)}>
                  الدرجة {getDegreeLabel(degree)}
                </Badge>
                <p className="text-3xl font-bold text-gray-800 mt-2">{count}</p>
                <p className="text-xs text-gray-600 mt-1">مخالفة</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}