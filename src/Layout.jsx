import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
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
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      label: 'ملف',
      icon: FileText,
      items: [
        { label: 'تحميل أسماء الطلاب', icon: Upload, action: 'import' },
        { label: 'طباعة', icon: Printer, action: 'print' },
        { label: 'تحميل PDF', icon: Download, action: 'pdf' }
      ]
    },
    {
      label: 'الحضور والانصراف',
      icon: Calendar,
      items: [
        { label: 'أعذار الطلاب', page: 'Absences' },
        { label: 'التعهدات الخطية', page: 'Pledges' },
        { label: 'سجل متابعة الطلاب', page: 'StudentTracking' }
      ]
    },
    {
      label: 'شؤون الطلاب',
      icon: Users,
      page: 'StudentAffairs'
    }
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
                <Button variant={currentPageName === 'Dashboard' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600">
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
                      {menu.items.map((item, i) => (
                        <DropdownMenuItem key={i} className="cursor-pointer" onClick={() => {
                          if (item.page) {
                            window.location.href = createPageUrl(item.page);
                          }
                        }}>
                          <item.icon className="w-4 h-4 ml-2" />
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}

              <Link to={createPageUrl('Students')}>
                <Button variant={currentPageName === 'Students' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600">
                  الطلاب
                </Button>
              </Link>

              <Link to={createPageUrl('Reports')}>
                <Button variant={currentPageName === 'Reports' ? 'secondary' : 'ghost'} className="text-white hover:bg-emerald-600">
                  التقارير
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
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start">
                  الرئيسية
                </Button>
              </Link>
              <Link to={createPageUrl('Students')} className="block">
                <Button variant="ghost" className="w-full text-white hover:bg-emerald-600 justify-start">
                  الطلاب
                </Button>
              </Link>
              <Link to={createPageUrl('StudentAffairs')} className="block">
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