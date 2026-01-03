import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Download, FileSpreadsheet, Search, RotateCcw } from "lucide-react";

/**
 * ✅ Excel Viewer ONLY
 * - يعرض ملف Excel كما هو (أي أعمدة/أي أسماء)
 * - بدون أي ربط بقاعدة بيانات
 * - بدون student_id
 * - يمنع مشكلة الصلاحيات بقراءة الملف فورًا إلى الذاكرة
 */

const LS_KEY = "excel_viewer_last_preview_v1";

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

export default function ExcelViewerImportTab() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null); // {name, sheet}
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]); // array of objects {header: value}
  const [search, setSearch] = useState("");

  // استرجاع آخر معاينة (اختياري)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.headers?.length && parsed?.rows?.length) {
        setHeaders(parsed.headers);
        setRows(parsed.rows);
        setFileInfo(parsed.fileInfo || null);
        setStatus("تم استرجاع آخر ملف تمت معاينته (محليًا فقط).");
      }
    } catch {}
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim();
    if (!t) return rows;
    return rows.filter((r) =>
      headers.some((h) => toSafeString(r[h]).includes(t))
    );
  }, [rows, headers, search]);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus("جاري قراءة الملف...");
    setHeaders([]);
    setRows([]);
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

      const sheetName = wb.SheetNames?.[0];
      if (!sheetName) throw new Error("الملف لا يحتوي أي شيت");

      const ws = wb.Sheets[sheetName];

      // نقرأ الصفوف كـ Array-Of-Arrays عشان نحافظ على ترتيب الأعمدة 100%
      const aoa = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
        blankrows: false,
        raw: false,
      });

      if (!aoa.length) throw new Error("الشيت فارغ");

      const rawHeaders = aoa[0];
      const fixedHeaders = normalizeHeaders(rawHeaders);

      const dataRows = aoa.slice(1).map((arr) => {
        const obj = {};
        fixedHeaders.forEach((h, idx) => {
          obj[h] = toSafeString(arr?.[idx] ?? "");
        });
        return obj;
      });

      setHeaders(fixedHeaders);
      setRows(dataRows);
      setFileInfo({ name: file.name, sheet: sheetName });

      setStatus(`تمت المعاينة ✅ (${dataRows.length} صف) — عرض فقط بدون حفظ في قاعدة البيانات.`);

      // حفظ محلي (اختياري)
      try {
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ headers: fixedHeaders, rows: dataRows.slice(0, 5000), fileInfo: { name: file.name, sheet: sheetName } })
        );
      } catch {}

    } catch (err) {
      console.error(err);
      setStatus(`فشل: ${err?.message || "خطأ غير معروف"}`);
    } finally {
      setLoading(false);
      e.target.value = ""; // مهم
    }
  };

  const clearLocalPreview = () => {
    if (!confirm("مسح المعاينة الحالية والمحلية؟ (لن يحذف أي بيانات من النظام)")) return;
    setHeaders([]);
    setRows([]);
    setFileInfo(null);
    setSearch("");
    setStatus("تم المسح ✅");
    try { localStorage.removeItem(LS_KEY); } catch {}
  };

  const downloadCsv = () => {
    if (!headers.length) return;
    const csv = "\uFEFF" + jsonToCsv(headers, rows); // BOM لدعم العربية
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileInfo?.name ? fileInfo.name.replace(/\.(xlsx|xls)$/i, "") : "excel") + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!headers.length) return;
    const payload = { fileInfo, headers, rows };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileInfo?.name ? fileInfo.name.replace(/\.(xlsx|xls)$/i, "") : "excel") + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

            <Button variant="outline" className="gap-2" onClick={downloadCsv} disabled={!headers.length}>
              <Download className="w-4 h-4" />
              تنزيل CSV
            </Button>

            <Button variant="outline" className="gap-2" onClick={downloadJson} disabled={!headers.length}>
              <Download className="w-4 h-4" />
              تنزيل JSON
            </Button>

            <Button variant="destructive" className="gap-2" onClick={clearLocalPreview} disabled={!headers.length && !fileInfo}>
              <Trash2 className="w-4 h-4" />
              مسح المعاينة
            </Button>

            <Badge variant="secondary" className="px-3 py-1">
              لا يتم حفظ أي شيء في قاعدة البيانات ✅
            </Badge>
          </div>

          {fileInfo && (
            <div className="text-sm text-gray-600">
              الملف: <b>{fileInfo.name}</b> — الشيت: <b>{fileInfo.sheet}</b> — الأعمدة: <b>{headers.length}</b> — الصفوف: <b>{rows.length}</b>
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
              disabled={!headers.length}
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {!headers.length ? (
            <div className="p-8 text-center text-gray-500">
              ارفع ملف Excel وسيتم عرضه هنا **كما هو** (بنفس الأعمدة والأسماء).
            </div>
          ) : (
            <div className="overflow-x-auto" style={{ maxWidth: "100%" }}>
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b bg-slate-50">
                    {headers.map((h) => (
                      <th key={h} className="text-right p-3 font-bold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      {headers.map((h) => (
                        <td key={h} className="p-3 text-gray-700 whitespace-nowrap">
                          {toSafeString(r[h]) || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr>
                      <td className="p-6 text-center text-gray-500" colSpan={headers.length}>
                        لا توجد نتائج مطابقة للبحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
