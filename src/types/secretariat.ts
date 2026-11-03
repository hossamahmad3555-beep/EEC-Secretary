/**
 * @file secretariat.ts
 * @description تعريف الأنواع والواجهات الأساسية لنظام إدارة السكرتارية في الشركة المصرية الهندسية للمقاولات (EEC).
 * يتضمن هذا الملف نماذج البيانات الخاصة بالمراسلات، التعاميم، المهام، الاجتماعات، الاتصالات، الزيارات، ومؤشرات الأداء.
 */

export type TabId =
  | 'dashboard'
  | 'correspondence'
  | 'circulars'
  | 'tasks'
  | 'meetings'
  | 'calls'
  | 'custody'
  | 'visitors'
  | 'archive'
  | 'reports'
  | 'settings';

export type TransactionType = 'all' | 'official_letters' | 'requests' | 'inquiries' | 'other';
export type DepartmentName = 'all' | 'إدارة المشاريع' | 'المشتريات' | 'الشؤون القانونية' | 'الموارد البشرية' | 'الإدارة المالية' | 'المكتب الفني';
export type TimePeriod = 'this_month' | 'last_month' | 'this_quarter' | 'this_year';

export interface MeetingItem {
  id: string;
  title: string;
  time: string;
  date: string;
  department: string;
  iconType: 'users' | 'chart' | 'group';
  location?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  department: string;
}

export interface OverdueTransaction {
  id: number;
  subject: string;
  department: string;
  dueDate: string;
  type: TransactionType;
  status: 'overdue' | 'in_progress' | 'completed';
}

export interface CallVisitAppointment {
  id: string;
  title: string;
  time: string;
  type: 'call' | 'visitor' | 'delegation';
  contactPerson: string;
  date: string;
}

export interface CircularDecision {
  id: string;
  subject: string;
  refNumber: string;
  date: string;
  docType: 'circular' | 'decision';
  department: string;
}

export interface CorrespondenceItem {
  id: string;
  refNumber: string;
  subject: string;
  direction: 'incoming' | 'outgoing';
  type: Exclude<TransactionType, 'all'>;
  department: string;
  date: string;
  status: 'completed' | 'in_progress' | 'overdue';
}

export type ArchiveFolderId =
  | 'all'
  | 'folder_2026_official'
  | 'folder_contracts_tenders'
  | 'folder_financial_purchasing'
  | 'folder_general_archive';

export interface ArchiveFolder {
  id: Exclude<ArchiveFolderId, 'all'>;
  name: string;
  description: string;
}

export interface ArchivedCorrespondenceItem extends CorrespondenceItem {
  archivedAt: string;
  folderId: Exclude<ArchiveFolderId, 'all'>;
  archiveNotes?: string;
}

export interface CustodyRecord {
  id: string;
  itemName: string;
  holderName: string;
  department: string;
  receivedDate: string;
  status: 'active' | 'returned';
}

export interface MonthlyMovement {
  month: string;
  incoming: number;
  outgoing: number;
}

export interface WeeklyStatItem {
  day: string;
  incoming: number;
  outgoing: number;
  completionRate: number;
}

export interface PerformanceMetric {
  id: string;
  actionName: string;
  durationMs: number;
  timestamp: string;
  memoryEstimateMb: number;
}

export type ToastUrgency = 'urgent_correspondence' | 'upcoming_task' | 'overdue_alert' | 'success';

export interface ToastNotificationItem {
  id: string;
  title: string;
  message: string;
  urgency: ToastUrgency;
  targetTab: TabId;
  timestamp: string;
  referenceId?: string;
}

export type ActivityOperationType = 'delete' | 'update' | 'create' | 'archive';

export interface ActivityLogEntry {
  id: string;
  operationType: ActivityOperationType;
  targetCategory:
    | 'correspondence'
    | 'task'
    | 'circular'
    | 'meeting'
    | 'archive'
    | 'custody'
    | 'visitor'
    | 'call';
  actionTitle: string;
  details: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  date: string;
}

export interface SecretariatState {
  activeTab: TabId;
  theme: 'light' | 'dark';
  selectedYear: string;
  selectedTransactionType: TransactionType;
  selectedDepartment: DepartmentName;
  selectedPeriod: TimePeriod;
  searchQuery: string;
  stats: {
    totalTransactions: number;
    totalGrowthPercent: number;
    incomingCount: number;
    outgoingCount: number;
    circularsCount: number;
    openTasksCount: number;
    meetingsCount: number;
    visitsCount: number;
    completedTransactions: number;
    inProgressTransactions: number;
    overdueTransactionsCount: number;
  };
  meetings: MeetingItem[];
  tasks: TaskItem[];
  overdueTransactions: OverdueTransaction[];
  callsAndVisits: CallVisitAppointment[];
  circulars: CircularDecision[];
  correspondences: CorrespondenceItem[];
  archivedCorrespondences: ArchivedCorrespondenceItem[];
  archiveFolders: ArchiveFolder[];
  custodyRecords: CustodyRecord[];
  monthlyMovement: MonthlyMovement[];
  weeklyStats: WeeklyStatItem[];
  highlightedCalendarDays: {
    day: number;
    color: 'purple' | 'amber';
    label: string;
  }[];
  activityLog: ActivityLogEntry[];
  performanceMetrics: PerformanceMetric[];
  toastNotifications: ToastNotificationItem[];
  toastMuted: boolean;
  lastSavedAt: string;
}
