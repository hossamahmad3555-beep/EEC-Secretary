/**
 * @file PerformanceStatsChart.tsx
 * @description مكون "إحصائيات الأداء" التفاعلي في لوحة التحكم الرئيسية باستخدام مكتبة Recharts.
 * يعرض رسوماً بيانية تفاعلية (مخطط أعمدة مزدوج BarChart، ومخطط مساحي متدرج AreaChart)
 * لتوضيح عدد المراسلات الواردة والصادرة خلال أيام الأسبوع مع مؤشرات الأداء اليومية.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart3, TrendingUp, ArrowUpRight, MailOpen, Send } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { recordPerformanceMetric } from '../store/secretariatSlice';

type ChartViewMode = 'bar' | 'area';

export const PerformanceStatsChart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { weeklyStats, theme } = useAppSelector((state) => state.secretariat);
  const [chartMode, setChartMode] = useState<ChartViewMode>('bar');

  // Ensure fallback if persisted state from an earlier session didn't have weeklyStats
  const safeWeeklyData = useMemo(() => {
    if (weeklyStats && weeklyStats.length > 0) return weeklyStats;
    return [
      { day: 'السبت', incoming: 28, outgoing: 16, completionRate: 84 },
      { day: 'الأحد', incoming: 42, outgoing: 25, completionRate: 88 },
      { day: 'الاثنين', incoming: 38, outgoing: 29, completionRate: 82 },
      { day: 'الثلاثاء', incoming: 51, outgoing: 34, completionRate: 91 },
      { day: 'الأربعاء', incoming: 46, outgoing: 31, completionRate: 86 },
      { day: 'الخميس', incoming: 35, outgoing: 24, completionRate: 89 },
      { day: 'الجمعة', incoming: 14, outgoing: 9, completionRate: 95 },
    ];
  }, [weeklyStats]);

  const totals = useMemo(() => {
    const totalIncoming = safeWeeklyData.reduce((acc, item) => acc + item.incoming, 0);
    const totalOutgoing = safeWeeklyData.reduce((acc, item) => acc + item.outgoing, 0);
    const avgCompletion = Math.round(
      safeWeeklyData.reduce((acc, item) => acc + item.completionRate, 0) /
        safeWeeklyData.length
    );
    const peakDay = safeWeeklyData.reduce((prev, curr) =>
      curr.incoming + curr.outgoing > prev.incoming + prev.outgoing ? curr : prev
    );
    return {
      totalIncoming,
      totalOutgoing,
      totalWeek: totalIncoming + totalOutgoing,
      avgCompletion,
      peakDayName: peakDay.day,
    };
  }, [safeWeeklyData]);

  const handleSwitchChartMode = (mode: ChartViewMode) => {
    const t0 = performance.now();
    setChartMode(mode);
    dispatch(
      recordPerformanceMetric({
        actionName: `تغيير عرض إحصائيات الأداء إلى: ${
          mode === 'bar' ? 'مخطط الأعمدة' : 'المخطط المساحي'
        }`,
        durationMs: Math.max(0.4, performance.now() - t0),
      })
    );
  };

  const axisTextColor = theme === 'dark' ? '#d8b4fe' : '#475569';
  const gridStrokeColor = theme === 'dark' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.14)';

  return (
    <section
      aria-label="إحصائيات الأداء للمراسلات الأسبوعية"
      className="rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 sm:p-4"
    >
      {/* Header Row: Title + Summary Metrics + Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center shadow-2xs">
            <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              إحصائيات الأداء · حركة المراسلات الواردة والصادرة خلال الأسبوع
            </h3>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-purple-300">
              تحليل تفاعلي لحجم المراسلات اليومي ومعدل سرعة الإنجاز الأسبوعي
            </p>
          </div>
        </div>

        {/* Center/Left: Quick Weekly KPI Summary & Chart Type Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Weekly Totals Inline Summary */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800/70 text-xs">
            <div className="flex items-center gap-1.5">
              <MailOpen className="w-3.5 h-3.5 text-[#6b21a8] dark:text-purple-300" />
              <span className="font-bold text-slate-600 dark:text-purple-200">الوارد الأسبوعي:</span>
              <span className="font-mono tabular-nums font-black text-[#6b21a8] dark:text-purple-200">
                {totals.totalIncoming}
              </span>
            </div>
            <span className="text-purple-300 dark:text-purple-700">|</span>
            <div className="flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-600 dark:text-purple-200">الصادر الأسبوعي:</span>
              <span className="font-mono tabular-nums font-black text-amber-600 dark:text-amber-400">
                {totals.totalOutgoing}
              </span>
            </div>
            <span className="hidden sm:inline text-purple-300 dark:text-purple-700">|</span>
            <div className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{totals.avgCompletion}%</span>
              <span>إنجاز</span>
            </div>
          </div>

          {/* Interactive Chart Mode Switcher */}
          <div className="flex items-center gap-1 bg-purple-100/70 dark:bg-purple-950/70 p-1 rounded-xl border border-purple-200/60 dark:border-purple-800/60">
            <button
              type="button"
              onClick={() => handleSwitchChartMode('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'bar'
                  ? 'bg-[#6b21a8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>أعمدة مقارنة</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchChartMode('area')}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
                chartMode === 'area'
                  ? 'bg-[#6b21a8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>منحنى الأداء</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Chart Canvas (9 columns on desktop) */}
        <div className="lg:col-span-9 h-56 sm:h-60 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'bar' ? (
              <BarChart
                data={safeWeeklyData}
                margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
                barGap={6}
              >
                <defs>
                  <linearGradient id="incomingBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" />
                    <stop offset="100%" stopColor="#4c1d95" />
                  </linearGradient>
                  <linearGradient id="outgoingBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: axisTextColor, fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: gridStrokeColor }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{
                    fill:
                      theme === 'dark'
                        ? 'rgba(126, 34, 206, 0.15)'
                        : 'rgba(126, 34, 206, 0.06)',
                  }}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e1333' : '#ffffff',
                    borderColor: theme === 'dark' ? '#581c87' : '#e9d5ff',
                    borderRadius: '14px',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value ?? 0} مراسلة`,
                    name === 'incoming' ? 'المراسلات الواردة' : 'المراسلات الصادرة',
                  ]}
                  labelFormatter={(label) => `يوم ${label}`}
                />
                <Bar
                  dataKey="incoming"
                  name="incoming"
                  fill="url(#incomingBarGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="outgoing"
                  name="outgoing"
                  fill="url(#outgoingBarGrad)"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={safeWeeklyData}
                margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7e22ce" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#7e22ce" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="outgoingAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: axisTextColor, fontSize: 12, fontWeight: 700 }}
                  axisLine={{ stroke: gridStrokeColor }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1e1333' : '#ffffff',
                    borderColor: theme === 'dark' ? '#581c87' : '#e9d5ff',
                    borderRadius: '14px',
                    direction: 'rtl',
                    textAlign: 'right',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value ?? 0} مراسلة`,
                    name === 'incoming' ? 'المراسلات الواردة' : 'المراسلات الصادرة',
                  ]}
                  labelFormatter={(label) => `يوم ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="incoming"
                  name="incoming"
                  stroke="#7e22ce"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#incomingAreaGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="outgoing"
                  name="outgoing"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#outgoingAreaGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Side Weekly Performance Insights Panel (3 columns on desktop) */}
        <div className="lg:col-span-3 space-y-2.5 border-t lg:border-t-0 lg:border-r border-purple-100 dark:border-purple-800/70 pt-3 lg:pt-0 lg:pr-4">
          <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60">
            <span className="text-[11px] font-bold text-slate-600 dark:text-purple-300 block">
              إجمالي حركة الأسبوع
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white">
                {totals.totalWeek}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                مراسلة موثقة
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60">
            <span className="text-[11px] font-bold text-slate-600 dark:text-amber-300 block">
              يوم الذروة الأسبوعي
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                يوم {totals.peakDayName}
              </span>
              <span className="text-xs font-mono tabular-nums font-extrabold text-amber-600 dark:text-amber-400">
                85 معاملة
              </span>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-around pt-1 text-xs font-extrabold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#6b21a8]" />
              <span className="text-slate-700 dark:text-purple-200">المراسلات الواردة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
              <span className="text-slate-700 dark:text-purple-200">المراسلات الصادرة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
