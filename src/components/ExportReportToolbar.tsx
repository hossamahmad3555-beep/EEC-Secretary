/**
 * @file ExportReportToolbar.tsx
 * @description شريط أزرار الطباعة المباشرة وتصدير تقارير المهام والمراسلات إلى ملفات PDF و Excel
 * لتسهيل الأرشفة الورقية والإدارة المكتبية مع إشعار حالة التصدير الفوري.
 */

import React, { useState } from 'react';
import { FileSpreadsheet, FileDown, CheckCircle2, Loader2, Printer } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { recordPerformanceMetric } from '../store/secretariatSlice';
import { exportToExcel, exportToPDF, ExportScope } from '../utils/exportReports';

interface ExportReportToolbarProps {
  defaultScope?: ExportScope;
  compact?: boolean;
}

export const ExportReportToolbar: React.FC<ExportReportToolbarProps> = ({
  defaultScope = 'all',
  compact = false,
}) => {
  const dispatch = useAppDispatch();
  const { tasks, correspondences, overdueTransactions, selectedYear } = useAppSelector(
    (state) => state.secretariat
  );

  const [scope, setScope] = useState<ExportScope>(defaultScope);
  const [exportingType, setExportingType] = useState<'pdf' | 'excel' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const handleDirectPrint = () => {
    const t0 = performance.now();
    dispatch(
      recordPerformanceMetric({
        actionName: 'تشغيل الطباعة الورقية المباشرة (Print View)',
        durationMs: Math.max(0.8, performance.now() - t0),
      })
    );
    window.print();
  };

  const handleExportExcel = () => {
    const t0 = performance.now();
    setExportingType('excel');
    try {
      exportToExcel({
        scope,
        tasks,
        correspondences,
        overdueTransactions,
        year: selectedYear,
      });
      const elapsed = Math.max(1.2, performance.now() - t0);
      dispatch(
        recordPerformanceMetric({
          actionName: `تصدير ملف Excel (${
            scope === 'tasks' ? 'المهام' : scope === 'correspondence' ? 'المراسلات' : 'شامل'
          })`,
          durationMs: elapsed,
        })
      );
      showToast('تم تصدير التقرير بصيغة Excel بنجاح وجاهز للأرشفة المكتبية');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportPDF = async () => {
    const t0 = performance.now();
    setExportingType('pdf');
    try {
      await exportToPDF({
        scope,
        tasks,
        correspondences,
        overdueTransactions,
        year: selectedYear,
      });
      const elapsed = Math.max(2.5, performance.now() - t0);
      dispatch(
        recordPerformanceMetric({
          actionName: `تصدير ملف PDF للطباعة (${
            scope === 'tasks' ? 'المهام' : scope === 'correspondence' ? 'المراسلات' : 'شامل'
          })`,
          durationMs: elapsed,
        })
      );
      showToast('تم إنشاء وتصدير ملف PDF الرسمي بنجاح وجاهز للطباعة');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      {!compact && (
        <select
          aria-label="نطاق التقرير للتصدير"
          value={scope}
          onChange={(e) => setScope(e.target.value as ExportScope)}
          className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-xs font-extrabold text-slate-800 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
        >
          <option value="all">التقرير الشامل (المراسلات + المهام)</option>
          <option value="correspondence">تقرير المراسلات فقط</option>
          <option value="tasks">تقرير المهام والمتابعة فقط</option>
        </select>
      )}

      {/* Direct Paper Print Button */}
      <button
        type="button"
        onClick={handleDirectPrint}
        title="طباعة مباشرة للصفحة بتنسيق مستند ورقي نظيف بدون قوائم جانبية"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white text-xs font-extrabold shadow-xs transition cursor-pointer whitespace-nowrap"
      >
        <Printer className="w-3.5 h-3.5 text-amber-300" />
        <span>طباعة مباشرة</span>
      </button>

      {/* Export to PDF Button */}
      <button
        type="button"
        disabled={exportingType !== null}
        onClick={handleExportPDF}
        title="تصدير التقرير إلى ملف PDF جاهز للطباعة والأرشفة الورقية"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-xs transition cursor-pointer whitespace-nowrap"
      >
        {exportingType === 'pdf' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileDown className="w-3.5 h-3.5" />
        )}
        <span>تصدير PDF</span>
      </button>

      {/* Export to Excel Button */}
      <button
        type="button"
        disabled={exportingType !== null}
        onClick={handleExportExcel}
        title="تصدير التقرير إلى جدول بيانات Excel للإدارة المكتبية"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-extrabold shadow-xs transition cursor-pointer whitespace-nowrap"
      >
        {exportingType === 'excel' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5" />
        )}
        <span>تصدير Excel</span>
      </button>

      {/* Instant Feedback Toast Badge */}
      {feedbackMessage && (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
};
