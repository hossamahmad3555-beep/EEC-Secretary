/**
 * @file store.ts
 * @description إعداد متجر Redux Toolkit مع وسيط (Middleware) للحفظ التلقائي الفوري في التخزين المحلي (LocalStorage)
 * ومراقبة زمن تنفيذ العمليات (Real User Monitoring / Performance Analytics).
 */

import { configureStore, Middleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import secretariatReducer, {
  STORAGE_KEY_NAME,
  ARCHIVE_STORAGE_KEY,
} from './secretariatSlice';

/**
 * وسيط مخصص لحفظ الحالة ومجلدات الأرشيف تلقائياً وبشكل دائم في التخزين المحلي (LocalStorage) بعد كل عملية تحديث.
 */
const autoSaveAndPerfMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== 'undefined') {
    try {
      const state = storeApi.getState().secretariat;
      window.localStorage.setItem(STORAGE_KEY_NAME, JSON.stringify(state));
      window.localStorage.setItem(
        ARCHIVE_STORAGE_KEY,
        JSON.stringify({
          archivedCorrespondences: state.archivedCorrespondences,
          archiveFolders: state.archiveFolders,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error('تعذر حفظ البيانات تلقائياً في التخزين المحلي:', error);
    }
  }

  return result;
};

export const store = configureStore({
  reducer: {
    secretariat: secretariatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(autoSaveAndPerfMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
