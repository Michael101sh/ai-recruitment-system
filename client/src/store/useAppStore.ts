import { create } from 'zustand';

export type Tab = 'generate' | 'candidates' | 'rankings';

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab, options?: { clearNotifications?: boolean }) => void;

  // Notifications
  error: string | null;
  success: string | null;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'generate',
  setActiveTab: (tab, options) =>
    set({
      activeTab: tab,
      ...(options?.clearNotifications !== false && { error: null, success: null }),
    }),

  error: null,
  success: null,
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  clearNotifications: () => set({ error: null, success: null }),
}));
