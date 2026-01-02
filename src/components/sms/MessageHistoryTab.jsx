import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Send
} from 'lucide-react';

export default function MessageHistoryTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['sms-messages'],
    queryFn: () => base44.entities.SMSMessage.list('-sent_date', 100),
  });

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message_content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesType = typeFilter === 'all' || msg.message_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'قيد الانتظار', className: 'bg-yellow-600', icon: Clock },
      sent: { label: 'تم الإرسال', className: 'bg-blue-600', icon: Send },
      delivered: { label: 'تم التوصيل', className: 'bg-green-600', icon: CheckCircle },
      failed: { label: 'فشل', className: 'bg-red-600', icon: XCircle }
    };
    const { label, className, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 ml-1" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const config = {
      sms: { label: 'رسالة نصية', className: 'bg-purple-600' },
      push_notification: { label: 'إشعار فوري', className: 'bg-indigo-600' },
      whatsapp: { label: 'واتساب', className: 'bg-green-600' }
    };
    const { label, className } = config[type] || config.sms;
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">إجمالي الرسائل</div>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">تم التوصيل</div>
            <div className="text-2xl font-bold text-green-600">
              {messages.filter(m => m.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">قيد الانتظار</div>
            <div className="text-2xl font-bold text-yellow-600">
              {messages.filter(m => m.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">فشل</div>
            <div className="text-2xl font-bold text-red-600">
              {messages.filter(m => m.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو المحتوى..."
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="sent">تم الإرسال</SelectItem>
                <SelectItem value="delivered">تم التوصيل</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="sms">رسالة نصية</SelectItem>
                <SelectItem value="push_notification">إشعار فوري</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader className="bg-gradient-to-l from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            سجل الرسائل
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-500">لا توجد رسائل</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-4 font-semibold">#</th>
                    <th className="text-right p-4 font-semibold">الطالب</th>
                    <th className="text-right p-4 font-semibold">المستلم</th>
                    <th className="text-right p-4 font-semibold">النوع</th>
                    <th className="text-right p-4 font-semibold">المحتوى</th>
                    <th className="text-right p-4 font-semibold">الحالة</th>
                    <th className="text-right p-4 font-semibold">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg, idx) => (
                    <tr key={msg.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{idx + 1}</td>
                      <td className="p-4 font-semibold">{msg.student_name || '-'}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium">
                            {msg.recipient_type === 'parent' ? 'ولي الأمر' : 
                             msg.recipient_type === 'student' ? 'الطالب' : 'المعلم'}
                          </div>
                          <div className="text-gray-500">{msg.recipient_phone || msg.recipient_email}</div>
                        </div>
                      </td>
                      <td className="p-4">{getTypeBadge(msg.message_type)}</td>
                      <td className="p-4 max-w-xs truncate">{msg.message_content}</td>
                      <td className="p-4">{getStatusBadge(msg.status)}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {msg.sent_date ? new Date(msg.sent_date).toLocaleString('ar-SA') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}