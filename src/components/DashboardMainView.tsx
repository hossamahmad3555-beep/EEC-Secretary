/**
 * @file DashboardMainView.tsx
 * @description الواجهة الرئيسية للوحة تحكم إدارة السكرتارية المطابقة 100% للصورة المرفقة.
 * تتضمن:
 * - شريط عنوان لوحة التحكم مع الفلاتر الأربعة (هذا الشهر، جميع الإدارات، نوع المعاملة، السنة 2026).
 * - شريط المؤشرات السبعة (KPI Strip): إجمالي المعاملات 1,248 (+12.4%)، الواردة 740، الصادرة 430، التعاميم 48، المهام 26، الاجتماعات 12، الزيارات 18.
 * - صف الرسوم البيانية الثلاثة (ChartsRow).
 * - الصف الأوسط (أقرب الاجتماعات، أهم المهام والمتابعة، المعاملات المتأخرة).
 * - الصف السفلي (مواعيد الاتصالات والزيارات، آخر التعاميم والقرارات، أجندة السكرتارية لشهر نوفمبر 2026).
 * - شريط الإجراءات السريعة السفلي (إجراءات سريع، إصدار تعميم، جدولة اجتماع، إضافة مهمة، تسجيل اتصال، متابعة المعاملات، تقرير المراسلات).
 */

import React, { useState } from 'react';
import {
  ClipboardList,
  ChevronDown,
  Mail,
  MailOpen,
  Send,
  FileText,
  CheckSquare,
  Calendar,
  Users,
  ArrowUp,
  BarChart2,
  Flag,
  AlertTriangle,
  Phone,
  Building2,
  Gavel,
  ChevronRight,
  ChevronLeft,
  Zap,
  Megaphone,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  setSelectedYear,
  setSelectedTransactionType,
  setSelectedDepartment,
  setSelectedPeriod,
  toggleTaskCompleted,
  updateTask,
  setActiveTab,
  recordPerformanceMetric,
} from '../store/secretariatSlice';
import { DepartmentName, TimePeriod, TransactionType } from '../types/secretariat';
import { ChartsRow } from './ChartsRow';
import { ModalType } from './QuickActionModals';
import { InteractiveAgendaCalendar } from './InteractiveAgendaCalendar';
import { PerformanceStatsChart } from './PerformanceStatsChart';
import { ExportReportToolbar } from './ExportReportToolbar';
import { ActivityLogPanel } from './ActivityLogPanel';

interface DashboardMainViewProps {
  onOpenModal: (modal: ModalType) => void;
}

