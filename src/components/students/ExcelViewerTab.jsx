import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Trash2, Download, FileSpreadsheet, Search, RotateCcw, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * ✅ Excel Viewer ONLY
 * - يعرض ملف Excel كما هو (أي أعمدة/أي أسماء)
 * - بدون أي ربط بقاعدة بيانات
 * - بدون student_id
 * - يمنع مشكلة الصلاحيات بقراءة الملف فورًا إلى الذاكرة
 */

async function ensureXLSX() {
  // نحاول استخدام window.XLSX لو محمّلة
  if (window.XLSX) return window.XLSX;

  // تحميل SheetJS من CDN (بدون تثبيت باكج)
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-xlsx="1"]');
    if (existing) return resolve();

    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
    s.async = true;
    s.dataset.xlsx = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("فشل تحميل مكتبة قراءة الإكسل XLSX"));
    document.head.appendChild(s);
  });

  if (!window.XLSX) throw new Error("لم يتم تحميل XLSX بشكل صحيح");
  return window.XLSX;
}

function toSafeString(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return String(v);
}

function normalizeHeaders(headers) {
  // نحافظ على العناوين كما هي، لكن نضمن أنها نصوص وغير فارغة
  const fixed = headers.map((h, idx) => {
    const t = toSafeString(h).trim();
    return t ? t : `عمود_${idx + 1}`;
  });

  // منع التكرار: لو فيه عمودين بنفس الاسم
  const seen = new Map();
  return fixed.map((h) => {
    const c = (seen.get(h) || 0) + 1;
    seen.set(h, c);
    return c === 1 ? h : `${h} (${c})`;
  });
}

function jsonToCsv(headers, rows) {
  const esc = (s) => `"${toSafeString(s).replaceAll('"', '""')}"`;
  const line1 = headers.map(esc).join(",");
  const lines = rows.map((r) => headers.map((h) => esc(r[h])).join(","));
  return [line1, ...lines].join("\n");
}

