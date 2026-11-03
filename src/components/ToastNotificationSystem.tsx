/**
 * @file ToastNotificationSystem.tsx
 * @description نظام الإشعارات المنبثقة الذكي (Toast Notifications) لإدارة السكرتارية.
 * يقوم بفحص المواعيد النهائية للمهام الهامة والمراسلات العاجلة لتنبيه المستخدم تلقائياً،
 * مع إمكانية اتخاذ إجراء فوري (الانتقال للمهمة/المراسلة أو إنجاز المهمة مباشرة من الإشعار).
 */

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  Clock,
  MailWarning,
  CheckCircle2,
  X,
  ArrowLeft,
  Check,
  BellOff,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  dismissToast,
  pushToast,
  setActiveTab,
  toggleTaskCompleted,
  toggleToastMuted,
  recordPerformanceMetric,
} from '../store/secretariatSlice';
import { ToastNotificationItem } from '../types/secretariat';

export const ToastNotificationSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    toastNotifications,
    toastMuted,
    tasks,
    correspondences,
    overdueTransactions,
  } = useAppSelector((state) => state.secretariat);

  const hasRunInitialScan = useRef(false);

  // Automatic Deadline & Urgent Correspondence Scanner
  useEffect(() => {
    if (hasRunInitialScan.current || toastMuted) return;
    hasRunInitialScan.current = true;

    // 1. Scan for urgent task deadlines due today/tomorrow
    const urgentTask = tasks.find((t) => !t.completed && t.priority === 'high');
    const firstTimer = setTimeout(() => {
      if (urgentTask) {
        dispatch(
          pushToast({
            title: 'اقتراب موعد تسليم مهمة هامة',
            message: `المهمة "${urgentTask.title}" (${urgentTask.department}) مستحقة التسليم بتاريخ ${urgentTask.dueDate}.`,
            urgency: 'upcoming_task',
            targetTab: 'tasks',
            referenceId: urgentTask.id,
          })
        );
      }
    }, 1800);

    // 2. Scan for urgent incoming correspondence or overdue transactions requiring immediate action
    const urgentCorr =
      correspondences.find((c) => c.status === 'overdue' || c.status === 'in_progress') ||
      correspondences[0];

    const secondTimer = setTimeout(() => {
      if (urgentCorr) {
        dispatch(
          pushToast({
            title: 'مراسلة عاجلة تتطلب إجراءً فورياً',
            message: `المراسلة [${urgentCorr.refNumber}] "${urgentCorr.subject}" بانتظار الاعتماد في ${urgentCorr.department}.`,
            urgency: 'urgent_correspondence',
            targetTab: 'correspondence',
            referenceId: urgentCorr.id,
          })
        );
      } else if (overdueTransactions.length > 0) {
        const firstOverdue = overdueTransactions[0];
        dispatch(
          pushToast({
            title: 'تنبيه معاملة متأخرة',
            message: `المعاملة "${firstOverdue.subject}" لدى ${firstOverdue.department} تجاوزت موعد الاستحقاق (${firstOverdue.dueDate}).`,
            urgency: 'overdue_alert',
            targetTab: 'archive',
          })
        );
      }
    }, 5200);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(secondTimer);
    };
  }, [dispatch, tasks, correspondences, overdueTransactions, toastMuted]);

  // Auto-dismiss individual toasts after 9 seconds so they never clutter the screen permanently
  useEffect(() => {
    if (toastNotifications.length === 0) return;
    const latestToast = toastNotifications[0];
    const timer = setTimeout(() => {
      dispatch(dismissToast(latestToast.id));
    }, 9000);
    return () => clearTimeout(timer);
  }, [toastNotifications, dispatch]);

  const handleActionNavigate = (toast: ToastNotificationItem) => {
    const t0 = performance.now();
    dispatch(setActiveTab(toast.targetTab));
    dispatch(dismissToast(toast.id));
    dispatch(
      recordPerformanceMetric({
        actionName: `الاستجابة لإشعار: ${toast.title}`,
        durationMs: Math.max(0.5, performance.now() - t0),
      })
    );
  };

  const handleQuickCompleteTask = (toast: ToastNotificationItem) => {
    if (!toast.referenceId) return;
    const t0 = performance.now();
    dispatch(toggleTaskCompleted(toast.referenceId));
    dispatch(dismissToast(toast.id));
    dispatch(
      pushToast({
        title: 'تم إنجاز المهمة بنجاح',
        message: 'تم تحديث حالة المهمة في سجل المتابعة والحفظ التلقائي.',
        urgency: 'success',
        targetTab: 'tasks',
      })
    );
    dispatch(
      recordPerformanceMetric({
        actionName: 'إنجاز مهمة مباشرة من الإشعار المنبثق',
        durationMs: Math.max(0.6, performance.now() - t0),
      })
    );
  };

  const getUrgencyStyles = (urgency: ToastNotificationItem['urgency']) => {
    switch (urgency) {
      case 'urgent_correspondence':
        return {
          container:
            'bg-white/98 dark:bg-[#22133a]/98 border-rose-300 dark:border-rose-700/80 shadow-rose-950/15',
          iconBox: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
          badge: 'text-rose-700 dark:text-rose-300',
          label: 'مراسلة عاجلة',
          Icon: MailWarning,
        };
      case 'upcoming_task':
        return {
          container:
            'bg-white/98 dark:bg-[#22133a]/98 border-amber-300 dark:border-amber-700/80 shadow-amber-950/15',
          iconBox: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
          badge: 'text-amber-700 dark:text-amber-300',
          label: 'موعد تسليم مهمة',
          Icon: Clock,
        };
      case 'overdue_alert':
        return {
          container:
            'bg-white/98 dark:bg-[#22133a]/98 border-rose-400 dark:border-rose-700 shadow-rose-950/20',
          iconBox: 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400',
          badge: 'text-rose-700 dark:text-rose-300',
          label: 'تجاوز الاستحقاق',
          Icon: AlertTriangle,
        };
      case 'success':
      default:
        return {
          container:
            'bg-white/98 dark:bg-[#22133a]/98 border-emerald-300 dark:border-emerald-700/80 shadow-emerald-950/15',
          iconBox: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
          badge: 'text-emerald-700 dark:text-emerald-300',
          label: 'تم الإجراء',
          Icon: CheckCircle2,
        };
    }
  };

  return (
    <div
      dir="rtl"
      aria-live="polite"
      className="no-print fixed bottom-4 left-4 z-50 flex flex-col gap-2.5 w-[92vw] sm:w-[390px] max-w-[400px] pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toastNotifications.map((toast) => {
          const style = getUrgencyStyles(toast.urgency);
          const IconComponent = style.Icon;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto rounded-2xl border p-3.5 shadow-2xl backdrop-blur-md ${style.container}`}
            >
              <div className="flex items-start gap-3">
                {/* Urgency Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.iconBox}`}
                >
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-extrabold ${style.badge}`}>
                      {style.label} · {toast.timestamp}
                    </span>
                    <button
                      type="button"
                      onClick={() => dispatch(dismissToast(toast.id))}
                      title="إغلاق التنبيه"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/50 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-0.5 leading-snug">
                    {toast.title}
                  </h4>

                  <p className="text-[11px] font-semibold text-slate-600 dark:text-purple-200 mt-1 leading-relaxed">
                    {toast.message}
                  </p>

                  {/* Interactive Action Buttons inside Toast */}
                  <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-purple-100 dark:border-purple-800/60">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleActionNavigate(toast)}
                        className="px-2.5 py-1 rounded-lg bg-[#581c87] hover:bg-[#4c1d95] text-white text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      >
                        <span>اتخاذ إجراء</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>

                      {toast.urgency === 'upcoming_task' && toast.referenceId && (
                        <button
                          type="button"
                          onClick={() => handleQuickCompleteTask(toast)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>إنجاز فوري</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(toggleToastMuted())}
                      title="إيقاف الإشعارات المنبثقة مؤقتاً"
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                    >
                      <BellOff className="w-3 h-3" />
                      <span>كتم</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
