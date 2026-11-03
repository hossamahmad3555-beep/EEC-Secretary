/**
 * @file InteractiveAgendaCalendar.tsx
 * @description مكون التقويم التفاعلي (أجندة السكرتارية) في لوحة التحكم الرئيسية.
 * يعرض أيام الشهر مع تمييز الأيام التي تحتوي على اجتماعات أو زيارات أو مواعيد هامة،
 * ويتيح النقر على أي يوم لاستعراض تفاصيل المواعيد (الاجتماعات، الزيارات، الاتصالات) الخاصة به،
 * والتنقل بين الأشهر، أو إضافة اجتماع/زيارة جديدة مباشرة في التاريخ المحدد.
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Users,
  Phone,
  Building2,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { recordPerformanceMetric, setActiveTab } from '../store/secretariatSlice';
import { ModalType } from './QuickActionModals';

interface InteractiveAgendaCalendarProps {
  onOpenModal: (modal: ModalType) => void;
}

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const InteractiveAgendaCalendar: React.FC<InteractiveAgendaCalendarProps> = ({
  onOpenModal,
}) => {
  const dispatch = useAppDispatch();
  const {
    selectedYear,
    meetings,
    callsAndVisits,
    highlightedCalendarDays,
  } = useAppSelector((state) => state.secretariat);

  // Default to November (index 10) and day 3 to match the reference dashboard
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(10);
  const [selectedDay, setSelectedDay] = useState<number>(3);
  const [viewFilter, setViewFilter] = useState<'all' | 'meetings' | 'visits'>('all');

  const formattedSelectedDate = useMemo(() => {
    const monthStr = String(currentMonthIndex + 1).padStart(2, '0');
    const dayStr = String(selectedDay).padStart(2, '0');
    return `${selectedYear}-${monthStr}-${dayStr}`;
  }, [selectedYear, currentMonthIndex, selectedDay]);

  // Combine all meetings and visits/calls with normalized day numbers for the current month
  const monthEventsByDay = useMemo(() => {
    const map = new Map<
      number,
      {
        id: string;
        title: string;
        time: string;
        category: 'meeting' | 'visit' | 'call';
        subtitle: string;
        color: 'purple' | 'amber';
      }[]
    >();

    const addEventToDay = (
      dayNum: number,
      item: {
        id: string;
        title: string;
        time: string;
        category: 'meeting' | 'visit' | 'call';
        subtitle: string;
        color: 'purple' | 'amber';
      }
    ) => {
      const existing = map.get(dayNum) || [];
      existing.push(item);
      map.set(dayNum, existing);
    };

    // 1. Map scheduled meetings
    meetings.forEach((m) => {
      const parts = m.date.split('-');
      const mMonth = parts.length === 3 ? parseInt(parts[1], 10) - 1 : 10;
      const mDay = parts.length === 3 ? parseInt(parts[2], 10) : 3;
      if (mMonth === currentMonthIndex) {
        addEventToDay(mDay, {
          id: m.id,
          title: m.title,
          time: m.time,
          category: 'meeting',
          subtitle: m.department,
          color: mDay === 5 ? 'amber' : 'purple',
        });
      }
    });

    // 2. Map scheduled visits & calls
    callsAndVisits.forEach((cv) => {
      const parts = cv.date.split('-');
      const cvMonth = parts.length === 3 ? parseInt(parts[1], 10) - 1 : 10;
      const cvDay = parts.length === 3 ? parseInt(parts[2], 10) : 3;
      if (cvMonth === currentMonthIndex) {
        addEventToDay(cvDay, {
          id: cv.id,
          title: cv.title,
          time: cv.time,
          category: cv.type === 'call' ? 'call' : 'visit',
          subtitle: cv.contactPerson,
          color: cv.type === 'call' ? 'purple' : 'amber',
        });
      }
    });

    // 3. Ensure highlighted milestone days in November (like day 18) also have an agenda item
    if (currentMonthIndex === 10) {
      highlightedCalendarDays.forEach((hd) => {
        const list = map.get(hd.day) || [];
        if (list.length === 0) {
          addEventToDay(hd.day, {
            id: `milestone-${hd.day}`,
            title: hd.label,
            time: '12:00 م',
            category: hd.color === 'amber' ? 'visit' : 'meeting',
            subtitle: 'السكرتارية التنفيذية',
            color: hd.color,
          });
        }
      });
    }

    return map;
  }, [meetings, callsAndVisits, highlightedCalendarDays, currentMonthIndex]);

  // Calendar rows: for November we keep the exact compact 3-row visual layout from the reference image
  // while making every cell interactive with live event badges; for other months we generate a clean grid.
  const calendarRows = useMemo(() => {
    if (currentMonthIndex === 10) {
      return [
        [
          { day: 1, defaultHighlight: null },
          { day: 2, defaultHighlight: null },
          { day: 4, defaultHighlight: null },
          { day: 3, defaultHighlight: 'purple' as const },
          { day: 6, defaultHighlight: null },
          { day: 5, defaultHighlight: 'amber' as const },
          { day: 7, defaultHighlight: null },
        ],
        [
          { day: 11, defaultHighlight: null },
          { day: 9, defaultHighlight: 'purple' as const },
          { day: 17, defaultHighlight: null },
          { day: 10, defaultHighlight: null },
          { day: 12, defaultHighlight: null },
          { day: 13, defaultHighlight: null },
          { day: 14, defaultHighlight: null },
        ],
        [
          { day: 15, defaultHighlight: null },
          { day: 25, defaultHighlight: null },
          { day: 21, defaultHighlight: null },
          { day: 18, defaultHighlight: 'amber' as const },
          { day: 19, defaultHighlight: null },
          { day: 20, defaultHighlight: null },
          { day: 27, defaultHighlight: null },
        ],
      ];
    }

    return [
      [1, 2, 3, 4, 5, 6, 7].map((d) => ({ day: d, defaultHighlight: null })),
      [8, 9, 10, 11, 12, 13, 14].map((d) => ({ day: d, defaultHighlight: null })),
      [15, 16, 17, 18, 19, 20, 21].map((d) => ({ day: d, defaultHighlight: null })),
      [22, 23, 24, 25, 26, 27, 28].map((d) => ({ day: d, defaultHighlight: null })),
    ];
  }, [currentMonthIndex]);

  // Events to display in the interactive bottom drawer of the card
  const activeDayEvents = useMemo(() => {
    const dayEvents = monthEventsByDay.get(selectedDay) || [];
    return dayEvents.filter((ev) => {
      if (viewFilter === 'meetings') return ev.category === 'meeting';
      if (viewFilter === 'visits') return ev.category === 'visit' || ev.category === 'call';
      return true;
    });
  }, [monthEventsByDay, selectedDay, viewFilter]);

  const handleSelectDay = (day: number) => {
    const t0 = performance.now();
    setSelectedDay(day);
    dispatch(
      recordPerformanceMetric({
        actionName: `استعراض مواعيد يوم ${day} ${ARABIC_MONTHS[currentMonthIndex]}`,
        durationMs: Math.max(0.4, performance.now() - t0),
      })
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 0 ? 11 : prev - 1));
    setSelectedDay(3);
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev === 11 ? 0 : prev + 1));
    setSelectedDay(3);
  };

  return (
    <div className="lg:col-span-4 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col justify-between">
      {/* Top Header: Title + Month Switcher */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            أجندة السكرتارية
          </h3>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-800 dark:text-purple-200 bg-purple-50/90 dark:bg-purple-900/40 px-2 py-1 rounded-full border border-purple-200/70 dark:border-purple-700/60">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-0.5 rounded-full hover:bg-purple-200/70 dark:hover:bg-purple-800 transition cursor-pointer"
            aria-label="الشهر السابق"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300" />
          </button>
          <span className="min-w-[72px] text-center">
            {ARABIC_MONTHS[currentMonthIndex]} {selectedYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-0.5 rounded-full hover:bg-purple-200/70 dark:hover:bg-purple-800 transition cursor-pointer"
            aria-label="الشهر التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#581c87] dark:text-purple-300" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Legend Row */}
      <div className="flex items-center justify-between gap-2 mb-2 text-[11px]">
        <div className="flex items-center gap-1 bg-purple-100/60 dark:bg-purple-950/60 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`px-2 py-0.5 rounded-md font-extrabold transition cursor-pointer ${
              viewFilter === 'all'
                ? 'bg-[#6b21a8] text-white shadow-2xs'
                : 'text-slate-600 dark:text-purple-300 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('meetings')}
            className={`px-2 py-0.5 rounded-md font-extrabold transition cursor-pointer ${
              viewFilter === 'meetings'
                ? 'bg-[#6b21a8] text-white shadow-2xs'
                : 'text-slate-600 dark:text-purple-300 hover:text-slate-900'
            }`}
          >
            اجتماعات
          </button>
          <button
            type="button"
            onClick={() => setViewFilter('visits')}
            className={`px-2 py-0.5 rounded-md font-extrabold transition cursor-pointer ${
              viewFilter === 'visits'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 dark:text-purple-300 hover:text-slate-900'
            }`}
          >
            زيارات
          </button>
        </div>

        <div className="flex items-center gap-2.5 font-bold text-[10px] text-slate-600 dark:text-purple-300">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#6b21a8]" />
            اجتماع
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            زيارة/موعد
          </span>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold text-slate-700 dark:text-purple-200 bg-purple-100/70 dark:bg-purple-900/40 rounded-lg py-1 mb-1.5">
        <span>السبت</span>
        <span>الأحد</span>
        <span>الاثنين</span>
        <span>الثلاثاء</span>
        <span>الأربعاء</span>
        <span>الخميس</span>
        <span>الجمعة</span>
      </div>

      {/* Calendar Numeric Grid */}
      <div className="space-y-1">
        {calendarRows.map((row, rIdx) => (
          <div
            key={rIdx}
            className="grid grid-cols-7 text-center items-center text-xs font-mono tabular-nums font-extrabold"
          >
            {row.map((cell, cIdx) => {
              const dayEvents = monthEventsByDay.get(cell.day) || [];
              const hasMeeting = dayEvents.some((e) => e.category === 'meeting');
              const hasVisit = dayEvents.some(
                (e) => e.category === 'visit' || e.category === 'call'
              );

              const highlightType =
                cell.defaultHighlight ||
                (hasVisit && !hasMeeting
                  ? 'amber'
                  : hasMeeting
                  ? 'purple'
                  : null);

              const isSelected = selectedDay === cell.day;

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  onClick={() => handleSelectDay(cell.day)}
                  title={
                    dayEvents.length > 0
                      ? `${dayEvents.length} مواعيد مسجلة في يوم ${cell.day}`
                      : `استعراض يوم ${cell.day}`
                  }
                  className={`relative mx-auto w-7 h-6 sm:w-8 sm:h-6 rounded-full flex items-center justify-center transition cursor-pointer ${
                    highlightType === 'purple'
                      ? 'bg-[#6b21a8] text-white shadow-xs'
                      : highlightType === 'amber'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isSelected
                      ? 'bg-purple-200 dark:bg-purple-800 text-[#4c1d95] dark:text-white'
                      : 'text-slate-800 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  } ${
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-[#581c87] dark:ring-amber-400 scale-105'
                      : ''
                  }`}
                >
                  <span>{cell.day}</span>
                  {dayEvents.length > 0 && !highlightType && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#6b21a8] dark:bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected Day Interactive Upcoming Meetings & Visits Drawer */}
      <div className="mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-800/70">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مواعيد يوم {formattedSelectedDate}:</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onOpenModal('schedule_meeting')}
              className="px-2 py-0.5 rounded-md bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/70 dark:hover:bg-purple-800 text-[#4c1d95] dark:text-purple-200 text-[10px] font-extrabold flex items-center gap-0.5 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>اجتماع</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenModal('log_call')}
              className="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold flex items-center gap-0.5 transition cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>زيارة</span>
            </button>
          </div>
        </div>

        {activeDayEvents.length === 0 ? (
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-dashed border-purple-200 dark:border-purple-800/60 text-[11px] text-slate-500 dark:text-purple-300">
            <span>لا توجد اجتماعات أو زيارات مسجلة في هذا اليوم</span>
            <button
              type="button"
              onClick={() => setSelectedDay(3)}
              className="text-[10px] font-extrabold text-[#6b21a8] dark:text-amber-400 hover:underline cursor-pointer"
            >
              عرض أقرب موعد (3 نوفمبر)
            </button>
          </div>
        ) : (
          <div className="space-y-1 max-h-24 overflow-y-auto pr-0.5">
            {activeDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() =>
                  dispatch(
                    setActiveTab(ev.category === 'meeting' ? 'meetings' : 'visitors')
                  )
                }
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 hover:bg-purple-100/80 dark:hover:bg-purple-900/50 border border-purple-200/60 dark:border-purple-800/60 transition cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {ev.category === 'meeting' && (
                    <Users className="w-3.5 h-3.5 text-[#6b21a8] dark:text-purple-300 shrink-0" />
                  )}
                  {ev.category === 'visit' && (
                    <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  {ev.category === 'call' && (
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-purple-300 truncate hidden sm:inline">
                    ({ev.subtitle})
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono tabular-nums text-[10px] font-bold text-purple-800 dark:text-purple-200 shrink-0">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>{ev.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
