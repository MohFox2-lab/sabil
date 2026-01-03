import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Calendar, 
  Users, 
  Menu, 
  X,
  Upload,
  Printer,
  Download,
  ClipboardList,
  FileSignature,
  BookOpen,
  Shield,
  Home,
  AlertTriangle,
  GraduationCap,
  Settings,
  MessageSquare,
  CheckCircle,
  UserCheck,
  LogOut,
  BarChart3,
  Undo2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['behavior-incidents'],
    queryFn: () => base44.entities.BehaviorIncident.list(),
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['absences'],
    queryFn: () => base44.entities.Absence.list(),
  });

  const handleExportStudents = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShowStudentCount = () => {
    alert(`عدد الطلاب: ${students.length} طالب/طالبة`);
  };

  const handleShowMisconductCount = () => {
    alert(`عدد المخالفات السلوكية: ${incidents.length} مخالفة`);
  };

  const handleExportAbsences = () => {
    const csv = [
      ['اسم الطالب', 'رقم الطالب', 'التاريخ', 'يوجد عذر', 'نوع العذر', 'ملاحظات'],
      ...absences.map(a => [
        a.student_name || '',
        a.student_id || '',
        a.date || '',
        a.has_excuse ? 'نعم' : 'لا',
        a.excuse_type || '',
        a.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absences-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportGrades = () => {
    const doc = new jsPDF();
    
    doc.text('تقرير درجات الطلاب', 105, 20, { align: 'center' });
    doc.text(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, 105, 30, { align: 'center' });
    
    let y = 50;
    students.forEach((student, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${idx + 1}. ${student.full_name || 'غير محدد'}`, 20, y);
      doc.text(`السلوك: ${student.behavior_score || 0}`, 80, y);
      doc.text(`المواظبة: ${student.attendance_score || 0}`, 120, y);
      doc.text(`التميز: ${student.distinguished_score || 0}`, 160, y);
      y += 10;
    });

    doc.save(`grades-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleLogout = () => {
    if (confirm('هل تريد تسجيل الخروج من النظام؟')) {
      base44.auth.logout();
    }
  };

  const menuItems = [
    {
      label: 'ملف',
      icon: FileText,
      items: [
        { label: 'نظام الرسائل النصية', page: 'SMSSystem', icon: MessageSquare },
        { label: 'المجموعات والمناوبين', page: 'GroupsSystem', icon: Users },
        { label: 'توزيع الطلاب على المجموعات', page: 'StudentGroupDistribution', icon: Users },
        { label: 'طباعة', icon: Printer, action: 'print' },
        { label: 'تحميل PDF', icon: Download, action: 'pdf' },
        { type: 'separator' },
        { label: 'إخراج من النظام', icon: LogOut, action: 'logout' },
        { label: 'عدد الطلاب', icon: Users, action: 'show-student-count' },
        { label: 'عدد المخالفات السلوكية', icon: AlertTriangle, action: 'show-misconduct-count' },
        { label: 'إخراج بيانات الغياب', icon: Calendar, action: 'export-absences' },
        { label: 'إخراج درجات الطلاب', icon: BarChart3, action: 'export-grades' },
        { label: 'إرجاع من الآخر', icon: Undo2, action: 'undo-last' }
      ]
    },
    {
      label: 'الحضور والانصراف',
      icon: Calendar,
      items: [
        { label: 'تسجيل الحضور', page: 'AttendanceRegistration', icon: CheckCircle },
        { label: 'الاستئذان', page: 'LeaveRequest', icon: UserCheck },
        { label: 'تسجيل الخروج', page: 'CheckOut', icon: LogOut }
      ]
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-emerald-700 to-teal-800 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="bg-amber-400 p-3 rounded-xl shadow-lg">
                <Shield className="w-8 h-8 text-emerald-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">قواعد السلوك والمواظبة</h1>
                <p className="text-emerald-100 text-sm">لطلبة التعليم العام - الإصدار الخامس 1447هـ</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant={currentPageName === 'Dashboard' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <Home className="w-5 h-5" />
                  الرئيسية
                </Button>
              </Link>

              {menuItems.map((menu, idx) => {
                if (menu.page) {
                  return (
                    <Link key={idx} to={createPageUrl(menu.page)}>
                      <Button variant={currentPageName === menu.page ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                        <menu.icon className="w-5 h-5" />
                        {menu.label}
                      </Button>
                    </Link>
                  );
                }
                
                return (
                  <DropdownMenu key={idx}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-white hover:bg-emerald-600 gap-2">
                        <menu.icon className="w-5 h-5" />
                        {menu.label}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {menu.items.map((item, i) => {
                        if (item.type === 'separator') {
                          return <DropdownMenuSeparator key={i} />;
                        }
                        return (
                          <DropdownMenuItem key={i} className="cursor-pointer" onClick={() => {
                            if (item.page) {
                              navigate(createPageUrl(item.page));
                              return;
                            }

                            switch (item.action) {
                              case 'logout':
                                handleLogout();
                                break;

                              case 'show-student-count':
                                handleShowStudentCount();
                                break;

                              case 'show-misconduct-count':
                                handleShowMisconductCount();
                                break;

                              case 'export-absences':
                                handleExportAbsences();
                                break;

                              case 'export-grades':
                                handleExportGrades();
                                break;

                              case 'import':
                                handleExportStudents();
                                break;

                              case 'print':
                                window.print();
                                break;

                              case 'pdf':
                                const doc = new jsPDF();
                                doc.text('تقرير مختصر', 105, 15, { align: 'center' });
                                doc.text(`عدد الطلاب: ${students.length}`, 20, 30);
                                doc.text(`عدد المخالفات: ${incidents.length}`, 20, 40);
                                doc.save(`report-${new Date().toISOString().split('T')[0]}.pdf`);
                                break;

                              case 'undo-last':
                                navigate(-1);
                                break;

                              default:
                                alert('هذه الوظيفة غير مربوطة بعد');
                            }
                          }}>
                            {item.icon && <item.icon className="w-4 h-4 ml-2" />}
                            {item.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}

              <Link to={createPageUrl('Students')}>
                <Button variant={currentPageName === 'Students' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600">
                  شؤون الطلاب
                </Button>
              </Link>

              <Link to={createPageUrl('Reports')}>
                <Button variant={currentPageName === 'Reports' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600">
                  التقارير
                </Button>
              </Link>

              <Link to={createPageUrl('ExamsManagement')}>
                <Button variant={currentPageName === 'ExamsManagement' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <GraduationCap className="w-5 h-5" />
                  إدارة الاختبارات
                </Button>
              </Link>

              <Link to={createPageUrl('UsersManagement')}>
                <Button variant={currentPageName === 'UsersManagement' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المستخدمين
                </Button>
              </Link>

              <Link to={createPageUrl('Settings')}>
                <Button variant={currentPageName === 'Settings' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات
                </Button>
              </Link>

              <Link to={createPageUrl('ApiDocs')}>
                <Button variant={currentPageName === 'ApiDocs' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <BookOpen className="w-5 h-5" />
                  توثيق API
                </Button>
              </Link>

              <Link to={createPageUrl('ImportWizard')}>
                <Button variant={currentPageName === 'ImportWizard' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600 gap-2">
                  <Upload className="w-5 h-5" />
                  🧙 معالج الاستيراد
                </Button>
              </Link>
              </nav>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link to={createPageUrl('Dashboard')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start gap-2">
                  <Home className="w-5 h-5" />
                  الرئيسية
                </Button>
              </Link>
              <Link to={createPageUrl('Students')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start">
                  شؤون الطلاب
                </Button>
              </Link>
              <Link to={createPageUrl('Absences')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start">
                  أعذار الطلاب
                </Button>
              </Link>
              <Link to={createPageUrl('Reports')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start">
                  التقارير
                </Button>
              </Link>
              <Link to={createPageUrl('ExamsManagement')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start gap-2">
                  <GraduationCap className="w-5 h-5" />
                  إدارة الاختبارات
                </Button>
              </Link>
              <Link to={createPageUrl('UsersManagement')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start gap-2">
                  <Users className="w-5 h-5" />
                  إدارة المستخدمين
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start gap-2">
                  <Settings className="w-5 h-5" />
                  إعدادات
                </Button>
              </Link>
              </div>
              )}
              </div>
              </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-emerald-200">وزارة التعليم - المملكة العربية السعودية</p>
          <p className="text-emerald-300 text-sm mt-2">قواعد السلوك والمواظبة © 1447هـ - 2025م</p>
        </div>
      </footer>
    </div>
  );
}