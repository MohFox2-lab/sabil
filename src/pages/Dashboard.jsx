import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  AlertTriangle, 
  Award, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft
} from 'lucide-react';

export default function Dashboard() {
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list('-created_date', 5),
  });

  const { data: positiveActions = [] } = useQuery({
    queryKey: ['positiveActions'],
    queryFn: () => base44.entities.StudentPositiveAction.list('-created_date', 5),
  });

  const totalStudents = students.length;
  const avgBehaviorScore = students.length > 0 
    ? (students.reduce((sum, s) => sum + (s.behavior_score || 0) + (s.distinguished_score || 0), 0) / students.length).toFixed(1)
    : 0;
  const avgAttendanceScore = students.length > 0
    ? (students.reduce((sum, s) => sum + (s.attendance_score || 0), 0) / students.length).toFixed(1)
    : 0;

  const statsCards = [
    {
      title: 'عدد الطلاب',
      value: totalStudents,
      icon: Users,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'متوسط السلوك',
      value: `${avgBehaviorScore}/100`,
      icon: Award,
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'متوسط المواظبة',
      value: `${avgAttendanceScore}/100`,
      icon: Calendar,
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-600'
    },
    {
      title: 'المخالفات (هذا الشهر)',
      value: incidents.length,
      icon: AlertTriangle,
      bgColor: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-2xl">
        <h2 className="text-3xl font-bold mb-2">مرحباً بك في نظام إدارة السلوك والمواظبة</h2>
        <p className="text-emerald-100">نظام متكامل لتطبيق قواعد السلوك والمواظبة وفق لائحة وزارة التعليم</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
            <div className={`absolute top-0 left-0 w-2 h-full ${stat.bgColor}`} />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card className="shadow-lg">
          <CardHeader className="bg-red-50 border-b-2 border-red-200">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              آخر المخالفات السلوكية
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {incidents.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد مخالفات مسجلة</p>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{incident.student_name}</p>
                      <p className="text-sm text-gray-600">{incident.misconduct_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(incident.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{incident.points_deducted}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to={createPageUrl('BehaviorIncidents')}>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Positive Actions */}
        <Card className="shadow-lg">
          <CardHeader className="bg-emerald-50 border-b-2 border-emerald-200">
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5" />
              آخر السلوكيات المتميزة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {positiveActions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد سلوكيات متميزة مسجلة</p>
            ) : (
              <div className="space-y-4">
                {positiveActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{action.student_name}</p>
                      <p className="text-sm text-gray-600">{action.positive_action_title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(action.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      +{action.points_earned}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to={createPageUrl('PositiveBehavior')}>
              <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                عرض الكل
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-l from-amber-50 to-yellow-50 border-b-2 border-amber-200">
          <CardTitle className="text-amber-900">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={createPageUrl('Students')} className="block">
              <Button className="w-full h-24 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex flex-col items-center justify-center gap-2">
                <Users className="w-8 h-8" />
                <span className="font-bold">إدارة الطلاب</span>
              </Button>
            </Link>
            
            <Link to={createPageUrl('BehaviorIncidents')} className="block">
              <Button className="w-full h-24 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                <span className="font-bold">تسجيل مخالفة</span>
              </Button>
            </Link>

            <Link to={createPageUrl('PositiveBehavior')} className="block">
              <Button className="w-full h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex flex-col items-center justify-center gap-2">
                <Award className="w-8 h-8" />
                <span className="font-bold">تسجيل سلوك متميز</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}