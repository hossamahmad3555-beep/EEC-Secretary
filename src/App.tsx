/**
 * @file App.tsx
 * @description المكون الجذري لنظام إدارة السكرتارية - الشركة المصرية الهندسية للمقاولات (EEC).
 * يربط متجر Redux Toolkit، يدير الوضع الليلي/النهاري على عنصر <html>، ويوفر انتقالات سلسة
 * بين الصفحات باستخدام Framer Motion (motion/react).
 */

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { AnimatePresence, motion } from 'motion/react';
import { store, useAppSelector } from './store/store';
import { HeaderBanner } from './components/HeaderBanner';
import { SidebarNav } from './components/SidebarNav';
import { DashboardMainView } from './components/DashboardMainView';
import { SubModuleViews } from './components/SubModuleViews';
import { QuickActionModals, ModalType } from './components/QuickActionModals';
import { ToastNotificationSystem } from './components/ToastNotificationSystem';

const SecretariatShell: React.FC = () => {
  const { activeTab, theme } = useAppSelector((state) => state.secretariat);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [portalNotice, setPortalNotice] = useState(false);

  // Sync dark mode class with document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col bg-gradient-to-br from-[#ede4f7] via-[#f5f0fc] to-[#e9ddf8] dark:from-[#0f071e] dark:via-[#160b2b] dark:to-[#120824] text-slate-900 dark:text-slate-100 transition-colors duration-300"
    >
      {/* Top Corporate Header Banner */}
      <HeaderBanner
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onOpenPerfModal={() => setActiveModal('performance_monitor')}
      />

      {/* Main Workspace Container (Right Sidebar + Left Content Canvas) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Right Navigation Sidebar */}
        <SidebarNav
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onPortalReturn={() => {
            setPortalNotice(true);
            setTimeout(() => setPortalNotice(false), 3000);
          }}
        />

        {/* Main Content Viewport with Smooth Framer Motion Page Transitions */}
        <main className="flex-1 min-w-0 p-3 sm:p-4 lg:p-5 overflow-x-hidden">
          {portalNotice && (
            <div className="mb-3 px-4 py-2.5 rounded-2xl bg-[#4c1d95] text-white text-xs font-bold flex items-center justify-between shadow-md">
              <span>
                أنت الآن في البوابة الرئيسية لنظام إدارة السكرتارية - الشركة المصرية الهندسية للمقاولات (EEC).
              </span>
              <button
                type="button"
                onClick={() => setPortalNotice(false)}
                className="underline text-amber-300 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' ? (
                <DashboardMainView onOpenModal={(m) => setActiveModal(m)} />
              ) : (
                <SubModuleViews onOpenModal={(m) => setActiveModal(m)} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Interactive Modals for Quick Actions & Real User Performance Monitoring */}
      <QuickActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Smart Pop-up Toast Notification System for Task Deadlines & Urgent Correspondence */}
      <ToastNotificationSystem />
    </div>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SecretariatShell />
    </Provider>
  );
}
