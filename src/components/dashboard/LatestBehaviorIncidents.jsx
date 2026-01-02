import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function EmptyState({ title, desc }) {
  return (
    <div className="p-6 text-center border rounded-xl bg-white/60">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div className="text-lg font-bold">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{desc}</div>
    </div>
  );
}

export default function LatestBehaviorIncidents() {
  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["behavior-incidents", me?.email],
    enabled: !!me?.email,
    queryFn: async () => {
      return base44.entities.BehaviorIncident.filter({
        created_by: me.email,
      });
    },
  });

  const loading = meLoading || studentsLoading || incidentsLoading;

  if (!loading && students.length === 0) {
    return (
      <EmptyState
        title="لا توجد بيانات بعد"
        desc="لم يتم استيراد أسماء الطلاب. اذهب إلى (ملف → تحميل أسماء الطلاب) ثم أعد المحاولة."
      />
    );
  }

  if (!loading && incidents.length === 0) {
    return (
      <EmptyState
        title="لا توجد مخالفات سلوكية مسجلة"
        desc="لم يتم تسجيل أي مخالفة حتى الآن. ابدأ بتسجيل مخالفة جديدة ثم ستظهر هنا."
      />
    );
  }

  return (
    <Card className="border-red-200 bg-red-50/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          آخر المخالفات السلوكية
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-gray-600">جارٍ التحميل...</div>
        ) : (
          incidents
            .slice()
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 5)
            .map((inc, idx) => (
              <div
                key={inc.id || idx}
                className="p-4 rounded-xl bg-white border border-red-100 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold">{inc.student_name || "طالب غير معروف"}</div>
                  <div className="text-sm text-gray-600">{inc.misconduct_title || "مخالفة"}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {inc.date ? new Date(inc.date).toLocaleDateString("ar-SA") : ""}
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}