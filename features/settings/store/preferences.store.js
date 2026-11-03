import { create } from 'zustand';

export const usePreferencesStore = create((set) => ({
  themeMode: 'system',
  isThemeReady: false,
  restoreThemeMode: (themeMode) => set({ themeMode, isThemeReady: true }),
  setThemeMode: (themeMode) => set({ themeMode }),
}));
