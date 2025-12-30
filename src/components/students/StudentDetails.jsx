import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Award, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';

export default function StudentDetails({ student, onClose }) {
  const { data: incidents = [] } = useQuery({
    queryKey: ['student-incidents', student.id],
    queryFn: () => base44.entities.BehaviorIncident.filter({ student_id: student.student_id }, '-date'),
  });

  const { data: positiveActions = [] } = useQuery({
    queryKey: ['student-positive', student.id],
    queryFn: () => base44.entities.StudentPositiveAction.filter({ student_id: student.student_id }, '-date'),
  });

  const { data: absences = [] } = useQuery({
    queryKey: ['student-absences', student.id],
    queryFn: () => base44.entities.Absence.filter({ student_id: student.student_id }, '-date'),
  });

  const totalScore = (student.behavior_score || 0) + (student.distinguished_score || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle>ملف الطالب: {student.full_name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-emerald-500">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-2">السلوك الكلي</p>
              <p className="text-4xl font-bold text-blue-600">{totalScore}</p>
              <p className="text-xs text-gray-500 mt-1">من 100</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg text-center">
              <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">الإيجابي</p>
              <p className="text-2xl font-bold text-emerald-600">{student.behavior_score || 0}</p>
              <p className="text-sm text-gray-600 mt-1">المتميز: {student.distinguished_score || 0}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">المواظبة</p>
              <p className="text-2xl font-bold text-purple-600">{student.attendance_score || 0}</p>
            </div>
          </div>

          {/* Behavior Incidents */}
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                المخالفات السلوكية ({incidents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {incidents.length === 0 ? (
                <p className="text-center text-gray-500 py-6">لا توجد مخالفات مسجلة</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{incident.misconduct_title}</p>
                          <p className="text-sm text-gray-600 mt-1">{incident.actions_taken}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(incident.date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <Badge className="bg-red-600 text-white">
                          -{incident.points_deducted}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Positive Actions */}
          <Card>
            <CardHeader className="bg-emerald-50">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                <TrendingUp className="w-5 h-5" />
                السلوك المتميز ({positiveActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {positiveActions.length === 0 ? (
                <p className="text-center text-gray-500 py-6">لا توجد سلوكيات متميزة مسجلة</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {positiveActions.map((action) => (
                    <div key={action.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{action.positive_action_title}</p>
                          {action.evidence && (
                            <p className="text-sm text-gray-600 mt-1">{action.evidence}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(action.date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <Badge className="bg-emerald-600 text-white">
                          +{action.points_earned}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Absences */}
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                <Calendar className="w-5 h-5" />
                سجل الغياب ({absences.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {absences.length === 0 ? (
                <p className="text-center text-gray-500 py-6">لا يوجد غياب مسجل</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {absences.map((absence) => (
                    <div key={absence.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {new Date(absence.date).toLocaleDateString('ar-SA')}
                        </p>
                        {absence.excuse_type && (
                          <p className="text-sm text-gray-600">{absence.excuse_type}</p>
                        )}
                      </div>
                      <Badge className={absence.has_excuse ? 'bg-green-600' : 'bg-red-600'}>
                        {absence.has_excuse ? 'بعذر' : 'بدون عذر'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}