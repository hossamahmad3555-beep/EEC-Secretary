/**
 * @file HeaderBanner.tsx
 * @description ترويسة النظام العلوية المطابقة لتصميم الشركة المصرية الهندسية للمقاولات (EEC).
 * تحتوي على شعار الشركة، المشهد الهندسي، عنوان إدارة السكرتارية، أزرار الإشعارات والتقويم،
 * مبدل الوضع الليلي/النهاري، وقائمة مدير السكرتارية.
 */

import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  HelpCircle,
  ChevronDown,
  UserCircle2,
  Sun,
  Moon,
  Activity,
  RotateCcw,
  Menu,
  CheckCircle2,
  BellOff,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  toggleTheme,
  resetToDefaultData,
  setActiveTab,
  pushToast,
  toggleToastMuted,
  resolveOverdueTransaction,
  clearAllToasts,
  dismissToast,
} from '../store/secretariatSlice';
import { GlobalSearch } from './GlobalSearch';

interface HeaderBannerProps {
  onOpenMobileSidebar: () => void;
  onOpenPerfModal: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onOpenMobileSidebar,
  onOpenPerfModal,
}) => {
  const dispatch = useAppDispatch();
  const {
    theme,
    stats,
    lastSavedAt,
    overdueTransactions,
    toastNotifications,
    toastMuted,
  } = useAppSelector((state) => state.secretariat);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'overdue' | 'active'>('overdue');

  return (
    <header className="relative w-full overflow-hidden border-b border-purple-300/60 dark:border-purple-900/60 bg-gradient-to-l from-[#3c1070] via-[#531c93] to-[#f5eefc] dark:from-[#1a0733] dark:via-[#2a0f4d] dark:to-[#1e1233] select-none shadow-md z-30">
      {/* Decorative Golden Ribbon & Engineering Construction Silhouette Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Golden curved wave divider matching reference image */}
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-90"
        >
          <path
            d="M460 0 C540 45, 510 95, 420 120 L980 120 C910 75, 960 25, 890 0 Z"
            fill="url(#constructionGlow)"
            opacity="0.35"
          />
          <path
            d="M455 0 C520 50, 490 95, 410 120"
            stroke="url(#goldGradient)"
            strokeWidth="6"
            fill="none"
          />
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="constructionGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>

        {/* Construction Cranes & Building Silhouette in the middle-right zone */}
        <svg
          viewBox="0 0 500 110"
          className="hidden lg:block absolute right-[29%] bottom-0 h-[105px] w-[460px] opacity-80 dark:opacity-55"
        >
          {/* Sunset glow behind cranes */}
          <circle cx="240" cy="85" r="95" fill="url(#sunsetRadial)" opacity="0.65" />
          <defs>
            <radialGradient id="sunsetRadial">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="55%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#581c87" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Left Crane */}
          <g stroke="#b45309" strokeWidth="1.8" fill="none">
            <line x1="90" y1="15" x2="90" y2="110" strokeWidth="3" />
            <line x1="40" y1="24" x2="185" y2="24" strokeWidth="2.5" />
            <line x1="90" y1="15" x2="45" y2="24" />
            <line x1="90" y1="15" x2="175" y2="24" />
            <line x1="155" y1="24" x2="155" y2="52" />
          </g>
          {/* Center-Right Tall Crane */}
          <g stroke="#d97706" strokeWidth="1.8" fill="none">
            <line x1="255" y1="8" x2="255" y2="110" strokeWidth="3.2" />
            <line x1="190" y1="18" x2="365" y2="18" strokeWidth="2.5" />
            <line x1="255" y1="8" x2="195" y2="18" />
            <line x1="255" y1="8" x2="355" y2="18" />
            <line x1="320" y1="18" x2="320" y2="48" />
          </g>
          {/* High-rise Engineering Towers Silhouette */}
          <g fill="#4c1d95" opacity="0.78">
            <rect x="110" y="55" width="38" height="55" />
            <rect x="155" y="42" width="46" height="68" />
            <rect x="210" y="60" width="32" height="50" />
            <rect x="275" y="48" width="52" height="62" />
            <rect x="335" y="66" width="36" height="44" />
          </g>
          {/* Lit building windows */}
          <g fill="#fde047" opacity="0.8">
            <rect x="162" y="48" width="6" height="6" />
            <rect x="174" y="48" width="6" height="6" />
            <rect x="186" y="48" width="6" height="6" />
            <rect x="162" y="60" width="6" height="6" />
            <rect x="174" y="60" width="6" height="6" />
            <rect x="284" y="56" width="7" height="6" />
            <rect x="296" y="56" width="7" height="6" />
            <rect x="308" y="56" width="7" height="6" />
            <rect x="284" y="68" width="7" height="6" />
            <rect x="308" y="68" width="7" height="6" />
          </g>
        </svg>
      </div>

      {/* Main Header Content Row */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Right Side (in RTL): Company Emblem & Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="xl:hidden p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition"
            aria-label="فتح القائمة الجانبية"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Circular EEC Engineering Emblem */}
          <div
            onClick={() => dispatch(setActiveTab('dashboard'))}
            className="cursor-pointer w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-lg border-2 border-amber-300 flex items-center justify-center shrink-0 transition-transform hover:scale-105"
          >
            <div className="w-full h-full rounded-full border-2 border-[#3b0764] flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white text-[#2e1065] relative">
              {/* Mini columns icon */}
              <div className="flex items-end gap-0.5 mb-0.5">
                <span className="w-1 h-2.5 bg-[#3b0764] rounded-t-xs" />
                <span className="w-1 h-3.5 bg-[#3b0764] rounded-t-xs" />
                <span className="w-1.5 h-4.5 bg-amber-600 rounded-t-xs" />
                <span className="w-1 h-3.5 bg-[#3b0764] rounded-t-xs" />
                <span className="w-1 h-2.5 bg-[#3b0764] rounded-t-xs" />
              </div>
              <span className="text-[9px] font-black tracking-tighter leading-none text-[#3b0764]">
                EEC
              </span>
            </div>
          </div>

          <div className="text-white">
            <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight leading-snug drop-shadow-xs">
              الشركة المصرية الهندسية للمقاولات
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-purple-100/95 tracking-wide">
              Egyptian Engineering Company (EEC)
            </p>
          </div>
        </div>

        {/* Left Side (in RTL): Global Search + Secretariat Management Title + Action Icons + Profile Dropdown */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mr-auto xl:mr-0">
          {/* Global Search across Tasks, Correspondence, and Meetings */}
          <GlobalSearch />

          {/* Arabic & English Secretariat Management Title */}
          <div className="hidden 2xl:flex flex-col items-end text-left pl-2">
            <span className="text-xl lg:text-2xl font-black text-[#4c1d95] dark:text-purple-200 leading-none tracking-tight">
              إدارة السكرتارية
            </span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-purple-300 tracking-wide mt-0.5">
              Secretariat Management
            </span>
          </div>

          {/* Golden Calendar Quick Button */}
          <button
            type="button"
            onClick={() => dispatch(setActiveTab('meetings'))}
            title="أجندة الاجتماعات والمواعيد"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-sm flex items-center justify-center transition transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              title="التنبيهات والمعاملات المتأخرة"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-100/90 dark:bg-purple-900/70 hover:bg-purple-200 dark:hover:bg-purple-800 text-[#4c1d95] dark:text-purple-200 flex items-center justify-center transition relative cursor-pointer"
            >
              <Bell className="w-5 h-5 fill-current" />
              {(stats.overdueTransactionsCount > 0 || toastNotifications.length > 0) && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-[#1e1333]">
                  {stats.overdueTransactionsCount + toastNotifications.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute left-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white dark:bg-[#1e1333] shadow-2xl border border-purple-200 dark:border-purple-800 p-4 z-50 text-right">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/80 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-purple-950 dark:text-purple-100">
                      مركز التنبيهات والإجراءات الرقابية
                    </span>
                    {toastMuted && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                        مكتوم
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    إغلاق
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex rounded-xl bg-purple-50 dark:bg-purple-950/50 p-1 mb-3">
                  <button
                    type="button"
                    onClick={() => setNotificationTab('overdue')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      notificationTab === 'overdue'
                        ? 'bg-white dark:bg-[#2c1a4d] text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-slate-600 dark:text-purple-300'
                    }`}
                  >
                    معاملات متأخرة ({overdueTransactions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationTab('active')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                      notificationTab === 'active'
                        ? 'bg-white dark:bg-[#2c1a4d] text-[#6b21a8] dark:text-purple-300 shadow-xs'
                        : 'text-slate-600 dark:text-purple-300'
                    }`}
                  >
                    تنبيهات نشطة ({toastNotifications.length})
                  </button>
                </div>

                {/* Tab 1: Overdue Transactions */}
                {notificationTab === 'overdue' && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                    {overdueTransactions.length === 0 ? (
                      <div className="p-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        لا توجد معاملات متأخرة حالياً، كافة الإجراءات منتظمة!
                      </div>
                    ) : (
                      overdueTransactions.map((ot) => (
                        <div
                          key={ot.id}
                          className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate">
                              {ot.subject}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-purple-300 mt-0.5">
                              {ot.department} · استحقاق: {ot.dueDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              dispatch(resolveOverdueTransaction(ot.id));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shrink-0 transition cursor-pointer whitespace-nowrap shadow-2xs"
                          >
                            اعتماد
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 2: Active Toast Notifications */}
                {notificationTab === 'active' && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                    {toastNotifications.length === 0 ? (
                      <div className="p-4 text-center space-y-2">
                        <p className="text-xs font-bold text-slate-500 dark:text-purple-300">
                          لا توجد إشعارات منبثقة نشطة حالياً.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(
                              pushToast({
                                title: 'تنبيه اختباري فوري',
                                message: 'نظام الإشعارات يعمل بكفاءة وسرعة فائقة.',
                                urgency: 'success',
                                targetTab: 'dashboard',
                              })
                            );
                          }}
                          className="px-3 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/60 text-[#4c1d95] dark:text-purple-200 text-xs font-bold transition cursor-pointer"
                        >
                          إرسال تنبيه تجريبي
                        </button>
                      </div>
                    ) : (
                      toastNotifications.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate">
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-600 dark:text-purple-300 mt-0.5 truncate">
                              {t.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(setActiveTab(t.targetTab));
                                dispatch(dismissToast(t.id));
                                setNotificationsOpen(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#581c87] text-white text-[10px] font-extrabold transition cursor-pointer"
                            >
                              عرض
                            </button>
                            <button
                              type="button"
                              onClick={() => dispatch(dismissToast(t.id))}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-purple-100 dark:border-purple-800/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => dispatch(toggleToastMuted())}
                    className="flex items-center gap-1.5 text-slate-600 dark:text-purple-300 hover:text-[#581c87] font-bold cursor-pointer transition"
                  >
                    <BellOff className="w-3.5 h-3.5" />
                    <span>{toastMuted ? 'تفعيل الإشعارات' : 'كتم الإشعارات'}</span>
                  </button>

                  {toastNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => dispatch(clearAllToasts())}
                      className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-extrabold cursor-pointer"
                    >
                      مسح التنبيهات
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    حفظ: {lastSavedAt}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Performance & System Guide Icon (?) */}
          <button
            type="button"
            onClick={onOpenPerfModal}
            title="مراقب الأداء الحقيقي وتوثيق النظام"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4c1d95] hover:bg-[#3b0764] text-white flex items-center justify-center transition shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            title={theme === 'light' ? 'تفعيل الوضع الليلي الداكن' : 'تفعيل الوضع النهاري الفاتح'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-900/15 dark:bg-purple-300/15 hover:bg-purple-900/25 text-[#3b0764] dark:text-amber-300 flex items-center justify-center transition cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sun className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Secretariat Manager Profile Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-l from-[#3b0764] to-[#581c87] hover:from-[#2e1065] hover:to-[#4c1d95] text-white text-xs sm:text-sm font-bold shadow-md border border-purple-400/30 transition cursor-pointer whitespace-nowrap"
            >
              <UserCircle2 className="w-5 h-5 text-purple-200 shrink-0" />
              <span>مدير السكرتارية</span>
              <ChevronDown className="w-4 h-4 text-purple-200 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1e1333] shadow-xl border border-purple-200 dark:border-purple-800 py-2 z-50 text-right">
                <div className="px-4 py-2 border-b border-purple-100 dark:border-purple-800/80">
                  <p className="text-xs font-bold text-purple-950 dark:text-white">أ. طارق عبد الرحمن</p>
                  <p className="text-[11px] text-slate-500 dark:text-purple-300">مدير عام السكرتارية التنفيذية</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenPerfModal();
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>مؤشرات الأداء والتخزين المحلي</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    dispatch(setActiveTab('settings'));
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/40 flex items-center gap-2"
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>إعدادات النظام والمظهر</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(resetToDefaultData());
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>استعادة البيانات الافتراضية</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
