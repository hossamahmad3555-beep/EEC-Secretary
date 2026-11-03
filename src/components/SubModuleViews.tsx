/**
 * @file SubModuleViews.tsx
 * @description واجهات الأقسام الفرعية العشرة عند التنقل من القائمة الجانبية (المراسلات، التعاميم، المهام،
 * الاجتماعات، الاتصالات، دفتر العهدة، الزوار، الأرشيف، التقارير، والإعدادات) مع دعم كامل لأرشفة
 * المراسلات القديمة في مجلدات خاصة واسترجاعها، وميزة الطباعة الورقية المباشرة النظيفة (Print Media Query).
 */

import React, { useState } from 'react';
import {
  FolderOpen,
  FileUp,
  CheckSquare,
  CalendarDays,
  PhoneCall,
  BookOpen,
  Users,
  Archive,
  BarChart3,
  Settings,
  Plus,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon,
  ArchiveRestore,
  FolderPlus,
  FolderArchive,
  HardDriveDownload,
  Printer,
  Edit3,
  Trash2,
  Check,
  X,
  MapPin,
  Building2,
  Phone,
  Download,
  Upload,
  ShieldCheck,
  BellOff,
  Bell,
  Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  setActiveTab,
  setSearchQuery,
  toggleTaskCompleted,
  updateTask,
  deleteTask,
  resolveOverdueTransaction,
  toggleTheme,
  resetToDefaultData,
  addCorrespondence,
  deleteCorrespondence,
  archiveCorrespondence,
  restoreArchivedCorrespondence,
  archiveCompletedCorrespondences,
  createArchiveFolder,
  recordPerformanceMetric,
  deleteMeeting,
  deleteCircular,
  deleteCallOrVisit,
  addCustodyRecord,
  toggleCustodyStatus,
  deleteCustodyRecord,
  updateCorrespondenceStatus,
  importStateBackup,
  toggleToastMuted,
  clearActivityLog,
  pushToast,
} from '../store/secretariatSlice';
import { ArchiveFolderId } from '../types/secretariat';
import { ModalType } from './QuickActionModals';
import { ExportReportToolbar } from './ExportReportToolbar';

interface SubModuleViewsProps {
  onOpenModal: (modal: ModalType) => void;
}