export const DashboardMainView: React.FC<DashboardMainViewProps> = ({ onOpenModal }) => {
  const dispatch = useAppDispatch();
  const {
    stats,
    selectedYear,
    selectedTransactionType,
    selectedDepartment,
    selectedPeriod,
    searchQuery,
    meetings,
    tasks,
    overdueTransactions,
    callsAndVisits,
    circulars,
    monthlyMovement,
  } = useAppSelector((state) => state.secretariat);

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(3);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  // Filter helpers
  const filteredOverdue = overdueTransactions.filter((item) => {
    const matchDep =
      selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchType =
      selectedTransactionType === 'all' || item.type === selectedTransactionType;
    const matchSearch =
      !normalizedSearch ||
      item.subject.toLowerCase().includes(normalizedSearch) ||
      item.department.toLowerCase().includes(normalizedSearch) ||
      item.dueDate.includes(normalizedSearch);
    return matchDep && matchType && matchSearch;
  });

  const filteredTasks = tasks.filter((item) => {
    const matchDep =
      selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchSearch =
      !normalizedSearch ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.department.toLowerCase().includes(normalizedSearch) ||
      item.dueDate.includes(normalizedSearch);
    return matchDep && matchSearch;
  });

  const filteredMeetings = meetings.filter((item) => {
    const matchDep =
      selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchSearch =
      !normalizedSearch ||
      item.title.toLowerCase().includes(normalizedSearch) ||
      item.department.toLowerCase().includes(normalizedSearch) ||
      item.date.includes(normalizedSearch);
    return matchDep && matchSearch;
  });

  // Calendar grid matching the exact numbers in the reference image under "أجندة السكرتارية - نوفمبر 2026"
  const calendarRows = [
    [
      { day: 1, highlight: null },
      { day: 2, highlight: null },
      { day: 4, highlight: null },
      { day: 3, highlight: 'purple' as const },
      { day: 6, highlight: null },
      { day: 5, highlight: 'amber' as const },
      { day: 7, highlight: null },
    ],
    [
      { day: 13, highlight: null },
      { day: 9, highlight: 'purple' as const },
      { day: 17, highlight: null },
      { day: 10, highlight: null },
      { day: 12, highlight: null },
      { day: 13, highlight: null },
      { day: 14, highlight: null },
    ],
    [
      { day: 15, highlight: null },
      { day: 25, highlight: null },
      { day: 21, highlight: null },
      { day: 18, highlight: 'amber' as const },
      { day: 18, highlight: null },
      { day: 20, highlight: null },
      { day: 27, highlight: null },
    ],
  ];

  const handleToggleTask = (id: string, title: string) => {
    const t0 = performance.now();
    dispatch(toggleTaskCompleted(id));
    dispatch(
      recordPerformanceMetric({
        actionName: `تحديث حالة المهمة: ${title}`,
        durationMs: Math.max(0.5, performance.now() - t0),
      })
    );
  };

  return (
    <div className="space-y-3.5">
      {/* 1. Top Title & Filter Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Right: Dashboard Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/70 text-[#581c87] dark:text-purple-200 flex items-center justify-center shadow-xs border border-purple-200 dark:border-purple-700">
            <ClipboardList className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            لوحة تحكم إدارة السكرتارية
          </h2>
        </div>

        {/* Left: 4 Filter Pill Dropdowns + "السنة" Label */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Filter 1: هذا الشهر */}
          <div className="relative">
            <select
              aria-label="الفترة الزمنية"
              value={selectedPeriod}
              onChange={(e) => dispatch(setSelectedPeriod(e.target.value as TimePeriod))}
              className="appearance-none pl-7 pr-8 py-1.5 rounded-full bg-gradient-to-b from-white to-purple-50/90 dark:from-[#2a1b47] dark:to-[#1e1333] border border-purple-200/90 dark:border-purple-700 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-purple-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="this_month">هذا الشهر</option>
              <option value="last_month">الشهر الماضي</option>
              <option value="this_quarter">هذا الربع</option>
              <option value="this_year">طوال العام</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter 2: جميع الإدارات */}
          <div className="relative">
            <select
              aria-label="الإدارة"
              value={selectedDepartment}
              onChange={(e) =>
                dispatch(setSelectedDepartment(e.target.value as DepartmentName))
              }
              className="appearance-none pl-4 pr-8 py-1.5 rounded-full bg-gradient-to-b from-white to-purple-50/90 dark:from-[#2a1b47] dark:to-[#1e1333] border border-purple-200/90 dark:border-purple-700 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-purple-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">جميع الإدارات</option>
              <option value="إدارة المشاريع">إدارة المشاريع</option>
              <option value="المشتريات">المشتريات</option>
              <option value="الشؤون القانونية">الشؤون القانونية</option>
              <option value="الموارد البشرية">الموارد البشرية</option>
              <option value="المكتب الفني">المكتب الفني</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter 3: نوع المعاملة */}
          <div className="relative">
            <select
              aria-label="نوع المعاملة"
              value={selectedTransactionType}
              onChange={(e) =>
                dispatch(setSelectedTransactionType(e.target.value as TransactionType))
              }
              className="appearance-none pl-4 pr-8 py-1.5 rounded-full bg-gradient-to-b from-white to-purple-50/90 dark:from-[#2a1b47] dark:to-[#1e1333] border border-purple-200/90 dark:border-purple-700 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-purple-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">نوع المعاملة</option>
              <option value="official_letters">خطابات رسمية</option>
              <option value="requests">طلبات</option>
              <option value="inquiries">استفسارات</option>
              <option value="other">أخرى</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter 4: Year 2026 + Label "السنة" */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="السنة"
                value={selectedYear}
                onChange={(e) => dispatch(setSelectedYear(e.target.value))}
                className="appearance-none pl-4 pr-8 py-1.5 rounded-full bg-gradient-to-b from-white to-purple-50/90 dark:from-[#2a1b47] dark:to-[#1e1333] border border-purple-200/90 dark:border-purple-700 text-xs sm:text-sm font-mono tabular-nums font-extrabold text-slate-900 dark:text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-purple-200">
              السنة
            </span>
          </div>

          {/* Direct PDF & Excel Export Controls for Archiving */}
          <ExportReportToolbar defaultScope="all" compact />
        </div>
      </div>

      {/* 2. Top 7 KPI Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {/* KPI 1: إجمالي المعاملات 1,248 */}
        <div
          onClick={() => dispatch(setActiveTab('correspondence'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              إجمالي المعاملات
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-0.5">
              {stats.totalTransactions.toLocaleString('en-US')}
            </p>
            <div className="flex items-center gap-0.5 text-[11px] font-mono tabular-nums font-extrabold text-emerald-600 dark:text-emerald-400">
              <ArrowUp className="w-3 h-3 stroke-[3]" />
              <span>+{stats.totalGrowthPercent}%</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-100/90 dark:bg-purple-900/60 text-[#7e22ce] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
            <Mail className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 2: المراسلات الواردة 740 */}
        <div
          onClick={() => dispatch(setActiveTab('correspondence'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              المراسلات الواردة
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.incomingCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <MailOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 3: المراسلات الصادرة 430 */}
        <div
          onClick={() => dispatch(setActiveTab('correspondence'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              المراسلات الصادرة
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.outgoingCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-100/90 dark:bg-amber-950/70 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Send className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 4: التعاميم 48 */}
        <div
          onClick={() => dispatch(setActiveTab('circulars'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              التعاميم
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.circularsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-100/90 dark:bg-purple-900/60 text-[#7e22ce] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 5: المهام المفتوحة 26 */}
        <div
          onClick={() => dispatch(setActiveTab('tasks'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              المهام المفتوحة
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.openTasksCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-rose-100/90 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
            <CheckSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 6: الإجتماعات 12 */}
        <div
          onClick={() => dispatch(setActiveTab('meetings'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              الإجتماعات
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.meetingsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-purple-100/90 dark:bg-purple-900/60 text-[#7e22ce] dark:text-purple-300 flex items-center justify-center shrink-0 shadow-inner">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* KPI 7: الزيارات 18 */}
        <div
          onClick={() => dispatch(setActiveTab('visitors'))}
          className="cursor-pointer rounded-2xl bg-gradient-to-b from-white to-purple-50/60 dark:from-[#23153c] dark:to-[#1a102e] border border-purple-200/90 dark:border-purple-800/80 shadow-xs hover:shadow-md transition p-3 flex items-center justify-between gap-2 col-span-2 sm:col-span-1"
        >
          <div className="text-right">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-purple-200 whitespace-nowrap">
              الزيارات
            </p>
            <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-tight mt-1">
              {stats.visitsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-100/90 dark:bg-amber-950/70 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <Users className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* 3. Charts Row (3 Visual Analytics Cards) */}
      <ChartsRow
        totalTransactions={stats.totalTransactions}
        completedCount={stats.completedTransactions}
        inProgressCount={stats.inProgressTransactions}
        overdueCount={stats.overdueTransactionsCount}
        monthlyMovement={monthlyMovement}
        selectedType={selectedTransactionType}
        onSelectType={(type) => dispatch(setSelectedTransactionType(type))}
      />

      {/* 3.5. Weekly Performance Statistics Component (Recharts Interactive Chart) */}
      <PerformanceStatsChart />

      {/* 4. Middle 3 Operational Cards Row: أقرب الاجتماعات | أهم المهام والمتابعة | المعاملات المتأخرة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Right Card (in RTL): أقرب الاجتماعات */}
        <div className="lg:col-span-4 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                أقرب الاجتماعات
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-purple-900/40 text-slate-700 dark:text-purple-200 font-extrabold">
                  <th className="py-1.5 px-2.5 rounded-r-lg">موضوع الإجتماع</th>
                  <th className="py-1.5 px-2 text-center">الوقت</th>
                  <th className="py-1.5 px-2.5 rounded-l-lg text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/50">
                {filteredMeetings.slice(0, 3).map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-purple-50/60 dark:hover:bg-purple-900/20 transition"
                  >
                    <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {m.iconType === 'chart' ? (
                          <BarChart2 className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                        ) : (
                          <Users className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                        )}
                        <span className="truncate">{m.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800 dark:text-purple-100 whitespace-nowrap">
                      {m.time}
                    </td>
                    <td className="py-2.5 px-2 text-left font-mono tabular-nums font-bold text-slate-800 dark:text-purple-200 whitespace-nowrap">
                      {m.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Center Card: أهم المهام والمتابعة */}
        <div className="lg:col-span-4 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                أهم المهام والمتابعة
              </h3>
            </div>
          </div>

          <div className="space-y-2 my-auto">
            {filteredTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.title)}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-50/75 dark:bg-purple-950/40 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-2 border-[#6b21a8] accent-[#6b21a8] cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-xs font-extrabold truncate ${
                      task.completed
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Flag className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-mono tabular-nums text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Left Card (in RTL): المعاملات المتأخرة */}
        <div className="lg:col-span-4 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                المعاملات المتأخرة
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-purple-900/40 text-slate-700 dark:text-purple-200 font-extrabold">
                  <th className="py-1.5 px-2 rounded-r-lg">#</th>
                  <th className="py-1.5 px-2">الموضوع</th>
                  <th className="py-1.5 px-2">الإدارة</th>
                  <th className="py-1.5 px-2 rounded-l-lg text-left">تاريخ الاستحقاق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/50">
                {filteredOverdue.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-50/60 dark:hover:bg-purple-900/20 transition"
                  >
                    <td className="py-2.5 px-2 font-mono tabular-nums font-extrabold text-slate-800 dark:text-purple-200">
                      {item.id}
                    </td>
                    <td className="py-2.5 px-2 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {item.subject}
                    </td>
                    <td className="py-2.5 px-2 font-bold text-slate-700 dark:text-purple-200 whitespace-nowrap">
                      {item.department}
                    </td>
                    <td className="py-2.5 px-2 text-left font-mono tabular-nums font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                      {item.dueDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Bottom 3 Cards Row: مواعيد الاتصالات والزيارات | آخر التعاميم والقرارات | أجندة السكرتارية */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Right Card (in RTL): مواعيد الاتصالات والزيارات */}
        <div className="lg:col-span-3 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                مواعيد الاتصالات والزيارات
              </h3>
            </div>
          </div>

          <div className="space-y-2 my-auto">
            {callsAndVisits.slice(0, 3).map((cv) => (
              <div
                key={cv.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-50/75 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {cv.type === 'call' && (
                    <Phone className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                  )}
                  {cv.type === 'visitor' && (
                    <Users className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                  )}
                  {cv.type === 'delegation' && (
                    <Building2 className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                  )}
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {cv.title}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-purple-200 whitespace-nowrap shrink-0">
                  {cv.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Card: آخر التعاميم والقرارات */}
        <div className="lg:col-span-5 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                آخر التعاميم والقرارات
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-purple-100/70 dark:bg-purple-900/40 text-slate-700 dark:text-purple-200 font-extrabold">
                  <th className="py-1.5 px-2.5 rounded-r-lg">الموضوع</th>
                  <th className="py-1.5 px-2 text-center">الرقم</th>
                  <th className="py-1.5 px-2.5 rounded-l-lg text-left">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/50">
                {circulars.slice(0, 3).map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-purple-50/60 dark:hover:bg-purple-900/20 transition"
                  >
                    <td className="py-2.5 px-2 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {c.docType === 'decision' ? (
                          <Gavel className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                        )}
                        <span className="truncate">{c.subject}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums font-extrabold text-slate-800 dark:text-purple-200 whitespace-nowrap">
                      {c.refNumber}
                    </td>
                    <td className="py-2.5 px-2 text-left font-mono tabular-nums font-extrabold text-slate-800 dark:text-purple-200 whitespace-nowrap">
                      {c.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Left Card (in RTL): أجندة السكرتارية التفاعلية للاجتماعات والزيارات القادمة */}
        <InteractiveAgendaCalendar onOpenModal={onOpenModal} />
      </div>

      {/* 5.5. Audit Activity Log Component (سجل النشاطات الرقابي) */}
      <ActivityLogPanel />

      {/* 6. Bottom Quick Actions Bar (7 Pill Buttons matching reference image) */}
      <div className="pt-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {/* Button 1 (Rightmost in RTL): إجراءات سريع (Solid Deep Purple Pill with Golden Lightning Icon) */}
        <button
          type="button"
          onClick={() => onOpenModal('performance_monitor')}
          className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-[#3b0764] via-[#581c87] to-[#6b21a8] hover:from-[#2e1065] hover:to-[#581c87] text-white text-xs sm:text-sm font-black shadow-md transition transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
          <span>إجراءات سريع</span>
        </button>

        {/* Button 2: إصدار تعميم */}
        <button
          type="button"
          onClick={() => onOpenModal('issue_circular')}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <Megaphone className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>إصدار تعميم</span>
        </button>

        {/* Button 3: جدولة اجتماع */}
        <button
          type="button"
          onClick={() => onOpenModal('schedule_meeting')}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <Users className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>جدولة اجتماع</span>
        </button>

        {/* Button 4: إضافة مهمة */}
        <button
          type="button"
          onClick={() => onOpenModal('add_task')}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <CheckSquare className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>إضافة مهمة</span>
        </button>

        {/* Button 5: تسجيل اتصال */}
        <button
          type="button"
          onClick={() => onOpenModal('log_call')}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <Phone className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>تسجيل اتصال</span>
        </button>

        {/* Button 6: متابعة المعاملات */}
        <button
          type="button"
          onClick={() => dispatch(setActiveTab('correspondence'))}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <Search className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>متابعة المعاملات</span>
        </button>

        {/* Button 7 (Leftmost in RTL): تقرير المراسلات */}
        <button
          type="button"
          onClick={() => dispatch(setActiveTab('reports'))}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-white to-purple-50/90 dark:from-[#261742] dark:to-[#1c1132] hover:to-purple-100 border border-purple-200/90 dark:border-purple-700 text-slate-900 dark:text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow transition cursor-pointer whitespace-nowrap"
        >
          <TrendingUp className="w-4 h-4 text-[#6b21a8] dark:text-purple-300 shrink-0" />
          <span>تقرير المراسلات</span>
        </button>
      </div>
    </div>
  );
};
