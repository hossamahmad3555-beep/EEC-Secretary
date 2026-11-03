/**
 * @file secretariatSlice.ts
 * @description إدارة الحالة المركزية (Redux Slice) لنظام إدارة السكرتارية.
 * يوفر هذا الملف البيانات الأولية المطابقة تماماً للصورة المرجعية بالإضافة إلى دوال التحديث،
 * الفلترة، إكمال المهام، وإضافة التعاميم والاجتماعات والمراسلات مع تسجيل مقاييس الأداء.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  SecretariatState,
  TabId,
  TransactionType,
  DepartmentName,
  TimePeriod,
  TaskItem,
  MeetingItem,
  CircularDecision,
  CallVisitAppointment,
  CorrespondenceItem,
  ArchivedCorrespondenceItem,
  ArchiveFolder,
  ArchiveFolderId,
  ToastNotificationItem,
  ActivityLogEntry,
  ActivityOperationType,
  CustodyRecord,
} from '../types/secretariat';

export const ARCHIVE_STORAGE_KEY = 'eec_secretariat_archive_vault_v1';

const STORAGE_KEY = 'eec_secretariat_state_v1';

export const initialSecretariatState: SecretariatState = {
  activeTab: 'dashboard',
  theme: 'light',
  selectedYear: '2026',
  selectedTransactionType: 'all',
  selectedDepartment: 'all',
  selectedPeriod: 'this_month',
  searchQuery: '',
  stats: {
    totalTransactions: 1248,
    totalGrowthPercent: 12.4,
    incomingCount: 740,
    outgoingCount: 430,
    circularsCount: 48,
    openTasksCount: 26,
    meetingsCount: 12,
    visitsCount: 18,
    completedTransactions: 1014,
    inProgressTransactions: 162,
    overdueTransactionsCount: 72,
  },
  meetings: [
    {
      id: 'm-1',
      title: 'اجتماع الإدارة العليا',
      time: '10:00 ص',
      date: '2026-11-03',
      department: 'إدارة المشاريع',
      iconType: 'users',
      location: 'قاعة الاجتماعات الرئيسية - الدور الرابع',
    },
    {
      id: 'm-2',
      title: 'مراجعة موقف المشروعات',
      time: '01:00 م',
      date: '2026-11-05',
      department: 'المكتب الفني',
      iconType: 'chart',
      location: 'قاعة العروض الهندسية',
    },
    {
      id: 'm-3',
      title: 'اجتماع متابعة الإدارات',
      time: '03:00 م',
      date: '2026-11-09',
      department: 'الشؤون القانونية',
      iconType: 'group',
      location: 'المقر الرئيسي - القاعة الكبرى',
    },
  ],
  tasks: [
    {
      id: 't-1',
      title: 'متابعة توقيع العقد مع المورد',
      dueDate: '2026-11-03',
      completed: false,
      priority: 'high',
      department: 'المشتريات',
    },
    {
      id: 't-2',
      title: 'تجهيز اجتماع مجلس الإدارة',
      dueDate: '2026-11-04',
      completed: false,
      priority: 'high',
      department: 'إدارة المشاريع',
    },
    {
      id: 't-3',
      title: 'إرسال التعاميم للإدارات',
      dueDate: '2026-11-06',
      completed: false,
      priority: 'medium',
      department: 'الموارد البشرية',
    },
  ],
  overdueTransactions: [
    {
      id: 1,
      subject: 'رد على استفسار',
      department: 'إدارة المشاريع',
      dueDate: '2026-10-29',
      type: 'inquiries',
      status: 'overdue',
    },
    {
      id: 2,
      subject: 'اعتماد طلب شراء',
      department: 'المشتريات',
      dueDate: '2026-10-30',
      type: 'requests',
      status: 'overdue',
    },
    {
      id: 3,
      subject: 'استكمال مستندات تعاقد',
      department: 'الشؤون القانونية',
      dueDate: '2026-11-01',
      type: 'official_letters',
      status: 'overdue',
    },
  ],
  callsAndVisits: [
    {
      id: 'cv-1',
      title: 'اتصال مع المورد الرئيسي',
      time: '11:00 ص',
      type: 'call',
      contactPerson: 'م. طارق المنشاوي',
      date: '2026-11-03',
    },
    {
      id: 'cv-2',
      title: 'زيارة استشاري المشروع',
      time: '12:30 م',
      type: 'visitor',
      contactPerson: 'د. سامح عبد العزيز',
      date: '2026-11-03',
    },
    {
      id: 'cv-3',
      title: 'استقبال وفد جهة حكومية',
      time: '02:00 م',
      type: 'delegation',
      contactPerson: 'هيئة المجتمعات العمرانية',
      date: '2026-11-03',
    },
  ],
  circulars: [
    {
      id: 'c-1',
      subject: 'تعميم تنظيم العمل خلال الفترة القادمة',
      refNumber: 'C-2026-015',
      date: '2026-11-01',
      docType: 'circular',
      department: 'الموارد البشرية',
    },
    {
      id: 'c-2',
      subject: 'قرار تشكيل لجنة المشتريات',
      refNumber: 'C-2026-014',
      date: '2026-10-28',
      docType: 'decision',
      department: 'المشتريات',
    },
    {
      id: 'c-3',
      subject: 'تعميم تحديث بيانات الموظفين',
      refNumber: 'C-2026-013',
      date: '2026-10-25',
      docType: 'circular',
      department: 'الموارد البشرية',
    },
  ],
  correspondences: [
    {
      id: 'corr-1',
      refNumber: 'IN-2026-892',
      subject: 'خطاب اعتماد المخططات التنفيذية لمشروع العاصمة',
      direction: 'incoming',
      type: 'official_letters',
      department: 'إدارة المشاريع',
      date: '2026-11-02',
      status: 'completed',
    },
    {
      id: 'corr-2',
      refNumber: 'OUT-2026-412',
      subject: 'طلب عروض أسعار توريد حديد تسليح وأسمنت',
      direction: 'outgoing',
      type: 'requests',
      department: 'المشتريات',
      date: '2026-11-01',
      status: 'in_progress',
    },
    {
      id: 'corr-3',
      refNumber: 'IN-2026-885',
      subject: 'استفسار فني حول مواصفات العزل الحراري للمبنى الإداري',
      direction: 'incoming',
      type: 'inquiries',
      department: 'المكتب الفني',
      date: '2026-10-30',
      status: 'overdue',
    },
    {
      id: 'corr-4',
      refNumber: 'OUT-2026-409',
      subject: 'مذكرة مراجعة بنود التحكيم والضمان البنكي',
      direction: 'outgoing',
      type: 'official_letters',
      department: 'الشؤون القانونية',
      date: '2026-10-28',
      status: 'completed',
    },
  ],
  archiveFolders: [
    {
      id: 'folder_2026_official',
      name: 'مجلد الخطابات الرسمية 2026',
      description: 'المراسلات والخطابات الرسمية المعتمدة من الإدارة العليا',
    },
    {
      id: 'folder_contracts_tenders',
      name: 'مجلد العقود والمناقصات الهندسية',
      description: 'مراسلات الترسية والمواصفات الفنية ومحاضر التسليم',
    },
    {
      id: 'folder_financial_purchasing',
      name: 'مجلد المشتريات والمستخلصات',
      description: 'طلبات الشراء وعروض الأسعار والمطالبات المالية المؤرشفة',
    },
    {
      id: 'folder_general_archive',
      name: 'مجلد الأرشيف الإداري العام',
      description: 'المراسلات القديمة والاستفسارات المنتهية',
    },
  ],
  archivedCorrespondences: [
    {
      id: 'arch-1',
      refNumber: 'IN-2026-610',
      subject: 'خطاب استلام الموقع الابتدائي لمشروع المحطة المركزية',
      direction: 'incoming',
      type: 'official_letters',
      department: 'إدارة المشاريع',
      date: '2026-08-14',
      status: 'completed',
      archivedAt: '2026-09-01',
      folderId: 'folder_contracts_tenders',
      archiveNotes: 'تمت المطابقة الهندسية والحفظ في أرشيف العقود',
    },
    {
      id: 'arch-2',
      refNumber: 'OUT-2026-295',
      subject: 'اعتماد الدفعة المقدمة لتوريد الكابلات والمحولات الكهربائية',
      direction: 'outgoing',
      type: 'requests',
      department: 'المشتريات',
      date: '2026-07-22',
      status: 'completed',
      archivedAt: '2026-08-05',
      folderId: 'folder_financial_purchasing',
      archiveNotes: 'مكتمل الصرف ومؤرشف للمراجعة المالية',
    },
    {
      id: 'arch-3',
      refNumber: 'IN-2026-540',
      subject: 'موافقة الجهة الإدارية على تعديل الجدول الزمني للتنفيذ',
      direction: 'incoming',
      type: 'official_letters',
      department: 'الشؤون القانونية',
      date: '2026-06-19',
      status: 'completed',
      archivedAt: '2026-07-01',
      folderId: 'folder_2026_official',
      archiveNotes: 'نسخة رسمية مختومة',
    },
  ],
  custodyRecords: [
    {
      id: 'cus-1',
      itemName: 'ختم الشركة الرسمي - مكتب رئيس مجلس الإدارة',
      holderName: 'أ. محمود الشافعي',
      department: 'إدارة المشاريع',
      receivedDate: '2026-01-15',
      status: 'active',
    },
    {
      id: 'cus-2',
      itemName: 'حقيبة مستندات المناقصات المركزية السرية',
      holderName: 'م. سارة الدسوقي',
      department: 'المشتريات',
      receivedDate: '2026-09-10',
      status: 'active',
    },
    {
      id: 'cus-3',
      itemName: 'جهاز عرض ضوئي محمول لقاعة الاجتماعات',
      holderName: 'أ. كريم عادل',
      department: 'المكتب الفني',
      receivedDate: '2026-10-05',
      status: 'returned',
    },
  ],
  monthlyMovement: [
    { month: 'يناير', incoming: 88, outgoing: 48 },
    { month: 'فبراير', incoming: 92, outgoing: 52 },
    { month: 'مارس', incoming: 98, outgoing: 55 },
    { month: 'أبريل', incoming: 102, outgoing: 58 },
    { month: 'مايو', incoming: 110, outgoing: 64 },
    { month: 'يونيو', incoming: 120, outgoing: 72 },
    { month: 'يوليو', incoming: 135, outgoing: 82 },
    { month: 'أغسطس', incoming: 142, outgoing: 90 },
    { month: 'أكتوبر', incoming: 155, outgoing: 102 },
    { month: 'نوفمبر', incoming: 172, outgoing: 114 },
    { month: 'ديسمبر', incoming: 192, outgoing: 128 },
  ],
  weeklyStats: [
    { day: 'السبت', incoming: 28, outgoing: 16, completionRate: 84 },
    { day: 'الأحد', incoming: 42, outgoing: 25, completionRate: 88 },
    { day: 'الاثنين', incoming: 38, outgoing: 29, completionRate: 82 },
    { day: 'الثلاثاء', incoming: 51, outgoing: 34, completionRate: 91 },
    { day: 'الأربعاء', incoming: 46, outgoing: 31, completionRate: 86 },
    { day: 'الخميس', incoming: 35, outgoing: 24, completionRate: 89 },
    { day: 'الجمعة', incoming: 14, outgoing: 9, completionRate: 95 },
  ],
  highlightedCalendarDays: [
    { day: 3, color: 'purple', label: 'اجتماع الإدارة العليا ومتابعة العقود' },
    { day: 5, color: 'amber', label: 'مراجعة موقف المشروعات الهندسية' },
    { day: 9, color: 'purple', label: 'اجتماع متابعة الإدارات الدوري' },
    { day: 18, color: 'amber', label: 'موعد تسليم التقرير الربع سنوي' },
  ],
  activityLog: [
    {
      id: 'act-1',
      operationType: 'update',
      targetCategory: 'task',
      actionTitle: 'تعديل مهمة ومتابعة',
      details: 'تحديث أولوية وموعد مهمة "متابعة توقيع العقد مع المورد" — إدارة المشتريات',
      actorName: 'أ. طارق عبد الرحمن',
      actorRole: 'مدير السكرتارية',
      timestamp: '10:42 ص',
      date: '2026-11-03',
    },
    {
      id: 'act-2',
      operationType: 'delete',
      targetCategory: 'correspondence',
      actionTitle: 'حذف مراسلة مسودة مكررة',
      details: 'تم حذف المسودة [OUT-2026-399] "طلب تسعير أولي لمستلزمات مكتبية" لعدم الحاجة',
      actorName: 'أ. سارة المنشاوي',
      actorRole: 'مسؤول الصادر والوارد',
      timestamp: '09:55 ص',
      date: '2026-11-03',
    },
    {
      id: 'act-3',
      operationType: 'archive',
      targetCategory: 'archive',
      actionTitle: 'أرشفة مراسلة رسمية',
      details: 'نقل المراسلة [IN-2026-610] إلى "مجلد العقود والمناقصات الهندسية"',
      actorName: 'أ. محمود الشافعي',
      actorRole: 'أمين الأرشيف المركزي',
      timestamp: '09:15 ص',
      date: '2026-11-03',
    },
    {
      id: 'act-4',
      operationType: 'create',
      targetCategory: 'circular',
      actionTitle: 'إصدار تعميم إداري',
      details: 'إصدار التعميم رقم [C-2026-015] "تعميم تنظيم العمل خلال الفترة القادمة"',
      actorName: 'أ. طارق عبد الرحمن',
      actorRole: 'مدير السكرتارية',
      timestamp: '08:30 ص',
      date: '2026-11-03',
    },
  ],
  performanceMetrics: [
    {
      id: 'perf-init',
      actionName: 'تهيئة النظام وتحميل البيانات المحلية',
      durationMs: 1.4,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      memoryEstimateMb: 14.2,
    },
  ],
  toastNotifications: [],
  toastMuted: false,
  lastSavedAt: new Date().toLocaleTimeString('ar-EG'),
};

function appendActivityLog(
  state: SecretariatState,
  entry: {
    operationType: ActivityOperationType;
    targetCategory: ActivityLogEntry['targetCategory'];
    actionTitle: string;
    details: string;
  }
) {
  const newEntry: ActivityLogEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    operationType: entry.operationType,
    targetCategory: entry.targetCategory,
    actionTitle: entry.actionTitle,
    details: entry.details,
    actorName: 'أ. طارق عبد الرحمن',
    actorRole: 'مدير السكرتارية',
    timestamp: new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: new Date().toISOString().slice(0, 10),
  };
  state.activityLog = [newEntry, ...(state.activityLog || []).slice(0, 49)];
}

/**
 * استرجاع الحالة المحفوظة في LocalStorage في حال توفرها لضمان استمرارية تجربة المستخدم.
 */
