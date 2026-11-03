/**
 * @file GlobalSearch.tsx
 * @description مكون البحث الشامل (Global Search) المدمج في ترويسة النظام (HeaderBanner).
 * يتيح للمستخدم البحث الفوري والفلترة عبر المهام، المراسلات، والاجتماعات في جميع أنحاء النظام،
 * مع دعم اختصار لوحة المفاتيح (Ctrl+K / Cmd+K)، وتصنيف النتائج، والانتقال المباشر للقسم المختص.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  CheckSquare,
  FolderOpen,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  setSearchQuery,
  setActiveTab,
  toggleTaskCompleted,
  recordPerformanceMetric,
} from '../store/secretariatSlice';
import { TabId } from '../types/secretariat';

type SearchCategory = 'all' | 'tasks' | 'correspondence' | 'meetings';

export const GlobalSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, tasks, correspondences, meetings } = useAppSelector(
    (state) => state.secretariat
  );

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<SearchCategory>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K or Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filtered results across Tasks, Correspondence, and Meetings
  const matchedTasks = useMemo(() => {
    if (category !== 'all' && category !== 'tasks') return [];
    if (!normalizedQuery) return tasks.slice(0, 3);
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(normalizedQuery) ||
        t.department.toLowerCase().includes(normalizedQuery) ||
        t.dueDate.includes(normalizedQuery)
    );
  }, [tasks, normalizedQuery, category]);

  const matchedCorrespondences = useMemo(() => {
    if (category !== 'all' && category !== 'correspondence') return [];
    if (!normalizedQuery) return correspondences.slice(0, 3);
    return correspondences.filter(
      (c) =>
        c.subject.toLowerCase().includes(normalizedQuery) ||
        c.refNumber.toLowerCase().includes(normalizedQuery) ||
        c.department.toLowerCase().includes(normalizedQuery) ||
        c.date.includes(normalizedQuery)
    );
  }, [correspondences, normalizedQuery, category]);

  const matchedMeetings = useMemo(() => {
    if (category !== 'all' && category !== 'meetings') return [];
    if (!normalizedQuery) return meetings.slice(0, 3);
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(normalizedQuery) ||
        m.department.toLowerCase().includes(normalizedQuery) ||
        m.date.includes(normalizedQuery) ||
        m.time.toLowerCase().includes(normalizedQuery)
    );
  }, [meetings, normalizedQuery, category]);

  const totalMatches =
    matchedTasks.length + matchedCorrespondences.length + matchedMeetings.length;

  const handleQueryChange = (value: string) => {
    const t0 = performance.now();
    dispatch(setSearchQuery(value));
    if (!isOpen) setIsOpen(true);
    dispatch(
      recordPerformanceMetric({
        actionName: `بحث شامل: "${value || 'الكل'}"`,
        durationMs: Math.max(0.4, performance.now() - t0),
      })
    );
  };

  const handleClearSearch = () => {
    dispatch(setSearchQuery(''));
    inputRef.current?.focus();
  };

  const handleNavigateToSection = (tab: TabId, label: string) => {
    const t0 = performance.now();
    dispatch(setActiveTab(tab));
    setIsOpen(false);
    dispatch(
      recordPerformanceMetric({
        actionName: `انتقال من البحث الشامل إلى: ${label}`,
        durationMs: Math.max(0.5, performance.now() - t0),
      })
    );
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-64 md:w-72 lg:w-80 z-40">
      {/* Search Input Bar */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#1e1333]/95 border transition shadow-sm ${
          isOpen
            ? 'border-amber-400 ring-2 ring-amber-400/40'
            : 'border-purple-300/80 dark:border-purple-700/80 hover:border-purple-400'
        }`}
      >
        <Search className="w-4 h-4 text-[#581c87] dark:text-purple-300 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="بحث شامل: مهام، مراسلات، اجتماعات..."
          aria-label="بحث شامل في النظام"
          className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-purple-300/60 focus:outline-none"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={handleClearSearch}
            title="مسح البحث"
            className="p-0.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800 text-slate-500 dark:text-purple-300 transition cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-purple-800 dark:text-purple-200 bg-purple-100/80 dark:bg-purple-900/60 rounded border border-purple-200 dark:border-purple-700 shrink-0">
            Ctrl+K
          </kbd>
        )}
      </div>

      {/* Instant Results Popover Panel */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 mt-2 w-[92vw] sm:w-[420px] max-w-[440px] rounded-2xl bg-white dark:bg-[#1e1333] border border-purple-200 dark:border-purple-800 shadow-2xl overflow-hidden text-right z-50">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between gap-1 px-3 py-2 bg-purple-50/90 dark:bg-[#261742] border-b border-purple-100 dark:border-purple-800/80">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'tasks', label: 'المهام' },
                  { id: 'correspondence', label: 'المراسلات' },
                  { id: 'meetings', label: 'الاجتماعات' },
                ] as { id: SearchCategory; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                    category === tab.id
                      ? 'bg-[#581c87] text-white shadow-xs'
                      : 'text-slate-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono tabular-nums font-bold text-purple-700 dark:text-purple-300">
              {totalMatches} نتيجة
            </span>
          </div>

          {/* Results List Container */}
          <div className="max-h-80 overflow-y-auto divide-y divide-purple-100 dark:divide-purple-800/60 p-2 space-y-2">
            {totalMatches === 0 ? (
              <div className="py-8 text-center space-y-1">
                <p className="text-xs font-extrabold text-slate-700 dark:text-purple-200">
                  لا توجد نتائج مطابقة لـ "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-500 dark:text-purple-400">
                  جرب البحث بكلمات أخرى مثل اسم الإدارة، الرقم المرجعي، أو التاريخ.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Tasks Section */}
                {matchedTasks.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between px-2 mb-1">
                      <span className="text-[11px] font-extrabold text-[#581c87] dark:text-purple-300 flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>المهام والمتابعة ({matchedTasks.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateToSection('tasks', 'المهام والمتابعة')}
                        className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>عرض القسم</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {matchedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition text-xs"
                        >
                          <div
                            onClick={() => dispatch(toggleTaskCompleted(task.id))}
                            className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 accent-[#6b21a8] rounded cursor-pointer shrink-0"
                            />
                            <div className="truncate">
                              <p
                                className={`font-bold truncate ${
                                  task.completed
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {task.title}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-purple-300">
                                {task.department}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNavigateToSection('tasks', task.title)}
                            className="font-mono tabular-nums text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0 hover:underline cursor-pointer"
                          >
                            {task.dueDate}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Correspondence Section */}
                {matchedCorrespondences.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                      <span className="text-[11px] font-extrabold text-[#581c87] dark:text-purple-300 flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>المراسلات الصادرة والواردة ({matchedCorrespondences.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateToSection('correspondence', 'المراسلات')}
                        className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>عرض القسم</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {matchedCorrespondences.map((corr) => (
                        <div
                          key={corr.id}
                          onClick={() => handleNavigateToSection('correspondence', corr.subject)}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition text-xs cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {corr.subject}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-purple-300">
                              <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                                {corr.refNumber}
                              </span>
                              <span>·</span>
                              <span>{corr.department}</span>
                              <span>·</span>
                              <span>{corr.direction === 'incoming' ? 'وارد' : 'صادر'}</span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold">
                            {corr.status === 'completed' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {corr.status === 'in_progress' && (
                              <Clock className="w-3.5 h-3.5 text-sky-600" />
                            )}
                            {corr.status === 'overdue' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span className="font-mono tabular-nums text-slate-600 dark:text-purple-200">
                              {corr.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Meetings Section */}
                {matchedMeetings.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                      <span className="text-[11px] font-extrabold text-[#581c87] dark:text-purple-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>الاجتماعات ({matchedMeetings.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNavigateToSection('meetings', 'الاجتماعات')}
                        className="text-[10px] font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>عرض القسم</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {matchedMeetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          onClick={() => handleNavigateToSection('meetings', meeting.title)}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/40 transition text-xs cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {meeting.title}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-purple-300">
                              {meeting.department}
                            </p>
                          </div>
                          <div className="text-left shrink-0 font-mono tabular-nums text-[11px] font-bold text-purple-800 dark:text-purple-200">
                            <span>{meeting.time}</span>
                            <span className="mx-1">·</span>
                            <span>{meeting.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Quick Filter Info */}
          {searchQuery && (
            <div className="px-3 py-2 bg-purple-50/90 dark:bg-[#261742] border-t border-purple-100 dark:border-purple-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 dark:text-purple-200 font-semibold">
                يتم تصفية جداول الصفحة الحالية تلقائياً حسب بحثك
              </span>
              <button
                type="button"
                onClick={handleClearSearch}
                className="font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                إلغاء الفلترة
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
