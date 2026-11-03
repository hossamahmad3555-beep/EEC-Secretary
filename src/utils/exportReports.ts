/**
 * @file exportReports.ts
 * @description وحدة تصدير تقارير المهام والمراسلات إلى ملفات Excel (.xlsx) وملفات PDF (.pdf)
 * مع دعم كامل للغة العربية والتنسيق من اليمين إلى اليسار (RTL) لتسهيل الأرشفة الورقية والإدارة المكتبية.
 */

import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { TaskItem, CorrespondenceItem, OverdueTransaction } from '../types/secretariat';

export type ExportScope = 'all' | 'tasks' | 'correspondence';

interface ExportPayload {
  scope: ExportScope;
  tasks: TaskItem[];
  correspondences: CorrespondenceItem[];
  overdueTransactions?: OverdueTransaction[];
  year: string;
}

const getStatusArabic = (status: 'completed' | 'in_progress' | 'overdue') => {
  switch (status) {
    case 'completed':
      return 'مكتملة';
    case 'in_progress':
      return 'قيد التنفيذ';
    case 'overdue':
      return 'متأخرة';
  }
};

const getPriorityArabic = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'عالية';
    case 'medium':
      return 'متوسطة';
    case 'low':
      return 'عادية';
  }
};

const getTransactionTypeArabic = (type: string) => {
  switch (type) {
    case 'official_letters':
      return 'خطابات رسمية';
    case 'requests':
      return 'طلبات';
    case 'inquiries':
      return 'استفسارات';
    default:
      return 'أخرى';
  }
};

/**
 * تصدير تقارير المهام و/أو المراسلات إلى ملف Excel (.xlsx) مع ضبط اتجاه الأوراق من اليمين لليسار (RTL)
 */
