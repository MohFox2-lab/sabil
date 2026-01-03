import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileSpreadsheet, Trash2, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExcelViewerTab() {
  const [fileInfo, setFileInfo] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('excel_preview');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFileInfo(data.fileInfo);
        setHeaders(data.headers);
        setRows(data.rows);
      } catch (e) {
        console.error('Failed to load preview', e);
      }
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // ✅ قراءة الملف فوراً قبل أي انتظار
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      // تحميل مكتبة xlsx
      const XLSX = await import('xlsx');
      
      // قراءة الملف
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // قراءة أول شيت
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل إلى JSON بدون أي معالجة
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        raw: false, // لعرض القيم كما هي
        defval: '' // القيم الفارغة = ''
      });

      if (jsonData.length === 0) {
        alert('الملف فارغ');
        setLoading(false);
        return;
      }

      // استخراج الأعمدة (Headers) من أول صف
      const extractedHeaders = Object.keys(jsonData[0]);
      
      // حفظ البيانات
      const data = {
        fileInfo: {
          name: file.name,
          size: file.size,
          uploadDate: new Date().toISOString()
        },
        headers: extractedHeaders,
        rows: jsonData
      };

      setFileInfo(data.fileInfo);
      setHeaders(extractedHeaders);
      setRows(jsonData);

      // حفظ في localStorage
      localStorage.setItem('excel_preview', JSON.stringify(data));

      setLoading(false);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('فشل في قراءة الملف: ' + error.message);
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (rows.length === 0) return;

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(h => {
          const val = row[h] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileInfo?.name || 'data'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (rows.length === 0) return;

    const jsonContent = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileInfo?.name || 'data'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearPreview = () => {
    if (confirm('هل أنت متأكد من مسح المعاينة الحالية؟')) {
      setFileInfo(null);
      setHeaders([]);
      setRows([]);
      setSearchTerm('');
      localStorage.removeItem('excel_preview');
    }
  };

  // البحث في الجدول
  const filteredRows = rows.filter(row => {
    if (!searchTerm) return true;
    return headers.some(h => {
      const val = String(row[h] || '').toLowerCase();
      return val.includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">استيراد Excel (عرض فقط)</h2>
          <p className="text-gray-600 mt-1">عرض محتوى ملف Excel بدون حفظ في قاعدة البيانات</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            رفع ملف Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
                disabled={loading}
              />
            </div>
            {fileInfo && (
              <Button onClick={clearPreview} variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                مسح المعاينة
              </Button>
            )}
          </div>
          
          {loading && (
            <div className="mt-4 text-center text-blue-600">
              جاري تحميل الملف...
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Info & Actions */}
      {fileInfo && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-bold text-gray-900">{fileInfo.name}</p>
                  <p className="text-sm text-gray-600">
                    {(fileInfo.size / 1024).toFixed(2)} KB • {rows.length} صف
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  تنزيل CSV
                </Button>
                <Button onClick={downloadJSON} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  تنزيل JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {rows.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="البحث في الجدول..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              {searchTerm && (
                <Button 
                  onClick={() => setSearchTerm('')} 
                  variant="ghost" 
                  size="sm"
                >
                  مسح
                </Button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                النتائج: {filteredRows.length} من {rows.length}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {filteredRows.length > 0 && (
        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle>معاينة البيانات</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-right font-bold border-b w-12">#</th>
                    {headers.map((header, idx) => (
                      <th key={idx} className="p-3 text-right font-bold border-b whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-500 font-mono">{rowIdx + 1}</td>
                      {headers.map((header, colIdx) => (
                        <td key={colIdx} className="p-3 whitespace-nowrap">
                          {String(row[header] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!fileInfo && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">قم برفع ملف Excel لعرض محتواه</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}