export default function ExcelViewerTab() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null); // {name}
  const [allSheets, setAllSheets] = useState([]); // [{name, headers, rows}]
  const [activeSheet, setActiveSheet] = useState("");
  const [search, setSearch] = useState("");
  
  const queryClient = useQueryClient();



  const currentSheet = useMemo(() => {
    return allSheets.find(s => s.name === activeSheet) || null;
  }, [allSheets, activeSheet]);

  const filtered = useMemo(() => {
    if (!currentSheet) return [];
    const t = search.trim();
    if (!t) return currentSheet.rows;
    return currentSheet.rows.filter((r) =>
      currentSheet.headers.some((h) => toSafeString(r[h]).includes(t))
    );
  }, [currentSheet, search]);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("جاري قراءة الملف...");
    setAllSheets([]);
    setActiveSheet("");
    setFileInfo(null);

    try {
      // ✅ اقرأ الملف فورًا (حل نهائي لمشكلة الصلاحيات)
      const buf = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error("تعذر قراءة الملف"));
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(file);
      });

      const XLSX = await ensureXLSX();
      const wb = XLSX.read(buf, { type: "array" });

      if (!wb.SheetNames?.length) throw new Error("الملف لا يحتوي أي شيت");

      // قراءة جميع الشيتات
      const sheets = wb.SheetNames.map(sheetName => {
        const ws = wb.Sheets[sheetName];

        // نقرأ الصفوف كـ Array-Of-Arrays عشان نحافظ على ترتيب الأعمدة 100%
        const aoa = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: "",
          raw: true, // ✅ مهم جداً للحفاظ على أرقام الهوية الطويلة
        });

        if (!aoa.length) return { name: sheetName, headers: [], rows: [] };

        const rawHeaders = aoa[0];
        const fixedHeaders = normalizeHeaders(rawHeaders);

        const dataRows = aoa.slice(1).map((arr) => {
          const obj = {};
          fixedHeaders.forEach((h, idx) => {
            const cellValue = arr?.[idx];
            // ✅ معالجة خاصة للأرقام الطويلة (أرقام الهوية)
            if (typeof cellValue === 'number' && cellValue > 999999999) {
              obj[h] = cellValue.toFixed(0);
            } else {
              obj[h] = toSafeString(cellValue ?? "");
            }
          });
          return obj;
        }).filter(obj => {
          // ✅ نحذف فقط الصفوف الفارغة تماماً (كل القيم فارغة)
          return Object.values(obj).some(val => val && String(val).trim() !== '');
        });

        return {
          name: sheetName,
          headers: fixedHeaders,
          rows: dataRows
        };
      });

      setAllSheets(sheets);
      setActiveSheet(sheets[0]?.name || "");
      setFileInfo({ name: file.name });

      const totalRows = sheets.reduce((sum, s) => sum + s.rows.length, 0);
      setStatus(`تمت المعاينة ✅ (${sheets.length} شيت، ${totalRows} صف) — عرض فقط بدون حفظ في قاعدة البيانات.`);

    } catch (err) {
      console.error(err);
      setStatus(`فشل: ${err?.message || "خطأ غير معروف"}`);
    } finally {
      setLoading(false);
      e.target.value = ""; // مهم
    }
  };

  const clearLocalPreview = () => {
    if (!confirm("مسح المعاينة الحالية؟ (لن يحذف أي بيانات من النظام)")) return;
    setAllSheets([]);
    setActiveSheet("");
    setFileInfo(null);
    setSearch("");
    setStatus("تم المسح ✅");
  };

  const downloadCsv = () => {
    if (!currentSheet) return;
    const csv = "\uFEFF" + jsonToCsv(currentSheet.headers, currentSheet.rows); // BOM لدعم العربية
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileInfo?.name ? fileInfo.name.replace(/\.(xlsx|xls)$/i, "") : "excel") + `_${currentSheet.name}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!currentSheet) return;
    const payload = { fileInfo, sheet: currentSheet };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileInfo?.name ? fileInfo.name.replace(/\.(xlsx|xls)$/i, "") : "excel") + `_${currentSheet.name}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const saveExcelFile = async () => {
    if (!currentSheet) return;
    
    if (!confirm(`هل تريد حفظ ${currentSheet.rows.length} سجل من شيت "${currentSheet.name}" في قاعدة البيانات؟`)) return;
    
    try {
      setLoading(true);
      setStatus("جاري حفظ البيانات...");
      
      const { base44 } = await import('@/api/base44Client');
      
      let success = 0;
      let failed = 0;
      
      for (const row of currentSheet.rows) {
        try {
          // جمع قيم جميع الخلايا للتحقق من وجود بيانات
          const allValues = Object.values(row).filter(v => v && String(v).trim() !== '');
          
          // تجاهل فقط الصفوف الفارغة تماماً
          if (allValues.length === 0) {
            continue;
          }
          
          // البحث الذكي عن الحقول
          let fullName = '';
          let studentId = '';
          let nationalId = '';
          let gradeLevel = '';
          let gradeClass = '';
          let classDivision = '';
          let schoolCode = '';
          let schoolName = '';
          let schoolCodeMinistry = '';
          
          for (const [key, value] of Object.entries(row)) {
            const keyLower = String(key).toLowerCase().trim();
            const val = String(value || '').trim();
            
            if (!val) continue;
            
            // الاسم الأول
            if (!firstName && (keyLower.includes('أول') || keyLower.includes('اول') || keyLower.includes('first'))) {
              if (isNaN(val) || val.length > 2) {
                firstName = val;
                continue;
              }
            }
            
            // اسم الأب
            if (!fatherName && (keyLower.includes('أب') || keyLower.includes('اب') || keyLower.includes('second') || keyLower.includes('father'))) {
              if (isNaN(val) || val.length > 2) {
                fatherName = val;
                continue;
              }
            }
            
            // اسم الجد
            if (!grandfatherName && (keyLower.includes('جد') || keyLower.includes('third') || keyLower.includes('grandfather'))) {
              if (isNaN(val) || val.length > 2) {
                grandfatherName = val;
                continue;
              }
            }
            
            // اسم العائلة
            if (!familyName && (keyLower.includes('عائل') || keyLower.includes('عايل') || keyLower.includes('family') || keyLower.includes('last'))) {
              if (isNaN(val) || val.length > 2) {
                familyName = val;
                continue;
              }
            }
            
            // الاسم الكامل
            if (!fullName && (keyLower.includes('كامل') || keyLower === 'اسم' || keyLower === 'full_name')) {
              if (isNaN(val) || val.length > 5) {
                fullName = val;
                continue;
              }
            }
            
            // رقم الطالب
            if (!studentId && keyLower.includes('رقم') && keyLower.includes('طالب')) {
              studentId = val;
              continue;
            }
            
            // رقم الهوية / Identification
            if (!nationalId && (keyLower.includes('هوية') || keyLower.includes('هويه') || keyLower.includes('identification') || keyLower === 'national_id')) {
              nationalId = val;
              continue;
            }
            
            // معرف المدرسة / School code
            if (!schoolCode && (keyLower.includes('معرف') || (keyLower.includes('school') && keyLower.includes('code')))) {
              schoolCode = val;
              continue;
            }
            
            // المرحلة
            if (!gradeLevel && keyLower.includes('مرحل')) {
              gradeLevel = val;
              continue;
            }
            
            // الصف
            if (!gradeClass && keyLower === 'صف') {
              gradeClass = val;
              continue;
            }
            
            // الشعبة
            if (!classDivision && keyLower.includes('شعب')) {
              classDivision = val;
              continue;
            }
            
            // اسم المدرسة
            if (!schoolName && keyLower.includes('مدرس') && keyLower.includes('اسم')) {
              schoolName = val;
              continue;
            }
            
            // الرقم الوزاري
            if (!schoolCodeMinistry && keyLower.includes('وزار')) {
              schoolCodeMinistry = val;
              continue;
            }
          }
          
          // تجميع الاسم الكامل من الأجزاء إذا كانت موجودة
          if (!fullName) {
            const nameParts = [firstName, fatherName, grandfatherName, familyName].filter(Boolean);
            fullName = nameParts.join(' ');
          }
          
          const studentData = {
            student_id: studentId,
            national_id: nationalId,
            first_name: firstName,
            father_name: fatherName,
            grandfather_name: grandfatherName,
            family_name: familyName,
            full_name: fullName,
            grade_level: gradeLevel || 'متوسط',
            grade_class: parseInt(gradeClass) || 1,
            class_division: classDivision,
            school_code: schoolCode,
            school_name: schoolName,
            school_code_ministry: schoolCodeMinistry,
            nationality: 'سعودي',
            behavior_score: 80,
            attendance_score: 100
          };
          
          // حفظ السجل إذا كان فيه اسم على الأقل
          if (studentData.full_name || firstName) {
            await base44.entities.Student.create(studentData);
            success++;
          } else {
            failed++;
          }
        } catch (err) {
          failed++;
          console.error('خطأ في حفظ السجل:', err);
        }
      }
      
      setStatus(`✅ تم الحفظ: ${success} نجح | ${failed} فشل`);
      
      // تحديث قائمة الطلاب في جميع الواجهات
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch (err) {
      console.error(err);
      setStatus(`❌ فشل الحفظ: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            📥 استيراد Excel (عرض فقط)
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={onPickFile}
                className="hidden"
                id="excel-file"
                disabled={loading}
              />
              <Button asChild className="gap-2" disabled={loading}>
                <label htmlFor="excel-file" style={{ cursor: loading ? "not-allowed" : "pointer" }}>
                  <Upload className="w-4 h-4" />
                  {loading ? "جاري القراءة..." : "اختر ملف Excel"}
                </label>
              </Button>
            </label>

            <Button variant="outline" className="gap-2" onClick={downloadCsv} disabled={!currentSheet}>
              <Download className="w-4 h-4" />
              تنزيل CSV
            </Button>

            <Button variant="outline" className="gap-2" onClick={downloadJson} disabled={!currentSheet}>
              <Download className="w-4 h-4" />
              تنزيل JSON
            </Button>

            <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" onClick={saveExcelFile} disabled={!currentSheet || loading}>
              <Save className="w-4 h-4" />
              حفظ الشيت الحالي
            </Button>

            <Button variant="destructive" className="gap-2" onClick={clearLocalPreview} disabled={!allSheets.length && !fileInfo}>
              <Trash2 className="w-4 h-4" />
              مسح المعاينة
            </Button>
          </div>

          {fileInfo && currentSheet && (
            <div className="text-sm text-gray-600">
              الملف: <b>{fileInfo.name}</b> — الشيتات: <b>{allSheets.length}</b> — الأعمدة: <b>{currentSheet.headers.length}</b> — الصفوف: <b>{currentSheet.rows.length}</b>
            </div>
          )}

          {status && (
            <div className="text-sm p-3 rounded-lg bg-slate-50 border border-slate-200">
              {status}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="بحث داخل الجدول..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!currentSheet}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setSearch("")}
              disabled={!search}
              title="مسح البحث"
            >
              <RotateCcw className="w-4 h-4" />
              مسح
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sheets Tabs & Table */}
      {!allSheets.length ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            ارفع ملف Excel وسيتم عرضه هنا **كما هو** (بنفس الأعمدة والأسماء).
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeSheet} onValueChange={setActiveSheet}>
          <TabsList className="w-full justify-start flex-wrap h-auto">
            {allSheets.map((sheet) => (
              <TabsTrigger key={sheet.name} value={sheet.name} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                {sheet.name}
                <Badge variant="secondary" className="text-xs">
                  {sheet.rows.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {allSheets.map((sheet) => (
            <TabsContent key={sheet.name} value={sheet.name}>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto" style={{ maxWidth: "100%" }}>
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          {sheet.headers.map((h) => (
                            <th key={h} className="text-right p-3 font-bold whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            {sheet.headers.map((h) => (
                              <td key={h} className="p-3 text-gray-700 whitespace-nowrap">
                                {toSafeString(r[h]) || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {!filtered.length && (
                          <tr>
                            <td className="p-6 text-center text-gray-500" colSpan={sheet.headers.length}>
                              {search ? 'لا توجد نتائج مطابقة للبحث.' : 'لا توجد بيانات في هذا الشيت.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}