export function exportToExcel({
  scope,
  tasks,
  correspondences,
  overdueTransactions = [],
  year,
}: ExportPayload): void {
  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: true }] };

  if (scope === 'all' || scope === 'correspondence') {
    const corrRows = correspondences.map((c, idx) => ({
      'م': idx + 1,
      'الرقم المرجعي': c.refNumber,
      'موضوع المراسلة': c.subject,
      'الاتجاه': c.direction === 'incoming' ? 'وارد' : 'صادر',
      'نوع المعاملة': getTransactionTypeArabic(c.type),
      'الإدارة المعنية': c.department,
      'تاريخ المعاملة': c.date,
      'حالة المعاملة': getStatusArabic(c.status),
    }));

    const corrSheet = XLSX.utils.json_to_sheet(corrRows);
    corrSheet['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 42 },
      { wch: 12 },
      { wch: 16 },
      { wch: 20 },
      { wch: 15 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(workbook, corrSheet, 'تقرير المراسلات');
  }

  if (scope === 'all' || scope === 'tasks') {
    const taskRows = tasks.map((t, idx) => ({
      'م': idx + 1,
      'عنوان المهمة': t.title,
      'الإدارة المسؤولة': t.department,
      'الأولوية': getPriorityArabic(t.priority),
      'تاريخ الاستحقاق': t.dueDate,
      'حالة الإنجاز': t.completed ? 'منجزة' : 'قيد المتابعة',
    }));

    const taskSheet = XLSX.utils.json_to_sheet(taskRows);
    taskSheet['!cols'] = [
      { wch: 6 },
      { wch: 40 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'تقرير المهام والمتابعة');
  }

  if (scope === 'all' && overdueTransactions.length > 0) {
    const overdueRows = overdueTransactions.map((o) => ({
      '#': o.id,
      'الموضوع': o.subject,
      'الإدارة': o.department,
      'تاريخ الاستحقاق': o.dueDate,
      'الحالة': 'متأخرة',
    }));
    const overdueSheet = XLSX.utils.json_to_sheet(overdueRows);
    overdueSheet['!cols'] = [
      { wch: 6 },
      { wch: 32 },
      { wch: 20 },
      { wch: 16 },
      { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(workbook, overdueSheet, 'المعاملات المتأخرة');
  }

  const filePrefix =
    scope === 'tasks'
      ? 'تقرير_المهام_والمتابعة'
      : scope === 'correspondence'
      ? 'تقرير_المراسلات'
      : 'التقرير_الشامل_للسكرتارية';

  XLSX.writeFile(workbook, `${filePrefix}_EEC_${year}.xlsx`);
}

/**
 * تصدير تقارير المهام و/أو المراسلات إلى ملف PDF رسمي جاهز للطباعة والأرشفة الورقية
 * يدعم الحروف العربية المتصلة عبر توليد قالب رسمي عالي الدقة وتحويله إلى PDF.
 */
export async function exportToPDF({
  scope,
  tasks,
  correspondences,
  overdueTransactions = [],
  year,
}: ExportPayload): Promise<void> {
  // إنشاء حاوية مؤقتة مخفية بتصميم رسمي للطباعة باللغة العربية
  const container = document.createElement('div');
  container.dir = 'rtl';
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.right = '0';
  container.style.width = '960px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Cairo', 'Tajawal', sans-serif";
  container.style.padding = '36px';
  container.style.boxSizing = 'border-box';

  const reportTitle =
    scope === 'tasks'
      ? 'تقرير المهام والمتابعة التنفيذية'
      : scope === 'correspondence'
      ? 'تقرير المراسلات الصادرة والواردة'
      : 'التقرير الرسمي الشامل للمراسلات والمهام';

  const todayDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const correspondenceHtml =
    scope === 'all' || scope === 'correspondence'
      ? `
      <div style="margin-top: 22px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #3b0764; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #e9d5ff;">
          أولاً: سجل المراسلات الصادرة والواردة (${correspondences.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;">
          <thead>
            <tr style="background-color: #f3e8ff; color: #3b0764;">
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">م</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الرقم المرجعي</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">موضوع المراسلة</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الاتجاه</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الإدارة</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">التاريخ</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${correspondences
              .map(
                (c, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#faf5ff'};">
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700;">${
                  i + 1
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-family: monospace; font-weight: 700; color: #581c87;">${
                  c.refNumber
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700;">${
                  c.subject
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff;">${
                  c.direction === 'incoming' ? 'وارد' : 'صادر'
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff;">${c.department}</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-family: monospace;">${
                  c.date
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700; color: ${
                  c.status === 'completed'
                    ? '#15803d'
                    : c.status === 'overdue'
                    ? '#dc2626'
                    : '#0369a1'
                };">${getStatusArabic(c.status)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  const tasksHtml =
    scope === 'all' || scope === 'tasks'
      ? `
      <div style="margin-top: 24px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #3b0764; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #e9d5ff;">
          ${scope === 'all' ? 'ثانياً:' : 'أولاً:'} سجل المهام والمتابعة (${tasks.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;">
          <thead>
            <tr style="background-color: #f3e8ff; color: #3b0764;">
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">م</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">عنوان المهمة</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الإدارة المسؤولة</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">الأولوية</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">تاريخ الاستحقاق</th>
              <th style="padding: 8px 10px; border: 1px solid #d8b4fe;">حالة الإنجاز</th>
            </tr>
          </thead>
          <tbody>
            ${tasks
              .map(
                (t, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#faf5ff'};">
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700;">${
                  i + 1
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700;">${
                  t.title
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff;">${t.department}</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff;">${getPriorityArabic(
                  t.priority
                )}</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-family: monospace; color: #dc2626; font-weight: 700;">${
                  t.dueDate
                }</td>
                <td style="padding: 7px 10px; border: 1px solid #e9d5ff; font-weight: 700; color: ${
                  t.completed ? '#15803d' : '#b45309'
                };">${t.completed ? 'منجزة' : 'قيد المتابعة'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  const overdueHtml =
    scope === 'all' && overdueTransactions.length > 0
      ? `
      <div style="margin-top: 24px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #991b1b; margin: 0 0 10px 0; padding-bottom: 6px; border-bottom: 2px solid #fecaca;">
          ثالثاً: بيان المعاملات المتأخرة العاجلة (${overdueTransactions.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: right;">
          <thead>
            <tr style="background-color: #fef2f2; color: #991b1b;">
              <th style="padding: 8px 10px; border: 1px solid #fecaca;">#</th>
              <th style="padding: 8px 10px; border: 1px solid #fecaca;">الموضوع</th>
              <th style="padding: 8px 10px; border: 1px solid #fecaca;">الإدارة</th>
              <th style="padding: 8px 10px; border: 1px solid #fecaca;">تاريخ الاستحقاق</th>
            </tr>
          </thead>
          <tbody>
            ${overdueTransactions
              .map(
                (o) => `
              <tr>
                <td style="padding: 7px 10px; border: 1px solid #fecaca; font-weight: 700;">${o.id}</td>
                <td style="padding: 7px 10px; border: 1px solid #fecaca; font-weight: 700;">${o.subject}</td>
                <td style="padding: 7px 10px; border: 1px solid #fecaca;">${o.department}</td>
                <td style="padding: 7px 10px; border: 1px solid #fecaca; font-family: monospace; color: #dc2626; font-weight: 700;">${o.dueDate}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
      : '';

  container.innerHTML = `
    <div style="border: 2px solid #4c1d95; border-radius: 16px; padding: 24px; background: #ffffff;">
      <!-- Official Corporate Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b; padding-bottom: 16px;">
        <div>
          <h1 style="font-size: 22px; font-weight: 900; color: #3b0764; margin: 0;">
            الشركة المصرية الهندسية للمقاولات (EEC)
          </h1>
          <p style="font-size: 13px; font-weight: 700; color: #6b21a8; margin: 4px 0 0 0;">
            إدارة السكرتارية التنفيذية · نظام الأرشفة والتقارير الرسمية
          </p>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${reportTitle}</div>
          <div style="font-size: 12px; color: #475569; margin-top: 4px;">تاريخ الإصدار: ${todayDate} | السنة المالية: ${year}</div>
        </div>
      </div>

      ${correspondenceHtml}
      ${tasksHtml}
      ${overdueHtml}

      <!-- Official Footer Signatures -->
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #334155;">
        <div>إعداد: إدارة السكرتارية التنفيذية</div>
        <div>ختم الأرشيف المركزي (EEC)</div>
        <div>اعتماد: مدير عام السكرتارية</div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      usableWidth,
      Math.min(imgHeight, pageHeight - margin * 2)
    );

    const filePrefix =
      scope === 'tasks'
        ? 'تقرير_المهام_والمتابعة'
        : scope === 'correspondence'
        ? 'تقرير_المراسلات'
        : 'التقرير_الشامل_للسكرتارية';

    pdf.save(`${filePrefix}_EEC_${year}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
