/**
 * @file ChartsRow.tsx
 * @description صف الرسوم البيانية الثلاثة في لوحة تحكم إدارة السكرتارية:
 * 1. يمين: توزيع المعاملات حسب النوع (Donut Chart مع نسب الخطابات، الطلبات، الاستفسارات، أخرى).
 * 2. وسط: حركة المعاملات خلال الأشهر (مخطط أعمدة مزدوج وارد بالبنفسجي وصادر بالذهبي من يناير إلى ديسمبر).
 * 3. يسار: حالة المعاملات (مخطط دائري أخضر بنسبة 81.2% مكتملة مع تفاصيل المكتملة، قيد التنفيذ، والمتأخرة).
 */

import React from 'react';
import {
  Mail,
  TrendingUp,
  FolderCheck,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
} from 'lucide-react';
import { MonthlyMovement, TransactionType } from '../types/secretariat';

interface ChartsRowProps {
  totalTransactions: number;
  completedCount: number;
  inProgressCount: number;
  overdueCount: number;
  monthlyMovement: MonthlyMovement[];
  selectedType: TransactionType;
  onSelectType: (type: TransactionType) => void;
}

export const ChartsRow: React.FC<ChartsRowProps> = ({
  totalTransactions,
  completedCount,
  inProgressCount,
  overdueCount,
  monthlyMovement,
  selectedType,
  onSelectType,
}) => {
  // النسب المئوية المطابقة للصورة المرجعية
  const distributionItems = [
    {
      id: 'official_letters' as TransactionType,
      label: 'خطابات رسمية',
      percent: 59.3,
      color: '#6b21a8', // بنفسجي
      badgeClass: 'bg-[#6b21a8]',
    },
    {
      id: 'requests' as TransactionType,
      label: 'طلبات',
      percent: 19.1,
      color: '#0284c7', // أزرق
      badgeClass: 'bg-[#0284c7]',
    },
    {
      id: 'inquiries' as TransactionType,
      label: 'استفسارات',
      percent: 13.5,
      color: '#eab308', // ذهبي/برتقالي
      badgeClass: 'bg-[#eab308]',
    },
    {
      id: 'other' as TransactionType,
      label: 'أخرى',
      percent: 8.1,
      color: '#dc2626', // أحمر
      badgeClass: 'bg-[#dc2626]',
    },
  ];

  const completionPercentage = 81.2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
      {/* 1. Right Card (in RTL): توزيع المعاملات حسب النوع */}
      <div className="lg:col-span-4 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              توزيع المعاملات حسب النوع
            </h3>
          </div>
          {selectedType !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectType('all')}
              className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer"
            >
              عرض الكل
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 my-auto py-1">
          {/* Interactive Legend List (Right side inside RTL card) */}
          <div className="space-y-2 flex-1">
            {distributionItems.map((item) => {
              const isSelected = selectedType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSelectType(selectedType === item.id ? 'all' : item.id)
                  }
                  className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-100 dark:bg-purple-900/60 ring-1 ring-purple-500'
                      : 'hover:bg-purple-50/80 dark:hover:bg-purple-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-xs shrink-0 ${item.badgeClass}`} />
                    <span className="text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-purple-200 font-extrabold">
                    {item.percent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Multi-Segment SVG Donut Chart (Left side inside card) */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#f3e8ff"
                strokeWidth="20"
                className="dark:opacity-10"
              />
              {/* 59.3% Purple Segment (circumference = 2 * pi * 44 ≈ 276.46) */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#581c87"
                strokeWidth="20"
                strokeDasharray="163.9 276.5"
                strokeDashoffset="0"
              />
              {/* 19.1% Blue Segment */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#0284c7"
                strokeWidth="20"
                strokeDasharray="52.8 276.5"
                strokeDashoffset="-163.9"
              />
              {/* 13.5% Amber Segment */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray="37.3 276.5"
                strokeDashoffset="-216.7"
              />
              {/* 8.1% Red Segment */}
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#dc2626"
                strokeWidth="20"
                strokeDasharray="22.5 276.5"
                strokeDashoffset="-254.0"
              />
            </svg>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-none">
                {totalTransactions.toLocaleString('en-US')}
              </span>
              <span className="text-[11px] font-bold text-slate-600 dark:text-purple-200 mt-0.5">
                معاملة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center Card: حركة المعاملات خلال الأشهر */}
      <div className="lg:col-span-5 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              حركة المعاملات خلال الأشهر
            </h3>
          </div>

          {/* Legend: وارد (Purple) & صادر (Gold) */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#6b21a8]" />
              <span className="text-slate-700 dark:text-purple-200">وارد</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
              <span className="text-slate-700 dark:text-purple-200">صادر</span>
            </div>
          </div>
        </div>

        {/* Grouped Vertical Bar Chart */}
        <div className="flex items-end gap-2 pt-2 pb-1 h-36 sm:h-40">
          {/* Bars Area */}
          <div className="flex-1 h-full flex items-end justify-between gap-1 border-b border-l border-purple-200 dark:border-purple-800/80 px-1.5 pb-1 relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-35">
              <div className="border-b border-dashed border-purple-300 dark:border-purple-700 w-full" />
              <div className="border-b border-dashed border-purple-300 dark:border-purple-700 w-full" />
              <div className="border-b border-dashed border-purple-300 dark:border-purple-700 w-full" />
              <div className="border-b border-dashed border-purple-300 dark:border-purple-700 w-full" />
            </div>

            {monthlyMovement.map((m) => {
              const incomingHeightPercent = Math.min(100, Math.round((m.incoming / 250) * 100));
              const outgoingHeightPercent = Math.min(100, Math.round((m.outgoing / 250) * 100));
              return (
                <div
                  key={m.month}
                  className="flex flex-col items-center justify-end h-full flex-1 group relative z-10"
                >
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none shadow">
                    وارد:{m.incoming} | صادر:{m.outgoing}
                  </div>
                  <div className="flex items-end gap-0.5 w-full justify-center h-[82%]">
                    <div
                      style={{ height: `${incomingHeightPercent}%` }}
                      className="w-2 sm:w-2.5 rounded-t-xs bg-gradient-to-t from-[#4c1d95] to-[#7e22ce] transition-all duration-300 group-hover:brightness-110"
                    />
                    <div
                      style={{ height: `${outgoingHeightPercent}%` }}
                      className="w-2 sm:w-2.5 rounded-t-xs bg-gradient-to-t from-[#d97706] to-[#fbbf24] transition-all duration-300 group-hover:brightness-110"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-purple-200 mt-1 truncate">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Y-Axis Scale on the Left (matching reference image: 250, 200, 150, 100, 50, 0) */}
          <div className="flex flex-col justify-between h-[85%] text-[10px] font-mono tabular-nums font-bold text-slate-600 dark:text-purple-300 pb-4">
            <span>250</span>
            <span>200</span>
            <span>150</span>
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* 3. Left Card (in RTL): حالة المعاملات */}
      <div className="lg:col-span-3 rounded-2xl bg-white/95 dark:bg-[#1e1333]/95 border border-purple-200/80 dark:border-purple-800/70 shadow-sm p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-[#6b21a8] dark:text-purple-300 flex items-center justify-center">
              <FolderCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              حالة المعاملات
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 my-auto">
          {/* Status Breakdown List */}
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>مكتملة</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-black text-slate-900 dark:text-white">
                {completedCount.toLocaleString('en-US')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <Hourglass className="w-4 h-4 text-sky-600 shrink-0" />
                <span>قيد التنفيذ</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-black text-slate-900 dark:text-white">
                {inProgressCount.toLocaleString('en-US')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>متأخرة</span>
              </div>
              <span className="font-mono tabular-nums text-sm font-black text-slate-900 dark:text-white">
                {overdueCount.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Green 81.2% Completion Gauge Ring */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
                className="dark:opacity-20"
              />
              <circle
                cx="60"
                cy="60"
                r="44"
                fill="none"
                stroke="#16a34a"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(completionPercentage / 100) * 276.5} 276.5`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg sm:text-xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-none">
                {completionPercentage}%
              </span>
              <span className="text-xs font-extrabold text-slate-700 dark:text-emerald-300 mt-1">
                مكتملة
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
