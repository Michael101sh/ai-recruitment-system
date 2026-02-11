import { useEffect } from 'react';

import { useAppStore } from '../store/useAppStore';

const TOAST_DURATION_MS = 5000;

/**
 * Renders global error and success toasts from the app store.
 * Auto-dismisses after TOAST_DURATION_MS.
 */
export const NotificationToasts: React.FC = () => {
  const { error, success, clearNotifications } = useAppStore();

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearNotifications, TOAST_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearNotifications]);

  if (!error && !success) return null;

  return (
    <div className="mb-6 flex-shrink-0 space-y-4">
      {error && (
        <div
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl animate-fade-in"
          role="alert"
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div
          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl animate-fade-in"
          role="status"
        >
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}
    </div>
  );
};
