import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Mail,
  Shield,
  X,
  Save
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'user'
  });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const inviteUser = useMutation({
    mutationFn: async (data) => {
      await base44.users.inviteUser(data.email, data.role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowInviteForm(false);
      setInviteData({ email: '', role: 'user' });
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    inviteUser.mutate(inviteData);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
          <p className="text-gray-600 mt-1">إدارة المعلمين والإداريين في النظام</p>
        </div>
        <Button 
          onClick={() => setShowInviteForm(true)} 
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <UserPlus className="w-5 h-5" />
          دعوة مستخدم جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-gray-800">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المسؤولين</p>
                <p className="text-3xl font-bold text-gray-800">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المعلمين</p>
                <p className="text-3xl font-bold text-gray-800">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                className="pr-10"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مسؤول</SelectItem>
                  <SelectItem value="user">معلم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="bg-gradient-to-l from-blue-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            قائمة المستخدمين
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">جاري التحميل...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">لا توجد نتائج</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-right p-4 font-semibold">#</th>
                    <th className="text-right p-4 font-semibold">الاسم الكامل</th>
                    <th className="text-right p-4 font-semibold">البريد الإلكتروني</th>
                    <th className="text-right p-4 font-semibold">الدور</th>
                    <th className="text-right p-4 font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">{idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {user.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="font-semibold text-gray-800">{user.full_name || 'غير محدد'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          user.role === 'admin' 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }>
                          {user.role === 'admin' ? 'مسؤول' : 'معلم'}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(user.created_date).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite User Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="bg-blue-600 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  دعوة مستخدم جديد
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowInviteForm(false)}
                  className="text-white hover:bg-blue-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label>البريد الإلكتروني *</Label>
                  <Input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                    placeholder="example@school.edu.sa"
                  />
                  <p className="text-sm text-gray-500">سيتم إرسال دعوة إلى هذا البريد الإلكتروني</p>
                </div>

                <div className="space-y-2">
                  <Label>الدور *</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(value) => setInviteData({...inviteData, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">معلم</SelectItem>
                      <SelectItem value="admin">مسؤول</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {inviteData.role === 'admin' 
                      ? 'المسؤول لديه صلاحيات كاملة على النظام' 
                      : 'المعلم لديه صلاحيات محدودة'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowInviteForm(false)} 
                    className="flex-1"
                  >
                    <X className="w-4 h-4 ml-2" />
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={inviteUser.isPending}
                  >
                    <Mail className="w-4 h-4 ml-2" />
                    إرسال الدعوة
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}