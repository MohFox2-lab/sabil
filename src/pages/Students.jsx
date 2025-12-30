import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Eye,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react';
import StudentForm from '../components/students/StudentForm';
import StudentDetails from '../components/students/StudentDetails';

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const deleteStudent = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id?.includes(searchTerm)
  );

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTotalScore = (student) => {
    return (student.behavior_score || 0) + (student.distinguished_score || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة بيانات جميع الطلاب</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedStudent(null);
            setShowForm(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5 ml-2" />
          إضافة طالب جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="البحث عن طالب (الاسم أو الرقم)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا يوجد طلاب</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const totalScore = getTotalScore(student);
            return (
              <Card key={student.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200">
                <CardHeader className="bg-gradient-to-l from-emerald-50 to-teal-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{student.full_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {student.grade_level} - الصف {student.grade_class} - {student.class_division}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">رقم الطالب: {student.student_id}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">السلوك الكلي</span>
                      <span className={`text-2xl font-bold ${getScoreColor(totalScore)}`}>
                        {totalScore}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-emerald-50 rounded-lg text-center">
                        <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">الإيجابي</p>
                        <p className="text-lg font-bold text-emerald-600">{student.behavior_score || 0}</p>
                      </div>
                      
                      <div className="p-2 bg-amber-50 rounded-lg text-center">
                        <TrendingUp className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">المتميز</p>
                        <p className="text-lg font-bold text-amber-600">{student.distinguished_score || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">المواظبة</span>
                      </div>
                      <span className={`text-xl font-bold ${getScoreColor(student.attendance_score || 0)}`}>
                        {student.attendance_score || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowDetails(true);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Student Form Dialog */}
      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={() => {
            setShowForm(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Student Details Dialog */}
      {showDetails && selectedStudent && (
        <StudentDetails
          student={selectedStudent}
          onClose={() => {
            setShowDetails(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}