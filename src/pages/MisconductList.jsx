import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, AlertCircle } from 'lucide-react';

export default function MisconductList() {
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
      5: 'bg-red-100 text-red-800 border-red-300',
      6: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[degree] || colors[1];
  };

  const groupedByDegree = {};
  filteredMisconducts.forEach(m => {
    if (!groupedByDegree[m.degree]) {
      groupedByDegree[m.degree] = [];
    }
    groupedByDegree[m.degree].push(m);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-amber-400 p-4 rounded-xl">
            <Shield className="w-10 h-10 text-emerald-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">لائحة المخالفات السلوكية</h1>
            <p className="text-emerald-100 mt-1">وفقًا لقواعد السلوك والمواظبة - الإصدار الخامس 1447هـ</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
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
                <SelectValue placeholder="الدرجة" />
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
                <SelectValue placeholder="المرحلة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المراحل</SelectItem>
                <SelectItem value="ابتدائي">ابتدائي</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="ثانوي">ثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Misconduct Cards by Degree */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      ) : Object.keys(groupedByDegree).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد مخالفات</p>
          </CardContent>
        </Card>
      ) : (
        Object.keys(groupedByDegree).sort().map(degree => (
          <Card key={degree} className="shadow-lg">
            <CardHeader className={`${getDegreeColor(degree)} border-b-2`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  الدرجة {['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'][degree - 1]}
                </CardTitle>
                <Badge className="bg-white text-gray-800 text-lg px-4 py-2">
                  {groupedByDegree[degree][0].points_deduction} درجة حسم
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedByDegree[degree].map((misconduct) => (
                  <div key={misconduct.id} className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all">
                    <h4 className="font-bold text-gray-800 mb-2">{misconduct.title}</h4>
                    {misconduct.description && (
                      <p className="text-sm text-gray-600 mb-3">{misconduct.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {misconduct.applicable_stages?.map((stage, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}