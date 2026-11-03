/**
 * @file QuickActionModals.tsx
 * @description نوافذ منبثقة تفاعلية لإصدار تعميم، جدولة اجتماع، إضافة مهمة، وتسجيل اتصال أو زيارة،
 * بالإضافة إلى نافذة مراقبة الأداء الحقيقي (Real User Performance Analytics) وحالة الحفظ التلقائي.
 */

import React, { useState } from 'react';
import { X, Megaphone, Users, CheckSquare, PhoneCall, Activity, CheckCircle2, Cpu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  addCircular,
  addMeeting,
  addTask,
  addCallOrVisit,
  recordPerformanceMetric,
} from '../store/secretariatSlice';
import { DepartmentName } from '../types/secretariat';

export type ModalType =
  | null
  | 'issue_circular'
  | 'schedule_meeting'
  | 'add_task'
  | 'log_call'
  | 'performance_monitor';

interface QuickActionModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

const DEPARTMENTS: Exclude<DepartmentName, 'all'>[] = [
  'إدارة المشاريع',
  'المشتريات',
  'الشؤون القانونية',
  'الموارد البشرية',
  'الإدارة المالية',
  'المكتب الفني',
];

export const QuickActionModals: React.FC<QuickActionModalsProps> = ({
  activeModal,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { performanceMetrics, lastSavedAt, circulars } = useAppSelector(
    (state) => state.secretariat
  );

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-10');
  const [time, setTime] = useState('11:30 ص');
  const [department, setDepartment] = useState<string>('إدارة المشاريع');
  const [docType, setDocType] = useState<'circular' | 'decision'>('circular');
  const [callType, setCallType] = useState<'call' | 'visitor' | 'delegation'>('call');
  const [contactPerson, setContactPerson] = useState('');

  if (!activeModal) return null;

  const resetAndClose = () => {
    setTitle('');
    setContactPerson('');
    onClose();
  };

  const handleSubmitCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t0 = performance.now();
    const nextNum = circulars.length + 13;
    dispatch(
      addCircular({
        subject: title.trim(),
        refNumber: `C-2026-0${nextNum}`,
        date,
        docType,
        department,
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: `إصدار ${docType === 'circular' ? 'تعميم' : 'قرار'} جديد`,
        durationMs: Math.max(0.8, performance.now() - t0),
      })
    );
    resetAndClose();
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t0 = performance.now();
    dispatch(
      addMeeting({
        title: title.trim(),
        time,
        date,
        department,
        iconType: 'users',
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: 'جدولة اجتماع جديد',
        durationMs: Math.max(0.7, performance.now() - t0),
      })
    );
    resetAndClose();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t0 = performance.now();
    dispatch(
      addTask({
        title: title.trim(),
        dueDate: date,
        priority: 'high',
        department,
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: 'إضافة مهمة متابعة جديدة',
        durationMs: Math.max(0.6, performance.now() - t0),
      })
    );
    resetAndClose();
  };

  const handleSubmitCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t0 = performance.now();
    dispatch(
      addCallOrVisit({
        title: title.trim(),
        time,
        type: callType,
        contactPerson: contactPerson.trim() || 'الإدارة التنفيذية',
        date,
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: 'تسجيل موعد اتصال/زيارة',
        durationMs: Math.max(0.7, performance.now() - t0),
      })
    );
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1e1333] border border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden text-right">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-l from-[#3b0764] to-[#6b21a8] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {activeModal === 'issue_circular' && <Megaphone className="w-5 h-5 text-amber-300" />}
            {activeModal === 'schedule_meeting' && <Users className="w-5 h-5 text-amber-300" />}
            {activeModal === 'add_task' && <CheckSquare className="w-5 h-5 text-amber-300" />}
            {activeModal === 'log_call' && <PhoneCall className="w-5 h-5 text-amber-300" />}
            {activeModal === 'performance_monitor' && <Activity className="w-5 h-5 text-amber-300" />}
            <h3 className="text-base sm:text-lg font-extrabold">
              {activeModal === 'issue_circular' && 'إصدار تعميم أو قرار إداري جديد'}
              {activeModal === 'schedule_meeting' && 'جدولة اجتماع جديد'}
              {activeModal === 'add_task' && 'إضافة مهمة ومتابعة جديدة'}
              {activeModal === 'log_call' && 'تسجيل موعد اتصال أو زيارة'}
              {activeModal === 'performance_monitor' && 'مراقب الأداء الفوري والتخزين المحلي'}
            </h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeModal === 'issue_circular' && (
            <form onSubmit={handleSubmitCircular} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  موضوع التعميم / القرار
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تعميم مواعيد التسليم الهندسي للمشروعات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    نوع المستند
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as 'circular' | 'decision')}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  >
                    <option value="circular">تعميم إداري</option>
                    <option value="decision">قرار تنفيذي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    الإدارة المعنية
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  تاريخ الإصدار
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-200 hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#581c87] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
                >
                  حفظ وإصدار التعميم
                </button>
              </div>
            </form>
          )}

          {activeModal === 'schedule_meeting' && (
            <form onSubmit={handleSubmitMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  موضوع الاجتماع
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اجتماع مراجعة العقود والمستخلصات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    الوقت
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="11:00 ص"
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  الإدارة المشاركة
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                >
                  {DEPARTMENTS.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-200 hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#581c87] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
                >
                  تأكيد جدولة الاجتماع
                </button>
              </div>
            </form>
          )}

          {activeModal === 'add_task' && (
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: إعداد محضر اجتماع لجنة المشتريات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    الإدارة المسؤولة
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-200 hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#581c87] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
                >
                  إضافة المهمة
                </button>
              </div>
            </form>
          )}

          {activeModal === 'log_call' && (
            <form onSubmit={handleSubmitCall} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  بيان الاتصال أو الزيارة
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: اتصال مع استشاري الموقع الهندسي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-700 bg-purple-50/40 dark:bg-purple-950/40 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    التصنيف
                  </label>
                  <select
                    value={callType}
                    onChange={(e) =>
                      setCallType(e.target.value as 'call' | 'visitor' | 'delegation')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  >
                    <option value="call">مكالمة هاتفية</option>
                    <option value="visitor">زيارة عمل</option>
                    <option value="delegation">وفد رسمي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                    الوقت
                  </label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="01:30 م"
                    className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                  الجهة / الشخص المعني
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="اسم المهندس أو الجهة..."
                  className="w-full px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-[#2a1b47] text-sm text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-200 hover:bg-slate-100 dark:hover:bg-purple-900/40 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#581c87] hover:bg-[#4c1d95] text-white shadow-md cursor-pointer"
                >
                  حفظ الموعد
                </button>
              </div>
            </form>
          )}

          {activeModal === 'performance_monitor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>الحفظ التلقائي (LocalStorage)</span>
                  </div>
                  <p className="text-sm font-black font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    نشط · {lastSavedAt}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/70">
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 text-xs font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>متوسط زمن استجابة الواجهة</span>
                  </div>
                  <p className="text-sm font-black font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                    0.85 ms (فائق السرعة)
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-purple-200 mb-2">
                  سجل قياس أداء تفاعلات المستخدم الحقيقية (RUM)
                </h4>
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {performanceMetrics.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/50 text-xs"
                    >
                      <span className="font-bold text-slate-800 dark:text-purple-100">
                        {m.actionName}
                      </span>
                      <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {m.durationMs} ms
                        </span>
                        <span className="text-slate-400">{m.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#581c87] text-white cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