export const SubModuleViews: React.FC<SubModuleViewsProps> = ({ onOpenModal }) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.secretariat);

  const [newCorrSubject, setNewCorrSubject] = useState('');
  const [newCorrDirection, setNewCorrDirection] = useState<'incoming' | 'outgoing'>('incoming');

  // Archive Folder states
  const [selectedArchiveFolder, setSelectedArchiveFolder] = useState<ArchiveFolderId>('all');
  const [targetFolderForArchiving, setTargetFolderForArchiving] = useState<
    Exclude<ArchiveFolderId, 'all'>
  >('folder_2026_official');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);

  // Task inline editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDueDate, setEditingTaskDueDate] = useState('');
  const [editingTaskDepartment, setEditingTaskDepartment] = useState('');

  // Correspondence filter tab state
  const [corrStatusFilter, setCorrStatusFilter] = useState<
    'all' | 'incoming' | 'outgoing' | 'completed' | 'in_progress' | 'overdue'
  >('all');

  // Circular filter state
  const [circularFilter, setCircularFilter] = useState<'all' | 'circular' | 'decision'>('all');

  // Custody form states
  const [showCustodyForm, setShowCustodyForm] = useState(false);
  const [custodyItem, setCustodyItem] = useState('');
  const [custodyHolder, setCustodyHolder] = useState('');
  const [custodyDept, setCustodyDept] = useState('إدارة المشاريع');
  const [custodyDate, setCustodyDate] = useState('2026-11-03');

  // Backup notification message
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const query = state.searchQuery.trim().toLowerCase();

  const getSectionTitle = () => {
    switch (state.activeTab) {
      case 'correspondence':
        return 'سجل المراسلات الصادرة والواردة';
      case 'circulars':
        return 'سجل التعاميم والقرارات الإدارية';
      case 'tasks':
        return 'بيان المهام والمتابعة التنفيذية';
      case 'meetings':
        return 'جدول الاجتماعات واللجان الهندسية';
      case 'calls':
        return 'سجل مواعيد الاتصالات الهاتفية';
      case 'custody':
        return 'دفتر العهدة والمستلزمات الرسمية';
      case 'visitors':
        return 'سجل الزوار والوفود الرسمية';
      case 'archive':
        return 'مجلدات الأرشيف الدائم واسترجاع المراسلات';
      case 'reports':
        return 'التقارير الإحصائية ومؤشرات الإنجاز';
      case 'settings':
        return 'إعدادات النظام وتفضيلات العرض';
      default:
        return 'لوحة تحكم إدارة السكرتارية';
    }
  };

  const handlePrintCurrentPage = () => {
    const t0 = performance.now();
    dispatch(
      recordPerformanceMetric({
        actionName: `طباعة مباشرة لصفحة: ${getSectionTitle()}`,
        durationMs: Math.max(0.7, performance.now() - t0),
      })
    );
    window.print();
  };

  const handleAddQuickCorrespondence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCorrSubject.trim()) return;
    dispatch(
      addCorrespondence({
        refNumber: `${newCorrDirection === 'incoming' ? 'IN' : 'OUT'}-2026-${Math.floor(
          500 + Math.random() * 400
        )}`,
        subject: newCorrSubject.trim(),
        direction: newCorrDirection,
        type: 'official_letters',
        department: 'إدارة المشاريع',
        date: '2026-11-03',
        status: 'in_progress',
      })
    );
    setNewCorrSubject('');
  };

  const handleArchiveSingle = (correspondenceId: string, refNumber: string) => {
    const t0 = performance.now();
    dispatch(
      archiveCorrespondence({
        correspondenceId,
        folderId: targetFolderForArchiving,
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: `أرشفة المراسلة [${refNumber}] في مجلد الأرشيف`,
        durationMs: Math.max(0.6, performance.now() - t0),
      })
    );
  };

  const handleRestoreSingle = (archivedId: string, refNumber: string) => {
    const t0 = performance.now();
    dispatch(restoreArchivedCorrespondence(archivedId));
    dispatch(
      recordPerformanceMetric({
        actionName: `استرجاع المراسلة [${refNumber}] من الأرشيف`,
        durationMs: Math.max(0.6, performance.now() - t0),
      })
    );
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    dispatch(
      createArchiveFolder({
        name: newFolderName.trim(),
        description: newFolderDesc.trim() || 'مجلد أرشيف مخصص للمراسلات',
      })
    );
    setNewFolderName('');
    setNewFolderDesc('');
    setShowNewFolderForm(false);
  };

  const filteredArchivedList = (state.archivedCorrespondences || []).filter((item) => {
    const matchFolder =
      selectedArchiveFolder === 'all' || item.folderId === selectedArchiveFolder;
    const matchSearch =
      !query ||
      item.subject.toLowerCase().includes(query) ||
      item.refNumber.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query);
    return matchFolder && matchSearch;
  });

  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Official Paper Letterhead (Visible ONLY during Direct Printing via @media print) */}
      <div className="hidden print-only border-b-2 border-[#3b0764] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#3b0764]">
              الشركة المصرية الهندسية للمقاولات (EEC)
            </h1>
            <p className="text-xs font-bold text-slate-700 mt-0.5">
              إدارة السكرتارية التنفيذية · مستند رسمي مطبوع للأرشفة الورقية
            </p>
          </div>
          <div className="text-left">
            <h2 className="text-base font-extrabold text-slate-900">{getSectionTitle()}</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              تاريخ الطباعة: {todayFormatted} | السنة المالية: {state.selectedYear}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-module Header Bar with Back to Dashboard Button (Hidden in Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white/90 dark:bg-[#1e1333]/90 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('dashboard'))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-[#4c1d95] dark:text-purple-200 text-xs font-bold transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة التحكم</span>
          </button>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {getSectionTitle()}
          </h2>
        </div>

        {/* Synchronized Search Input + Direct Print & Export PDF/Excel Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <ExportReportToolbar
            defaultScope={
              state.activeTab === 'tasks'
                ? 'tasks'
                : state.activeTab === 'correspondence'
                ? 'correspondence'
                : 'all'
            }
          />
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-purple-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={state.searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="بحث سريع في السجلات..."
              className="w-full pr-9 pl-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/50 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* 1. Correspondence View (with Direct Print & Archive to Folder Action) */}
      {state.activeTab === 'correspondence' && (
        <div className="space-y-4">
          <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-3">
            <form
              onSubmit={handleAddQuickCorrespondence}
              className="lg:col-span-7 bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 flex flex-wrap items-center gap-2.5"
            >
              <FolderOpen className="w-5 h-5 text-purple-700 dark:text-purple-300 shrink-0" />
              <input
                type="text"
                value={newCorrSubject}
                onChange={(e) => setNewCorrSubject(e.target.value)}
                placeholder="إضافة معاملة أو مراسلة جديدة سريعة..."
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-xs font-bold text-slate-900 dark:text-white"
              />
              <select
                value={newCorrDirection}
                onChange={(e) => setNewCorrDirection(e.target.value as 'incoming' | 'outgoing')}
                className="px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-xs font-bold text-slate-800 dark:text-white"
              >
                <option value="incoming">مراسلة واردة</option>
                <option value="outgoing">مراسلة صادرة</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل</span>
              </button>
            </form>

            {/* Target Folder Selector & Batch Archive Completed Button */}
            <div className="lg:col-span-5 bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                <FolderArchive className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-purple-300">
                    مجلد الأرشفة الافتراضي:
                  </label>
                  <select
                    value={targetFolderForArchiving}
                    onChange={(e) =>
                      setTargetFolderForArchiving(
                        e.target.value as Exclude<ArchiveFolderId, 'all'>
                      )
                    }
                    className="w-full text-xs font-extrabold text-purple-900 dark:text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    {(state.archiveFolders || []).map((folder) => (
                      <option
                        key={folder.id}
                        value={folder.id}
                        className="bg-white dark:bg-[#1e1333]"
                      >
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  dispatch(archiveCompletedCorrespondences(targetFolderForArchiving))
                }
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer whitespace-nowrap"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>
                  أرشفة المكتملة (
                  {state.correspondences.filter((c) => c.status === 'completed').length})
                </span>
              </button>
            </div>
          </div>

          {/* Filter Pills for Correspondence */}
          <div className="no-print flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white/90 dark:bg-[#1e1333]/90 border border-purple-200 dark:border-purple-800 text-xs">
            <span className="px-2 font-bold text-slate-500 dark:text-purple-300 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية:</span>
            </span>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'all'
                  ? 'bg-[#581c87] text-white shadow-xs'
                  : 'text-slate-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }`}
            >
              الكل ({state.correspondences.length})
            </button>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('incoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'incoming'
                  ? 'bg-[#581c87] text-white shadow-xs'
                  : 'text-slate-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }`}
            >
              وارد ({state.correspondences.filter((c) => c.direction === 'incoming').length})
            </button>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('outgoing')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'outgoing'
                  ? 'bg-[#581c87] text-white shadow-xs'
                  : 'text-slate-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40'
              }`}
            >
              صادر ({state.correspondences.filter((c) => c.direction === 'outgoing').length})
            </button>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'completed'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              مكتملة ({state.correspondences.filter((c) => c.status === 'completed').length})
            </button>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'in_progress'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
              }`}
            >
              قيد التنفيذ ({state.correspondences.filter((c) => c.status === 'in_progress').length})
            </button>
            <button
              type="button"
              onClick={() => setCorrStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                corrStatusFilter === 'overdue'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              متأخرة ({state.correspondences.filter((c) => c.status === 'overdue').length})
            </button>
          </div>

          <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="no-print px-4 py-3 border-b border-purple-100 dark:border-purple-800 flex items-center justify-between">
              <span className="text-xs font-extrabold text-purple-900 dark:text-purple-200">
                جدول المراسلات الصادرة والواردة ({
                  state.correspondences.filter((c) => {
                    const matchFilter =
                      corrStatusFilter === 'all'
                        ? true
                        : corrStatusFilter === 'incoming' || corrStatusFilter === 'outgoing'
                        ? c.direction === corrStatusFilter
                        : c.status === corrStatusFilter;
                    const matchSearch =
                      !query ||
                      c.subject.toLowerCase().includes(query) ||
                      c.refNumber.toLowerCase().includes(query) ||
                      c.department.toLowerCase().includes(query);
                    return matchFilter && matchSearch;
                  }).length
                })
              </span>
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-[#581c87] text-[#4c1d95] hover:text-white dark:bg-purple-900/60 dark:text-purple-200 text-xs font-extrabold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة سجل المراسلات</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-purple-100/80 dark:bg-purple-900/50 text-purple-950 dark:text-purple-100 font-extrabold">
                  <tr>
                    <th className="py-3 px-4">الرقم المرجعي</th>
                    <th className="py-3 px-4">الموضوع</th>
                    <th className="py-3 px-4">الاتجاه</th>
                    <th className="py-3 px-4">الإدارة</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">الحالة (انقر للتعديل)</th>
                    <th className="no-print py-3 px-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                  {state.correspondences
                    .filter((c) => {
                      const matchFilter =
                        corrStatusFilter === 'all'
                          ? true
                          : corrStatusFilter === 'incoming' || corrStatusFilter === 'outgoing'
                          ? c.direction === corrStatusFilter
                          : c.status === corrStatusFilter;
                      const matchSearch =
                        !query ||
                        c.subject.toLowerCase().includes(query) ||
                        c.refNumber.toLowerCase().includes(query) ||
                        c.department.toLowerCase().includes(query);
                      return matchFilter && matchSearch;
                    })
                    .map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-purple-50/60 dark:hover:bg-purple-900/25 transition"
                      >
                        <td className="py-3 px-4 font-mono tabular-nums font-bold text-purple-800 dark:text-purple-300">
                          {item.refNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {item.subject}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-purple-200">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                              item.direction === 'incoming'
                                ? 'bg-purple-100 dark:bg-purple-900/50 text-[#581c87] dark:text-purple-200'
                                : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {item.direction === 'incoming' ? 'وارد' : 'صادر'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-purple-200">
                          {item.department}
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-purple-300">
                          {item.date}
                        </td>
                        <td className="py-3 px-4">
                          <div className="no-print">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                dispatch(
                                  updateCorrespondenceStatus({
                                    id: item.id,
                                    status: e.target.value as 'completed' | 'in_progress' | 'overdue',
                                  })
                                )
                              }
                              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border cursor-pointer focus:outline-none ${
                                item.status === 'completed'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  : item.status === 'in_progress'
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              }`}
                            >
                              <option value="completed">مكتملة</option>
                              <option value="in_progress">قيد التنفيذ</option>
                              <option value="overdue">متأخرة</option>
                            </select>
                          </div>
                          <div className="hidden print-only">
                            {item.status === 'completed' && 'مكتملة'}
                            {item.status === 'in_progress' && 'قيد التنفيذ'}
                            {item.status === 'overdue' && 'متأخرة'}
                          </div>
                        </td>
                        <td className="no-print py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleArchiveSingle(item.id, item.refNumber)}
                              title="نقل هذه المراسلة إلى مجلد الأرشيف الدائم"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-[#581c87] text-[#4c1d95] hover:text-white dark:bg-purple-900/60 dark:text-purple-200 dark:hover:bg-purple-700 font-extrabold transition cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>أرشفة</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => dispatch(deleteCorrespondence(item.id))}
                              title="حذف المراسلة وتوثيق العملية في سجل النشاطات"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 font-extrabold transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Circulars & Decisions View (Filterable & Deletable) */}
      {state.activeTab === 'circulars' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <FileUp className="w-5 h-5" />
              <span>جميع التعاميم والقرارات الصادرة ({state.circulars.length})</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-xl bg-purple-50 dark:bg-purple-950/50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setCircularFilter('all')}
                className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${
                  circularFilter === 'all'
                    ? 'bg-white dark:bg-[#2c1a4d] text-[#581c87] dark:text-purple-200 shadow-xs'
                    : 'text-slate-600 dark:text-purple-300'
                }`}
              >
                الكل ({state.circulars.length})
              </button>
              <button
                type="button"
                onClick={() => setCircularFilter('circular')}
                className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${
                  circularFilter === 'circular'
                    ? 'bg-white dark:bg-[#2c1a4d] text-[#581c87] dark:text-purple-200 shadow-xs'
                    : 'text-slate-600 dark:text-purple-300'
                }`}
              >
                تعاميم إدارية ({state.circulars.filter((c) => c.docType === 'circular').length})
              </button>
              <button
                type="button"
                onClick={() => setCircularFilter('decision')}
                className={`px-3 py-1 rounded-lg font-extrabold transition cursor-pointer ${
                  circularFilter === 'decision'
                    ? 'bg-white dark:bg-[#2c1a4d] text-[#581c87] dark:text-purple-200 shadow-xs'
                    : 'text-slate-600 dark:text-purple-300'
                }`}
              >
                قرارات تنفيذية ({state.circulars.filter((c) => c.docType === 'decision').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة التعاميم</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('issue_circular')}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إصدار تعميم جديد</span>
              </button>
            </div>
          </div>
          <div className="divide-y divide-purple-100 dark:divide-purple-800/60">
            {state.circulars
              .filter((c) => {
                const matchType =
                  circularFilter === 'all' || c.docType === circularFilter;
                const matchSearch =
                  !query ||
                  c.subject.toLowerCase().includes(query) ||
                  c.refNumber.toLowerCase().includes(query) ||
                  c.department.toLowerCase().includes(query);
                return matchType && matchSearch;
              })
              .map((c) => (
                <div
                  key={c.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        c.docType === 'decision'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                          : 'bg-purple-100 text-[#581c87] dark:bg-purple-900/60 dark:text-purple-200'
                      }`}
                    >
                      {c.docType === 'decision' ? 'قرار تنفيذي' : 'تعميم إداري'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{c.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="text-purple-700 dark:text-purple-300 font-bold">
                      {c.refNumber}
                    </span>
                    <span className="text-slate-500 dark:text-purple-300">{c.department}</span>
                    <span className="text-slate-600 dark:text-purple-200 font-bold">{c.date}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteCircular(c.id))}
                      title="حذف هذا التعميم وتوثيق الحذف"
                      className="no-print p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. Tasks View (Interactive List + Inline Edit & Delete + Formal Printable Table) */}
      {state.activeTab === 'tasks' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <CheckSquare className="w-5 h-5" />
              <span>قائمة المهام والمتابعة اليومية ({state.tasks.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-[#581c87] text-[#4c1d95] hover:text-white dark:bg-purple-900/60 dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة جدول المهام</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('add_task')}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مهمة</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-100/80 dark:bg-purple-900/50 text-purple-950 dark:text-purple-100 font-extrabold">
                <tr>
                  <th className="py-2.5 px-3">م</th>
                  <th className="py-2.5 px-3">عنوان المهمة</th>
                  <th className="py-2.5 px-3">الإدارة المسؤولة</th>
                  <th className="py-2.5 px-3">تاريخ الاستحقاق</th>
                  <th className="py-2.5 px-3">حالة الإنجاز</th>
                  <th className="no-print py-2.5 px-3 text-left">إجراءات الرقابة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                {state.tasks
                  .filter(
                    (t) =>
                      !query ||
                      t.title.toLowerCase().includes(query) ||
                      t.department.toLowerCase().includes(query) ||
                      t.dueDate.includes(query)
                  )
                  .map((t, index) => {
                    const isEditing = editingTaskId === t.id;
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-purple-50/70 dark:hover:bg-purple-900/30 transition"
                      >
                        <td className="py-3 px-3 font-mono tabular-nums font-bold">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTaskTitle}
                              onChange={(e) => setEditingTaskTitle(e.target.value)}
                              className="w-full px-2.5 py-1 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-[#2a1b47] text-xs font-bold text-slate-900 dark:text-white"
                            />
                          ) : (
                            <div
                              onClick={() => dispatch(toggleTaskCompleted(t.id))}
                              className="flex items-center gap-2.5 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={() => {}}
                                className="no-print w-4 h-4 accent-[#6b21a8] rounded cursor-pointer"
                              />
                              <span
                                className={`font-bold ${
                                  t.completed
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-purple-200 font-semibold">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingTaskDepartment}
                              onChange={(e) => setEditingTaskDepartment(e.target.value)}
                              className="w-32 px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-[#2a1b47] text-xs font-bold text-slate-900 dark:text-white"
                            />
                          ) : (
                            t.department
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editingTaskDueDate}
                              onChange={(e) => setEditingTaskDueDate(e.target.value)}
                              className="px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-600 bg-white dark:bg-[#2a1b47] text-xs font-mono text-slate-900 dark:text-white"
                            />
                          ) : (
                            t.dueDate
                          )}
                        </td>
                        <td className="py-3 px-3 font-extrabold">
                          {t.completed ? (
                            <span className="text-emerald-700 dark:text-emerald-400">
                              منجزة
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                              قيد المتابعة
                            </span>
                          )}
                        </td>
                        <td className="no-print py-3 px-3 text-left">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingTaskTitle.trim()) {
                                    dispatch(
                                      updateTask({
                                        id: t.id,
                                        title: editingTaskTitle.trim(),
                                        dueDate: editingTaskDueDate || t.dueDate,
                                        department: editingTaskDepartment.trim() || t.department,
                                      })
                                    );
                                  }
                                  setEditingTaskId(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>حفظ</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTaskId(null)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-purple-200 font-bold cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTaskId(t.id);
                                  setEditingTaskTitle(t.title);
                                  setEditingTaskDueDate(t.dueDate);
                                  setEditingTaskDepartment(t.department);
                                }}
                                title="تعديل المهمة وتوثيق التعديل في سجل النشاطات"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-500 text-amber-800 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-600 font-extrabold transition cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => dispatch(deleteTask(t.id))}
                                title="حذف المهمة وتوثيق العملية في سجل النشاطات"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 font-extrabold transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Meetings View (with location details and cancellation) */}
      {state.activeTab === 'meetings' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <CalendarDays className="w-5 h-5" />
              <span>جدول الاجتماعات واللجان الهندسية المجدولة ({state.meetings.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة جدول الاجتماعات</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('schedule_meeting')}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>جدولة اجتماع جديد</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {state.meetings
              .filter(
                (m) =>
                  !query ||
                  m.title.toLowerCase().includes(query) ||
                  m.department.toLowerCase().includes(query) ||
                  m.date.includes(query)
              )
              .map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {m.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => dispatch(deleteMeeting(m.id))}
                        title="إلغاء وحذف هذا الاجتماع"
                        className="no-print p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-100 text-[#581c87] dark:bg-purple-900/60 dark:text-purple-200">
                      {m.department}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-purple-300 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{m.location || 'قاعة الاجتماعات الرئيسية - الدور الرابع'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-purple-200/60 dark:border-purple-800 text-xs font-mono tabular-nums font-bold text-purple-900 dark:text-purple-200">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {m.time}
                    </span>
                    <span>{m.date}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. Calls View (Dedicated Telephone Log) */}
      {state.activeTab === 'calls' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <PhoneCall className="w-5 h-5 text-purple-600" />
              <span>
                سجل مواعيد الاتصالات الهاتفية والمتابعات (
                {state.callsAndVisits.filter((cv) => cv.type === 'call').length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة سجل الاتصالات</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('log_call')}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل موعد اتصال</span>
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {state.callsAndVisits
              .filter((cv) => cv.type === 'call')
              .filter(
                (cv) =>
                  !query ||
                  cv.title.toLowerCase().includes(query) ||
                  cv.contactPerson.toLowerCase().includes(query) ||
                  cv.date.includes(query)
              )
              .map((cv) => (
                <div
                  key={cv.id}
                  className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white">{cv.title}</p>
                      <p className="text-slate-500 dark:text-purple-300 mt-0.5">
                        الجهة أو الطرف المعني: {cv.contactPerson}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono tabular-nums font-bold text-purple-800 dark:text-purple-200">
                      {cv.time} · {cv.date}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteCallOrVisit(cv.id))}
                      title="حذف هذا الموعد"
                      className="no-print p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 6. Visitors & Delegations View (Dedicated View) */}
      {state.activeTab === 'visitors' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-3">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <Users className="w-5 h-5 text-amber-500" />
              <span>
                سجل الزوار والوفود الرسمية الحكومية والهندسية (
                {state.callsAndVisits.filter((cv) => cv.type !== 'call').length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة سجل الزوار</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('log_call')}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل زائر / وفد جديد</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {state.callsAndVisits
              .filter((cv) => cv.type !== 'call')
              .filter(
                (cv) =>
                  !query ||
                  cv.title.toLowerCase().includes(query) ||
                  cv.contactPerson.toLowerCase().includes(query) ||
                  cv.date.includes(query)
              )
              .map((cv) => (
                <div
                  key={cv.id}
                  className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          cv.type === 'delegation'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-purple-100 text-[#581c87] dark:bg-purple-900/60 dark:text-purple-200'
                        }`}
                      >
                        {cv.type === 'delegation' ? 'وفد رسمي رفيع' : 'زيارة استشاري / مورد'}
                      </span>
                      <button
                        type="button"
                        onClick={() => dispatch(deleteCallOrVisit(cv.id))}
                        title="حذف هذا الزائر"
                        className="no-print p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cv.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-purple-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>{cv.contactPerson}</span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-purple-200/60 dark:border-purple-800 text-xs font-mono tabular-nums font-bold text-purple-900 dark:text-purple-200">
                    <span>{cv.time}</span>
                    <span>{cv.date}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. Custody Book View (Interactive Inventory with Add & Return features) */}
      {state.activeTab === 'custody' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-4">
          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
              <BookOpen className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              <span>دفتر العهدة والمستلزمات الرسمية والأختام ({state.custodyRecords.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintCurrentPage}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة سجل العهدة</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCustodyForm((prev) => !prev)}
                className="px-4 py-2 rounded-xl bg-[#581c87] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة عهدة رسمية</span>
              </button>
            </div>
          </div>

          {/* Inline Form to Add New Custody Record */}
          {showCustodyForm && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!custodyItem.trim() || !custodyHolder.trim()) return;
                dispatch(
                  addCustodyRecord({
                    itemName: custodyItem.trim(),
                    holderName: custodyHolder.trim(),
                    department: custodyDept,
                    receivedDate: custodyDate,
                    status: 'active',
                  })
                );
                setCustodyItem('');
                setCustodyHolder('');
                setShowCustodyForm(false);
              }}
              className="no-print p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-700 space-y-3"
            >
              <h4 className="text-xs font-black text-purple-950 dark:text-white">
                إدراج عهدة أو ختم رسمي جديد:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-purple-200 mb-1">
                    اسم العهدة / المستلزم
                  </label>
                  <input
                    type="text"
                    required
                    value={custodyItem}
                    onChange={(e) => setCustodyItem(e.target.value)}
                    placeholder="مثال: ختم الاعتماد الفني لمشروع..."
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-purple-200 mb-1">
                    اسم المستلم الفعلي
                  </label>
                  <input
                    type="text"
                    required
                    value={custodyHolder}
                    onChange={(e) => setCustodyHolder(e.target.value)}
                    placeholder="مثال: م. أحمد عبد العزيز..."
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-purple-200 mb-1">
                    الإدارة المسؤولة
                  </label>
                  <select
                    value={custodyDept}
                    onChange={(e) => setCustodyDept(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="إدارة المشاريع">إدارة المشاريع</option>
                    <option value="المشتريات">المشتريات</option>
                    <option value="الشؤون القانونية">الشؤون القانونية</option>
                    <option value="الموارد البشرية">الموارد البشرية</option>
                    <option value="الإدارة المالية">الإدارة المالية</option>
                    <option value="المكتب الفني">المكتب الفني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-purple-200 mb-1">
                    تاريخ الاستلام
                  </label>
                  <input
                    type="date"
                    value={custodyDate}
                    onChange={(e) => setCustodyDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustodyForm(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-purple-200 text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs"
                >
                  حفظ العهدة في الدفتر
                </button>
              </div>
            </form>
          )}

          {/* Custody Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-purple-100/80 dark:bg-purple-900/50 text-purple-950 dark:text-purple-100 font-extrabold">
                <tr>
                  <th className="py-2.5 px-3">اسم العهدة / المستلزم</th>
                  <th className="py-2.5 px-3">المستلم الفعلي</th>
                  <th className="py-2.5 px-3">الإدارة المعنية</th>
                  <th className="py-2.5 px-3">تاريخ الاستلام</th>
                  <th className="py-2.5 px-3">حالة العهدة</th>
                  <th className="no-print py-2.5 px-3 text-left">إجراءات الرقابة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                {state.custodyRecords
                  .filter(
                    (c) =>
                      !query ||
                      c.itemName.toLowerCase().includes(query) ||
                      c.holderName.toLowerCase().includes(query) ||
                      c.department.toLowerCase().includes(query)
                  )
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-purple-50/60 dark:hover:bg-purple-900/25 transition"
                    >
                      <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                        {item.itemName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-purple-200 font-bold">
                        {item.holderName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-purple-300">
                        {item.department}
                      </td>
                      <td className="py-3 px-3 font-mono tabular-nums text-slate-600 dark:text-purple-300">
                        {item.receivedDate}
                      </td>
                      <td className="py-3 px-3">
                        {item.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> عهدة نشطة ومستلمة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-bold">
                            <RotateCcw className="w-3.5 h-3.5" /> تمت إعادتها للأرشيف
                          </span>
                        )}
                      </td>
                      <td className="no-print py-3 px-3 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => dispatch(toggleCustodyStatus(item.id))}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                              item.status === 'active'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {item.status === 'active' ? 'تسجيل إرجاع' : 'إعادة تفعيل'}
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(deleteCustodyRecord(item.id))}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Dedicated Archive Vault View */}
      {state.activeTab === 'archive' && (
        <div className="space-y-4">
          {/* Top Archive Status & Folder Creation Banner */}
          <div className="no-print bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/70 text-[#581c87] dark:text-purple-300 flex items-center justify-center">
                <HardDriveDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  خزينة الأرشيف الدائم للمراسلات (محفوظة تلقائياً في LocalStorage)
                </h3>
                <p className="text-xs text-slate-500 dark:text-purple-300">
                  إجمالي المراسلات المؤرشفة: {(state.archivedCorrespondences || []).length} مراسلة موزعة على {(state.archiveFolders || []).length} مجلدات خاصة
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowNewFolderForm((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 dark:hover:bg-purple-800 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>إنشاء مجلد أرشيف جديد</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    archiveCompletedCorrespondences(
                      selectedArchiveFolder === 'all'
                        ? 'folder_2026_official'
                        : selectedArchiveFolder
                    )
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>أرشفة المراسلات المكتملة الحالية</span>
              </button>
            </div>
          </div>

          {/* New Folder Creation Form */}
          {showNewFolderForm && (
            <form
              onSubmit={handleCreateFolder}
              className="no-print bg-purple-50/90 dark:bg-[#261742] border border-purple-200 dark:border-purple-700 rounded-2xl p-4 flex flex-wrap items-center gap-3"
            >
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="اسم المجلد الجديد (مثال: أرشيف مشروعات الصعيد 2026)..."
                className="flex-1 min-w-[220px] px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-xs font-bold text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newFolderDesc}
                onChange={(e) => setNewFolderDesc(e.target.value)}
                placeholder="وصف مختصر للمجلد..."
                className="flex-1 min-w-[200px] px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#1e1333] text-xs font-bold text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold cursor-pointer"
              >
                حفظ المجلد
              </button>
            </form>
          )}

          {/* Special Archive Folders Grid */}
          <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setSelectedArchiveFolder('all')}
              className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                selectedArchiveFolder === 'all'
                  ? 'bg-[#581c87] text-white border-[#4c1d95] shadow-md'
                  : 'bg-white/95 dark:bg-[#1e1333]/95 border-purple-200 dark:border-purple-800 hover:border-purple-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <FolderArchive
                  className={`w-5 h-5 ${
                    selectedArchiveFolder === 'all'
                      ? 'text-amber-300'
                      : 'text-[#6b21a8] dark:text-purple-300'
                  }`}
                />
                <span className="font-mono tabular-nums text-sm font-black">
                  {(state.archivedCorrespondences || []).length}
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs font-extrabold">جميع مجلدات الأرشيف</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    selectedArchiveFolder === 'all'
                      ? 'text-purple-200'
                      : 'text-slate-500 dark:text-purple-300'
                  }`}
                >
                  عرض كافة المراسلات المؤرشفة
                </p>
              </div>
            </button>

            {(state.archiveFolders || []).map((folder) => {
              const count = (state.archivedCorrespondences || []).filter(
                (item) => item.folderId === folder.id
              ).length;
              const isSelected = selectedArchiveFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedArchiveFolder(folder.id)}
                  className={`p-3.5 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#581c87] text-white border-[#4c1d95] shadow-md'
                      : 'bg-white/95 dark:bg-[#1e1333]/95 border-purple-200 dark:border-purple-800 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FolderOpen
                      className={`w-5 h-5 ${isSelected ? 'text-amber-300' : 'text-amber-500'}`}
                    />
                    <span className="font-mono tabular-nums text-sm font-black">{count}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-extrabold truncate">{folder.name}</p>
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isSelected ? 'text-purple-200' : 'text-slate-500 dark:text-purple-300'
                      }`}
                    >
                      {folder.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Archived Correspondences Table */}
          <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="no-print px-4 py-3 border-b border-purple-100 dark:border-purple-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                <Archive className="w-4 h-4 text-[#6b21a8] dark:text-purple-300" />
                <span>سجل المراسلات المؤرشفة ({filteredArchivedList.length})</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                محفوظ بشكل دائم في LocalStorage
              </span>
            </div>

            {filteredArchivedList.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-extrabold text-slate-700 dark:text-purple-200">
                  لا توجد مراسلات مؤرشفة في هذا المجلد حالياً
                </p>
                <p className="text-xs text-slate-500 dark:text-purple-300">
                  يمكنك أرشفة أي مراسلة من قسم المراسلات أو الضغط على زر "أرشفة المراسلات المكتملة الحالية".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-purple-100/80 dark:bg-purple-900/50 text-purple-950 dark:text-purple-100 font-extrabold">
                    <tr>
                      <th className="py-3 px-4">الرقم المرجعي</th>
                      <th className="py-3 px-4">موضوع المراسلة</th>
                      <th className="py-3 px-4">المجلد المحفوظ</th>
                      <th className="py-3 px-4">الإدارة</th>
                      <th className="py-3 px-4">تاريخ المعاملة</th>
                      <th className="py-3 px-4">تاريخ الأرشفة</th>
                      <th className="no-print py-3 px-4 text-left">استرجاع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100 dark:divide-purple-800/60">
                    {filteredArchivedList.map((item) => {
                      const folderName =
                        (state.archiveFolders || []).find((f) => f.id === item.folderId)?.name ||
                        'مجلد الأرشيف العام';
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-purple-50/60 dark:hover:bg-purple-900/25 transition"
                        >
                          <td className="py-3 px-4 font-mono tabular-nums font-bold text-purple-800 dark:text-purple-300">
                            {item.refNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {item.subject}
                            </p>
                            {item.archiveNotes && (
                              <p className="text-[10px] text-slate-500 dark:text-purple-300 mt-0.5">
                                {item.archiveNotes}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-300">
                            {folderName}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-purple-200">
                            {item.department}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-purple-300">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                            {item.archivedAt}
                          </td>
                          <td className="no-print py-3 px-4 text-left">
                            <button
                              type="button"
                              onClick={() => handleRestoreSingle(item.id, item.refNumber)}
                              title="استرجاع المراسلة إلى السجل النشط"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-2xs transition cursor-pointer whitespace-nowrap"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" />
                              <span>استرجاع للسجل النشط</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. Reports View */}
      {state.activeTab === 'reports' && (
        <div className="print-clean-card bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm">
            <BarChart3 className="w-5 h-5" />
            <span>تقرير الأداء الشامل لحركة السكرتارية لعام 2026</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
              <span className="text-xs font-bold text-slate-600 dark:text-purple-300">
                إجمالي المعاملات الموثقة
              </span>
              <p className="text-2xl font-black font-mono tabular-nums text-purple-900 dark:text-white mt-1">
                {state.stats.totalTransactions.toLocaleString('en-US')}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                المعاملات المكتملة بنجاح
              </span>
              <p className="text-2xl font-black font-mono tabular-nums text-emerald-800 dark:text-white mt-1">
                {state.stats.completedTransactions.toLocaleString('en-US')} (81.2%)
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                المعاملات المتأخرة الحالية
              </span>
              <p className="text-2xl font-black font-mono tabular-nums text-rose-800 dark:text-white mt-1">
                {state.stats.overdueTransactionsCount}
              </p>
            </div>
          </div>

          {state.overdueTransactions.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-extrabold text-slate-700 dark:text-purple-200">
                معالجة المعاملات المتأخرة السريعة:
              </h4>
              {state.overdueTransactions.map((ot) => (
                <div
                  key={ot.id}
                  className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{ot.subject}</span>
                    <span className="mx-2 text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-purple-200">{ot.department}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(resolveOverdueTransaction(ot.id))}
                    className="no-print px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    اعتماد وإنجاز
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. Settings View (Appearance, Notifications, JSON Backup/Restore, Audit Log & Factory Reset) */}
      {state.activeTab === 'settings' && (
        <div className="no-print bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/80 pb-3">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black text-base">
              <Settings className="w-5 h-5 text-purple-700 dark:text-purple-300" />
              <span>إعدادات النظام، التنبيهات، والتخزين المحلي</span>
            </div>
            {backupMessage && (
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-bold animate-pulse">
                {backupMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Setting 1: Appearance Mode */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  وضع المظهر (الداكن / الفاتح)
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  التبديل الفوري بين التصميم الفاتح والوضع الليلي
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(toggleTheme())}
                className="px-4 py-2 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition shrink-0"
              >
                {state.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{state.theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
              </button>
            </div>

            {/* Setting 2: Toast Notifications */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  الإشعارات المنبثقة الذكية (Toast)
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  فحص مواعيد المهام والمراسلات العاجلة تلقائياً
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => dispatch(toggleToastMuted())}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition ${
                    state.toastMuted
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {state.toastMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  <span>{state.toastMuted ? 'مكتومة' : 'مفعلة'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(
                      pushToast({
                        title: 'تنبيه اختباري فوري',
                        message: 'نظام التنبيهات يعمل بنجاح وبسرعة فائقة.',
                        urgency: 'success',
                        targetTab: 'dashboard',
                      })
                    );
                  }}
                  className="px-2.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-bold transition cursor-pointer"
                >
                  تجربة
                </button>
              </div>
            </div>

            {/* Setting 3: JSON Data Export */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  تصدير نسخة احتياطية (JSON)
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  حفظ نسخة كاملة من المراسلات والأرشيف والمهام على جهازك
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    const dataStr =
                      'data:text/json;charset=utf-8,' +
                      encodeURIComponent(JSON.stringify(state, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute(
                      'download',
                      `eec_secretariat_backup_${new Date().toISOString().slice(0, 10)}.json`
                    );
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    setBackupMessage('تم تنزيل النسخة الاحتياطية بنجاح.');
                    setTimeout(() => setBackupMessage(null), 4000);
                  } catch {
                    setBackupMessage('فشل في تصدير النسخة الاحتياطية.');
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-[#581c87] hover:bg-[#4c1d95] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تصدير JSON</span>
              </button>
            </div>

            {/* Setting 4: JSON Data Import */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  استيراد نسخة احتياطية (JSON)
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  استرجاع ملف بيانات سابق وتطبيقه على النظام
                </p>
              </div>
              <label className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition shrink-0">
                <Upload className="w-4 h-4" />
                <span>استيراد ملف</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed && parsed.stats && parsed.tasks) {
                          dispatch(importStateBackup(parsed));
                          setBackupMessage('تمت استعادة النسخة الاحتياطية بنجاح!');
                        } else {
                          setBackupMessage('ملف النسخة الاحتياطية غير صالح.');
                        }
                      } catch {
                        setBackupMessage('خطأ في قراءة الملف.');
                      }
                      setTimeout(() => setBackupMessage(null), 4000);
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>

            {/* Setting 5: Clear Audit Activity Log */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  مسح سجل النشاطات الرقابي
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  تفريغ العمليات المسجلة حالياً ({state.activityLog.length} عملية)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من تفريغ سجل النشاطات الرقابي؟')) {
                    dispatch(clearActivityLog());
                    setBackupMessage('تم مسح سجل النشاطات بنجاح.');
                    setTimeout(() => setBackupMessage(null), 3000);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>مسح السجل</span>
              </button>
            </div>

            {/* Setting 6: Factory Reset */}
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  إعادة ضبط البيانات الأصلية
                </p>
                <p className="text-xs text-slate-600 dark:text-purple-300 mt-0.5">
                  استعادة كافة الأرقام والجداول الافتراضية
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل تريد استعادة البيانات الافتراضية المطابقة للصورة المرجعية؟')) {
                    dispatch(resetToDefaultData());
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة الأصل</span>
              </button>
            </div>
          </div>

          {/* System Technical Diagnostic Card */}
          <div className="p-4 rounded-2xl bg-purple-100/70 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-extrabold text-slate-900 dark:text-white">
                نظام إدارة السكرتارية التنفيذية (EEC Secretariat Core v2.4)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-purple-300 font-mono font-bold">
              <span>المعاملات: {state.stats.totalTransactions}</span>
              <span>الأرشيف: {state.archivedCorrespondences.length}</span>
              <span>المهام: {state.tasks.length}</span>
              <span>آخر حفظ: {state.lastSavedAt}</span>
            </div>
          </div>
        </div>
      )}

      {/* Official Paper Signature Footer (Visible ONLY during Direct Printing via @media print) */}
      <div className="hidden print-only pt-8 mt-8 border-t border-dashed border-slate-400">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
          <div>إعداد: إدارة السكرتارية التنفيذية</div>
          <div>ختم الأرشيف المركزي (EEC)</div>
          <div>اعتماد: مدير عام السكرتارية</div>
        </div>
      </div>
    </div>
  );
};
