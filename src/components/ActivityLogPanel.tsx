/**
 * @file ActivityLogPanel.tsx
 * @description مكون "سجل النشاطات الرقابي" (Activity Log) في لوحة التحكم الرئيسية.
 * يقوم بتسجيل وعرض العمليات الهامة التي يقوم بها المستخدمون في النظام (مثل حذف مراسلة، تعديل مهمة،
 * إضافة معاملة، أو أرشفة مستند) لتعزيز الرقابة والحوكمة الإدارية مع إمكانية التصفية حسب نوع العملية.
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Trash2,
  Edit3,
  PlusCircle,
  Archive,
  Clock,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setActiveTab } from '../store/secretariatSlice';
import { ActivityLogEntry, ActivityOperationType, TabId } from '../types/secretariat';

type FilterType = 'all' | ActivityOperationType;

export const ActivityLogPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activityLog } = useAppSelector((state) => state.secretariat);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const safeLogs = useMemo(() => activityLog || [], [activityLog]);

  const filteredLogs = useMemo(() => {
    if (selectedFilter === 'all') return safeLogs;
    return safeLogs.filter((entry) => entry.operationType === selectedFilter);
  }, [safeLogs, selectedFilter]);

  const counts = useMemo(() => {
    return {
      all: safeLogs.length,
      update: safeLogs.filter((e) => e.operationType === 'update').length,
      delete: safeLogs.filter((e) => e.operationType === 'delete').length,
      create: safeLogs.filter((e) => e.operationType === 'create').length,
      archive: safeLogs.filter((e) => e.operationType === 'archive').length,
    };
  }, [safeLogs]);

  const getOperationStyle = (opType: ActivityOperationType) => {
    switch (opType) {
      case 'delete':
        return {
          iconBg: 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400',
          labelColor: 'text-rose-700 dark:text-rose-400',
          labelText: 'عملية حذف',
          Icon: Trash2,
        };
      case 'update':
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400',
          labelColor: 'text-amber-700 dark:text-amber-400',
          labelText: 'تعديل / تحديث',
          Icon: Edit3,
        };
      case 'archive':
        return {
          iconBg: 'bg-purple-100 dark:bg-purple-900/70 text-[#6b21a8] dark:text-purple-300',
          labelColor: 'text-[#6b21a8] dark:text-purple-300',
          labelText: 'أرشفة مستند',
          Icon: Archive,
        };
      case 'create':
      default:
        return {
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400',
          labelColor: 'text-emerald-700 dark:text-emerald-400',
          labelText: 'إضافة / إصدار',
          Icon: PlusCircle,
        };
    }
  };

  const getCategoryTab = (
    cat: ActivityLogEntry['targetCategory']
  ): TabId => {
    switch (cat) {
      case 'correspondence':
        return 'correspondence';
      case 'task':
        return 'tasks';
      case 'circular':
        return 'circulars';
      case 'meeting':
        return 'meetings';
      case 'archive':
        return 'archive';
      case 'custody':
        return 'custody';
      case 'visitor':
        return 'visitors';
      case 'call':
        return 'calls';
      default:
        return 'dashboard';
    }
  };

  return (
    <section
      aria-label="سجل النشاطات والرقابة الإدارية"
      className="no-print rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 sm:p-4"
    >
      {/* Top Bar: Title + Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              سجل النشاطات الرقابي (Activity Log) · تتبع العمليات الحساسة
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-purple-300">
              توثيق فوري لعمليات حذف المراسلات، تعديل المهام، الأرشفة، والإصدارات الإدارية لتعزيز الرقابة
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-purple-50/90 dark:bg-purple-950/60 p-1 rounded-xl border border-purple-200/60 dark:border-purple-800/60 text-xs">
          {(
            [
              { id: 'all', label: `الكل (${counts.all})` },
              { id: 'update', label: `التعديلات (${counts.update})` },
              { id: 'delete', label: `الحذف (${counts.delete})` },
              { id: 'archive', label: `الأرشفة (${counts.archive})` },
              { id: 'create', label: `الإضافة (${counts.create})` },
            ] as { id: FilterType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-extrabold transition cursor-pointer whitespace-nowrap ${
                selectedFilter === tab.id
                  ? 'bg-[#581c87] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Feed Grid */}
      {filteredLogs.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-dashed border-purple-200 dark:border-purple-800 text-xs font-bold text-slate-500 dark:text-purple-300">
          لا توجد سجلات نشاط مطابقة لهذا التصنيف حالياً
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {filteredLogs.slice(0, 8).map((entry) => {
            const style = getOperationStyle(entry.operationType);
            const IconComponent = style.Icon;
            return (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-purple-50/55 dark:bg-purple-950/35 hover:bg-purple-100/60 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/60 transition"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${style.iconBg}`}
                  >
                    <IconComponent className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {entry.actionTitle}
                      </span>
                      <span className="text-slate-300 dark:text-purple-700">·</span>
                      <span className={`text-[10px] font-extrabold ${style.labelColor}`}>
                        {style.labelText}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-purple-200 mt-0.5 leading-snug">
                      {entry.details}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 dark:text-purple-300 font-bold">
                      <span className="inline-flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#6b21a8] dark:text-purple-300" />
                        {entry.actorName} ({entry.actorRole})
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {entry.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dispatch(setActiveTab(getCategoryTab(entry.targetCategory)))}
                  title="الانتقال إلى السجل المعني"
                  className="shrink-0 p-1.5 rounded-lg text-purple-700 dark:text-purple-300 hover:bg-purple-200/60 dark:hover:bg-purple-800/60 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