function loadPersistedState(): SecretariatState {
  if (typeof window === 'undefined') return initialSecretariatState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const rawArchiveVault = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw && !rawArchiveVault) return initialSecretariatState;

    const parsed = raw ? (JSON.parse(raw) as Partial<SecretariatState>) : {};
    const parsedVault = rawArchiveVault
      ? (JSON.parse(rawArchiveVault) as {
          archivedCorrespondences?: ArchivedCorrespondenceItem[];
          archiveFolders?: ArchiveFolder[];
        })
      : {};

    return {
      ...initialSecretariatState,
      ...parsed,
      activityLog:
        parsed.activityLog && parsed.activityLog.length > 0
          ? parsed.activityLog
          : initialSecretariatState.activityLog,
      archivedCorrespondences:
        parsedVault.archivedCorrespondences ||
        parsed.archivedCorrespondences ||
        initialSecretariatState.archivedCorrespondences,
      archiveFolders:
        parsedVault.archiveFolders ||
        parsed.archiveFolders ||
        initialSecretariatState.archiveFolders,
      toastNotifications: [],
      stats: {
        ...initialSecretariatState.stats,
        ...(parsed.stats || {}),
      },
    };
  } catch {
    return initialSecretariatState;
  }
}

const secretariatSlice = createSlice({
  name: 'secretariat',
  initialState: loadPersistedState(),
  reducers: {
    setActiveTab(state, action: PayloadAction<TabId>) {
      state.activeTab = action.payload;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme(state, action: PayloadAction<'light' | 'dark'>) {
      state.theme = action.payload;
    },
    setSelectedYear(state, action: PayloadAction<string>) {
      state.selectedYear = action.payload;
    },
    setSelectedTransactionType(state, action: PayloadAction<TransactionType>) {
      state.selectedTransactionType = action.payload;
    },
    setSelectedDepartment(state, action: PayloadAction<DepartmentName>) {
      state.selectedDepartment = action.payload;
    },
    setSelectedPeriod(state, action: PayloadAction<TimePeriod>) {
      state.selectedPeriod = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    pushToast(state, action: PayloadAction<Omit<ToastNotificationItem, 'id' | 'timestamp'>>) {
      if (state.toastMuted) return;
      const newToast: ToastNotificationItem = {
        ...action.payload,
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      state.toastNotifications = [newToast, ...state.toastNotifications.slice(0, 3)];
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toastNotifications = state.toastNotifications.filter(
        (t) => t.id !== action.payload
      );
    },
    clearAllToasts(state) {
      state.toastNotifications = [];
    },
    toggleToastMuted(state) {
      state.toastMuted = !state.toastMuted;
      if (state.toastMuted) {
        state.toastNotifications = [];
      }
    },
    toggleTaskCompleted(state, action: PayloadAction<string>) {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        state.stats.openTasksCount += task.completed ? -1 : 1;
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'task',
          actionTitle: task.completed ? 'إنجاز مهمة متابعة' : 'إعادة فتح مهمة متابعة',
          details: `تم تغيير حالة المهمة "${task.title}" (${task.department}) إلى ${
            task.completed ? 'منجزة' : 'قيد المتابعة'
          }`,
        });
      }
    },
    updateTask(
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        dueDate: string;
        department: string;
        priority?: 'high' | 'medium' | 'low';
      }>
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        const oldTitle = task.title;
        task.title = action.payload.title;
        task.dueDate = action.payload.dueDate;
        task.department = action.payload.department;
        if (action.payload.priority) {
          task.priority = action.payload.priority;
        }
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'task',
          actionTitle: 'تعديل بيانات مهمة',
          details: `تعديل المهمة "${oldTitle}" إلى "${task.title}" (الاستحقاق: ${task.dueDate} · ${task.department})`,
        });
        if (!state.toastMuted) {
          state.toastNotifications = [
            {
              id: `toast-${Date.now()}`,
              title: 'تم تحديث المهمة وتوثيق النشاط',
              message: `تم حفظ تعديلات المهمة "${task.title}" في سجل النشاطات الرقابي.`,
              urgency: 'success',
              targetTab: 'tasks',
              timestamp: new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
            ...state.toastNotifications.slice(0, 3),
          ];
        }
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload);
      if (idx !== -1) {
        const removed = state.tasks[idx];
        state.tasks.splice(idx, 1);
        if (!removed.completed) {
          state.stats.openTasksCount = Math.max(0, state.stats.openTasksCount - 1);
        }
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: 'task',
          actionTitle: 'حذف مهمة من السجل',
          details: `تم حذف المهمة "${removed.title}" (${removed.department}) بتاريخ استحقاق ${removed.dueDate}`,
        });
      }
    },
    addTask(state, action: PayloadAction<Omit<TaskItem, 'id' | 'completed'>>) {
      const newTask: TaskItem = {
        ...action.payload,
        id: `t-${Date.now()}`,
        completed: false,
      };
      state.tasks.unshift(newTask);
      state.stats.openTasksCount += 1;
      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'task',
        actionTitle: 'إضافة مهمة جديدة',
        details: `إدراج المهمة "${newTask.title}" لـ ${newTask.department} (استحقاق: ${newTask.dueDate})`,
      });
      if (!state.toastMuted) {
        state.toastNotifications = [
          {
            id: `toast-${Date.now()}`,
            title: 'تنبيه موعد تسليم مهمة هامة',
            message: `تمت جدولة المهمة "${newTask.title}" (${newTask.department}) بتاريخ استحقاق ${newTask.dueDate}.`,
            urgency: 'upcoming_task',
            targetTab: 'tasks',
            timestamp: new Date().toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            referenceId: newTask.id,
          },
          ...state.toastNotifications.slice(0, 3),
        ];
      }
    },
    addMeeting(state, action: PayloadAction<Omit<MeetingItem, 'id'>>) {
      const newMeeting: MeetingItem = {
        ...action.payload,
        id: `m-${Date.now()}`,
      };
      state.meetings.unshift(newMeeting);
      state.stats.meetingsCount += 1;
      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'meeting',
        actionTitle: 'جدولة اجتماع جديد',
        details: `جدولة "${newMeeting.title}" يوم ${newMeeting.date} الساعة ${newMeeting.time}`,
      });
    },
    addCircular(state, action: PayloadAction<Omit<CircularDecision, 'id'>>) {
      const newCircular: CircularDecision = {
        ...action.payload,
        id: `c-${Date.now()}`,
      };
      state.circulars.unshift(newCircular);
      state.stats.circularsCount += 1;
      state.stats.totalTransactions += 1;
      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'circular',
        actionTitle: 'إصدار تعميم / قرار إداري',
        details: `إصدار [${newCircular.refNumber}] "${newCircular.subject}" — ${newCircular.department}`,
      });
      if (!state.toastMuted) {
        state.toastNotifications = [
          {
            id: `toast-${Date.now()}`,
            title: 'إصدار تعميم / قرار إداري عاجل',
            message: `تم إصدار "${newCircular.subject}" برقم مرجعي ${newCircular.refNumber} لـ ${newCircular.department}.`,
            urgency: 'urgent_correspondence',
            targetTab: 'circulars',
            timestamp: new Date().toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            referenceId: newCircular.id,
          },
          ...state.toastNotifications.slice(0, 3),
        ];
      }
    },
    addCallOrVisit(state, action: PayloadAction<Omit<CallVisitAppointment, 'id'>>) {
      const newEntry: CallVisitAppointment = {
        ...action.payload,
        id: `cv-${Date.now()}`,
      };
      state.callsAndVisits.unshift(newEntry);
      if (action.payload.type !== 'call') {
        state.stats.visitsCount += 1;
      }
    },
    addCorrespondence(state, action: PayloadAction<Omit<CorrespondenceItem, 'id'>>) {
      const newCorr: CorrespondenceItem = {
        ...action.payload,
        id: `corr-${Date.now()}`,
      };
      state.correspondences.unshift(newCorr);
      state.stats.totalTransactions += 1;
      if (action.payload.direction === 'incoming') {
        state.stats.incomingCount += 1;
        if (state.weeklyStats && state.weeklyStats[3]) {
          state.weeklyStats[3].incoming += 1;
        }
      } else {
        state.stats.outgoingCount += 1;
        if (state.weeklyStats && state.weeklyStats[3]) {
          state.weeklyStats[3].outgoing += 1;
        }
      }
      if (action.payload.status === 'completed') {
        state.stats.completedTransactions += 1;
      } else if (action.payload.status === 'in_progress') {
        state.stats.inProgressTransactions += 1;
      }

      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'correspondence',
        actionTitle: 'تسجيل مراسلة جديدة',
        details: `إضافة مراسلة ${
          newCorr.direction === 'incoming' ? 'واردة' : 'صادرة'
        } [${newCorr.refNumber}] "${newCorr.subject}"`,
      });

      if (!state.toastMuted) {
        state.toastNotifications = [
          {
            id: `toast-${Date.now()}`,
            title: 'مراسلة جديدة تتطلب إجراءً عاجلاً',
            message: `[${newCorr.refNumber}] ${newCorr.subject} — موجهة إلى ${newCorr.department}.`,
            urgency: 'urgent_correspondence',
            targetTab: 'correspondence',
            timestamp: new Date().toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            referenceId: newCorr.id,
          },
          ...state.toastNotifications.slice(0, 3),
        ];
      }
    },
    deleteCorrespondence(state, action: PayloadAction<string>) {
      const idx = state.correspondences.findIndex((c) => c.id === action.payload);
      if (idx !== -1) {
        const removed = state.correspondences[idx];
        state.correspondences.splice(idx, 1);
        state.stats.totalTransactions = Math.max(0, state.stats.totalTransactions - 1);
        if (removed.direction === 'incoming') {
          state.stats.incomingCount = Math.max(0, state.stats.incomingCount - 1);
        } else {
          state.stats.outgoingCount = Math.max(0, state.stats.outgoingCount - 1);
        }
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: 'correspondence',
          actionTitle: 'حذف مراسلة من السجل',
          details: `تم حذف المراسلة [${removed.refNumber}] "${removed.subject}" (${removed.department})`,
        });
        if (!state.toastMuted) {
          state.toastNotifications = [
            {
              id: `toast-${Date.now()}`,
              title: 'تم حذف المراسلة وتوثيق العملية',
              message: `تم حذف المراسلة [${removed.refNumber}] وتسجيل العملية في سجل النشاطات الرقابي.`,
              urgency: 'overdue_alert',
              targetTab: 'correspondence',
              timestamp: new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
            ...state.toastNotifications.slice(0, 3),
          ];
        }
      }
    },
    archiveCorrespondence(
      state,
      action: PayloadAction<{
        correspondenceId: string;
        folderId: Exclude<ArchiveFolderId, 'all'>;
        notes?: string;
      }>
    ) {
      const idx = state.correspondences.findIndex(
        (c) => c.id === action.payload.correspondenceId
      );
      if (idx !== -1) {
        const item = state.correspondences[idx];
        state.correspondences.splice(idx, 1);
        const archivedEntry: ArchivedCorrespondenceItem = {
          ...item,
          archivedAt: new Date().toISOString().slice(0, 10),
          folderId: action.payload.folderId,
          archiveNotes: action.payload.notes || 'تمت الأرشفة في المجلد المخصص',
        };
        state.archivedCorrespondences.unshift(archivedEntry);
        const folderObj = state.archiveFolders.find((f) => f.id === action.payload.folderId);
        appendActivityLog(state, {
          operationType: 'archive',
          targetCategory: 'archive',
          actionTitle: 'أرشفة مراسلة في مجلد خاص',
          details: `نقل المراسلة [${item.refNumber}] "${item.subject}" إلى "${
            folderObj?.name || 'مجلد الأرشيف'
          }"`,
        });
        if (!state.toastMuted) {
          state.toastNotifications = [
            {
              id: `toast-${Date.now()}`,
              title: 'تمت أرشفة المراسلة وحفظها محلياً',
              message: `تم نقل المراسلة [${item.refNumber}] إلى "${
                folderObj?.name || 'مجلد الأرشيف'
              }" بنجاح.`,
              urgency: 'success',
              targetTab: 'archive',
              timestamp: new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
            ...state.toastNotifications.slice(0, 3),
          ];
        }
      }
    },
    restoreArchivedCorrespondence(state, action: PayloadAction<string>) {
      const idx = state.archivedCorrespondences.findIndex((a) => a.id === action.payload);
      if (idx !== -1) {
        const archivedItem = state.archivedCorrespondences[idx];
        state.archivedCorrespondences.splice(idx, 1);
        const { archivedAt, folderId, archiveNotes, ...restoredCorrespondence } = archivedItem;
        state.correspondences.unshift(restoredCorrespondence);
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'archive',
          actionTitle: 'استرجاع مراسلة من الأرشيف',
          details: `استعادة المراسلة [${restoredCorrespondence.refNumber}] "${restoredCorrespondence.subject}" إلى السجل النشط`,
        });
        if (!state.toastMuted) {
          state.toastNotifications = [
            {
              id: `toast-${Date.now()}`,
              title: 'تم استرجاع المراسلة من الأرشيف',
              message: `عادت المراسلة [${restoredCorrespondence.refNumber}] "${restoredCorrespondence.subject}" إلى سجل المراسلات النشطة.`,
              urgency: 'success',
              targetTab: 'correspondence',
              timestamp: new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
            ...state.toastNotifications.slice(0, 3),
          ];
        }
      }
    },
    archiveCompletedCorrespondences(
      state,
      action: PayloadAction<Exclude<ArchiveFolderId, 'all'>>
    ) {
      const completedItems = state.correspondences.filter((c) => c.status === 'completed');
      if (completedItems.length === 0) return;
      state.correspondences = state.correspondences.filter((c) => c.status !== 'completed');
      const today = new Date().toISOString().slice(0, 10);
      const newlyArchived: ArchivedCorrespondenceItem[] = completedItems.map((item) => ({
        ...item,
        archivedAt: today,
        folderId: action.payload,
        archiveNotes: 'أرشفة مجمعة للمراسلات المكتملة',
      }));
      state.archivedCorrespondences = [...newlyArchived, ...state.archivedCorrespondences];
      appendActivityLog(state, {
        operationType: 'archive',
        targetCategory: 'archive',
        actionTitle: 'أرشفة مجمعة للمراسلات المكتملة',
        details: `تم نقل ${newlyArchived.length} مراسلات مكتملة إلى خزينة الأرشيف الدائم`,
      });
      if (!state.toastMuted) {
        state.toastNotifications = [
          {
            id: `toast-${Date.now()}`,
            title: 'أرشفة مجمعة للمراسلات القديمة/المكتملة',
            message: `تم نقل ${newlyArchived.length} مراسلات مكتملة إلى مجلد الأرشيف وحفظها في LocalStorage.`,
            urgency: 'success',
            targetTab: 'archive',
            timestamp: new Date().toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...state.toastNotifications.slice(0, 3),
        ];
      }
    },
    createArchiveFolder(
      state,
      action: PayloadAction<{ name: string; description: string }>
    ) {
      const newFolderId = `folder_custom_${Date.now()}` as Exclude<ArchiveFolderId, 'all'>;
      state.archiveFolders.push({
        id: newFolderId,
        name: action.payload.name,
        description: action.payload.description,
      });
      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'archive',
        actionTitle: 'إنشاء مجلد أرشيف جديد',
        details: `تم إنشاء المجلد "${action.payload.name}" في خزينة الأرشيف`,
      });
    },
    resolveOverdueTransaction(state, action: PayloadAction<number>) {
      const index = state.overdueTransactions.findIndex((item) => item.id === action.payload);
      if (index !== -1) {
        const resolved = state.overdueTransactions[index];
        state.overdueTransactions.splice(index, 1);
        state.stats.overdueTransactionsCount = Math.max(0, state.stats.overdueTransactionsCount - 1);
        state.stats.completedTransactions += 1;
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'correspondence',
          actionTitle: 'اعتماد وإنجاز معاملة متأخرة',
          details: `إنجاز المعاملة المتأخرة "${resolved.subject}" (${resolved.department})`,
        });
        if (!state.toastMuted) {
          state.toastNotifications = [
            {
              id: `toast-${Date.now()}`,
              title: 'تم اعتماد وإنجاز معاملة متأخرة',
              message: `تم إنهاء إجراء "${resolved.subject}" الخاصة بـ ${resolved.department} بنجاح.`,
              urgency: 'success',
              targetTab: 'archive',
              timestamp: new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
            ...state.toastNotifications.slice(0, 3),
          ];
        }
      }
    },
    deleteMeeting(state, action: PayloadAction<string>) {
      const idx = state.meetings.findIndex((m) => m.id === action.payload);
      if (idx !== -1) {
        const removed = state.meetings[idx];
        state.meetings.splice(idx, 1);
        state.stats.meetingsCount = Math.max(0, state.stats.meetingsCount - 1);
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: 'meeting',
          actionTitle: 'إلغاء اجتماع مجدول',
          details: `تم إلغاء "${removed.title}" (${removed.department}) المقرر بتاريخ ${removed.date}`,
        });
      }
    },
    deleteCircular(state, action: PayloadAction<string>) {
      const idx = state.circulars.findIndex((c) => c.id === action.payload);
      if (idx !== -1) {
        const removed = state.circulars[idx];
        state.circulars.splice(idx, 1);
        state.stats.circularsCount = Math.max(0, state.stats.circularsCount - 1);
        state.stats.totalTransactions = Math.max(0, state.stats.totalTransactions - 1);
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: 'circular',
          actionTitle: 'حذف تعميم / قرار إداري',
          details: `تم حذف [${removed.refNumber}] "${removed.subject}" (${removed.department})`,
        });
      }
    },
    deleteCallOrVisit(state, action: PayloadAction<string>) {
      const idx = state.callsAndVisits.findIndex((cv) => cv.id === action.payload);
      if (idx !== -1) {
        const removed = state.callsAndVisits[idx];
        state.callsAndVisits.splice(idx, 1);
        if (removed.type !== 'call') {
          state.stats.visitsCount = Math.max(0, state.stats.visitsCount - 1);
        }
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: removed.type === 'call' ? 'call' : 'visitor',
          actionTitle: removed.type === 'call' ? 'حذف موعد اتصال' : 'حذف موعد زيارة',
          details: `تم حذف "${removed.title}" الخاصة بـ ${removed.contactPerson}`,
        });
      }
    },
    addCustodyRecord(state, action: PayloadAction<Omit<CustodyRecord, 'id'>>) {
      const newCustody: CustodyRecord = {
        ...action.payload,
        id: `cus-${Date.now()}`,
      };
      state.custodyRecords.unshift(newCustody);
      appendActivityLog(state, {
        operationType: 'create',
        targetCategory: 'custody',
        actionTitle: 'تسجيل عهدة رسمية جديدة',
        details: `تسجيل "${newCustody.itemName}" للموظف/المسؤول ${newCustody.holderName} (${newCustody.department})`,
      });
      if (!state.toastMuted) {
        state.toastNotifications = [
          {
            id: `toast-${Date.now()}`,
            title: 'تم تسجيل العهدة الرسمية بنجاح',
            message: `تم إدراج "${newCustody.itemName}" في دفتر العهدة الرسمي.`,
            urgency: 'success',
            targetTab: 'custody',
            timestamp: new Date().toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...state.toastNotifications.slice(0, 3),
        ];
      }
    },
    toggleCustodyStatus(state, action: PayloadAction<string>) {
      const record = state.custodyRecords.find((c) => c.id === action.payload);
      if (record) {
        record.status = record.status === 'active' ? 'returned' : 'active';
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'custody',
          actionTitle:
            record.status === 'returned' ? 'إعادة واستلام عهدة' : 'إعادة تفعيل عهدة رسمية',
          details: `تم تغيير حالة "${record.itemName}" إلى: ${
            record.status === 'returned' ? 'تمت إعادتها للأرشيف' : 'عهدة نشطة ومستلمة'
          }`,
        });
      }
    },
    deleteCustodyRecord(state, action: PayloadAction<string>) {
      const idx = state.custodyRecords.findIndex((c) => c.id === action.payload);
      if (idx !== -1) {
        const removed = state.custodyRecords[idx];
        state.custodyRecords.splice(idx, 1);
        appendActivityLog(state, {
          operationType: 'delete',
          targetCategory: 'custody',
          actionTitle: 'شطب عهدة من السجل',
          details: `تم شطب "${removed.itemName}" من دفتر العهدة`,
        });
      }
    },
    updateCorrespondenceStatus(
      state,
      action: PayloadAction<{ id: string; status: 'completed' | 'in_progress' | 'overdue' }>
    ) {
      const item = state.correspondences.find((c) => c.id === action.payload.id);
      if (item) {
        const oldStatus = item.status;
        item.status = action.payload.status;
        if (oldStatus === 'completed' && action.payload.status !== 'completed') {
          state.stats.completedTransactions = Math.max(0, state.stats.completedTransactions - 1);
        } else if (oldStatus !== 'completed' && action.payload.status === 'completed') {
          state.stats.completedTransactions += 1;
        }
        if (action.payload.status === 'in_progress') {
          state.stats.inProgressTransactions += 1;
        } else if (oldStatus === 'in_progress') {
          state.stats.inProgressTransactions = Math.max(0, state.stats.inProgressTransactions - 1);
        }
        appendActivityLog(state, {
          operationType: 'update',
          targetCategory: 'correspondence',
          actionTitle: 'تحديث حالة المعاملة',
          details: `تغيير حالة [${item.refNumber}] إلى: ${
            item.status === 'completed'
              ? 'مكتملة'
              : item.status === 'in_progress'
              ? 'قيد التنفيذ'
              : 'متأخرة'
          }`,
        });
      }
    },
    importStateBackup(state, action: PayloadAction<SecretariatState>) {
      return {
        ...action.payload,
        theme: state.theme,
      };
    },
    clearActivityLog(state) {
      state.activityLog = [];
    },
    recordPerformanceMetric(
      state,
      action: PayloadAction<{ actionName: string; durationMs: number }>
    ) {
      const metric = {
        id: `perf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        actionName: action.payload.actionName,
        durationMs: Number(action.payload.durationMs.toFixed(2)),
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        memoryEstimateMb: Number((14 + state.correspondences.length * 0.15).toFixed(1)),
      };
      state.performanceMetrics = [metric, ...state.performanceMetrics.slice(0, 14)];
      state.lastSavedAt = new Date().toLocaleTimeString('ar-EG');
    },
    resetToDefaultData() {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(ARCHIVE_STORAGE_KEY);
      }
      return initialSecretariatState;
    },
  },
});

export const {
  setActiveTab,
  toggleTheme,
  setTheme,
  setSelectedYear,
  setSelectedTransactionType,
  setSelectedDepartment,
  setSelectedPeriod,
  setSearchQuery,
  pushToast,
  dismissToast,
  clearAllToasts,
  toggleToastMuted,
  toggleTaskCompleted,
  updateTask,
  deleteTask,
  addTask,
  addMeeting,
  deleteMeeting,
  addCircular,
  deleteCircular,
  addCallOrVisit,
  deleteCallOrVisit,
  addCustodyRecord,
  toggleCustodyStatus,
  deleteCustodyRecord,
  updateCorrespondenceStatus,
  importStateBackup,
  addCorrespondence,
  deleteCorrespondence,
  archiveCorrespondence,
  restoreArchivedCorrespondence,
  archiveCompletedCorrespondences,
  createArchiveFolder,
  resolveOverdueTransaction,
  clearActivityLog,
  recordPerformanceMetric,
  resetToDefaultData,
} = secretariatSlice.actions;

export const STORAGE_KEY_NAME = STORAGE_KEY;
export default secretariatSlice.reducer;
