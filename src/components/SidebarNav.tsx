/**
 * @file SidebarNav.tsx
 * @description القائمة الجانبية اليمنى لنظام إدارة السكرتارية.
 * تطابق الترتيب والألوان في الصورة المرجعية: زر لوحة التحكم الذهبي النشط، و10 أقسام فرعية،
 * بالإضافة إلى زر "العودة إلى البوابة" في الأسفل.
 */

import React from 'react';
import {
  Home,
  FolderOpen,
  FileUp,
  CheckSquare,
  CalendarDays,
  PhoneCall,
  BookOpen,
  Users,
  Archive,
  BarChart3,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';
import { TabId } from '../types/secretariat';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setActiveTab, recordPerformanceMetric } from '../store/secretariatSlice';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
  { id: 'correspondence', label: 'المراسلات', icon: FolderOpen },
  { id: 'circulars', label: 'التعاميم والقرارات', icon: FileUp },
  { id: 'tasks', label: 'المهام والمتابعة', icon: CheckSquare },
  { id: 'meetings', label: 'الإجتماعات', icon: CalendarDays },
  { id: 'calls', label: 'مواعيد الاتصالات', icon: PhoneCall },
  { id: 'custody', label: 'دفتر العهدة', icon: BookOpen },
  { id: 'visitors', label: 'الزوار والزيارات', icon: Users },
  { id: 'archive', label: 'الأرشيف', icon: Archive },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

interface SidebarNavProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onPortalReturn: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  mobileOpen,
  onCloseMobile,
  onPortalReturn,
}) => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.secretariat.activeTab);

  const handleSelectTab = (tabId: TabId, label: string) => {
    const start = performance.now();
    dispatch(setActiveTab(tabId));
    const elapsed = Math.max(0.4, performance.now() - start);
    dispatch(
      recordPerformanceMetric({
        actionName: `التنقل إلى قسم: ${label}`,
        durationMs: elapsed,
      })
    );
    onCloseMobile();
  };

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full py-4 px-2.5 bg-gradient-to-b from-[#331060] via-[#260b4c] to-[#1a0636] text-white select-none shadow-2xl border-l border-purple-500/20">
      {/* Top Navigation List */}
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="border-b border-purple-400/15 last:border-none pb-1">
              <button
                type="button"
                onClick={() => handleSelectTab(item.id, item.label)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-l from-[#fde047] via-[#facc15] to-[#f59e0b] text-[#2e1065] shadow-md scale-[1.01]'
                    : 'text-purple-100/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[#3b0764] stroke-[2.4]' : 'text-purple-200/90'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Bottom Return to Portal Pill Button */}
      <div className="pt-4 mt-4 border-t border-purple-400/20">
        <button
          type="button"
          onClick={onPortalReturn}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-l from-[#4c1d95]/80 to-[#3b0764]/80 hover:from-[#581c87] hover:to-[#4c1d95] border border-purple-400/40 text-purple-100 text-xs sm:text-sm font-bold shadow-inner transition cursor-pointer whitespace-nowrap"
        >
          <span>العودة إلى البوابة</span>
          <ArrowLeft className="w-4 h-4 text-purple-200" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Right Sidebar */}
      <aside className="hidden xl:block w-[220px] shrink-0">
        <div className="sticky top-0 h-[calc(100vh-76px)]">{renderNavContent()}</div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full mr-0 ml-auto">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute left-3 top-3 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 z-20"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
};
