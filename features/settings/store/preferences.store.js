import {
  readLanguage,
  readNotificationPreferences,
  readThemeMode,
  saveLanguage,
  saveNotificationPreferences,
  saveThemeMode,
} from '@/shared/storage/preferences.storage';
import { create } from 'zustand';

export const usePreferencesStore = create((set, get) => ({
  themeMode: 'system',
  isThemeReady: false,
  language: 'vi',
  isLanguageReady: false,
  notificationPrefs: {
    notificationsEnabled: true,
    emailClassAttendance: true,
    emailRequests: true,
    emailSecurity: true,
    pushNotifications: true,
    soundEnabled: false,
  },
  isNotificationPrefsReady: false,

  restoreThemeMode: (themeMode) => set({ themeMode, isThemeReady: true }),
  setThemeMode: (themeMode) => set({ themeMode }),

  initPreferences: async () => {
    try {
      const [themeMode, language, notificationPrefs] = await Promise.all([
        readThemeMode(),
        readLanguage(),
        readNotificationPreferences(),
      ]);
      set({
        themeMode,
        isThemeReady: true,
        language,
        isLanguageReady: true,
        notificationPrefs,
        isNotificationPrefsReady: true,
      });
    } catch {
      set({ isThemeReady: true, isLanguageReady: true, isNotificationPrefsReady: true });
    }
  },

  setLanguage: async (language) => {
    set({ language });
    await saveLanguage(language);
  },

  updateNotificationPrefs: async (updates) => {
    const next = { ...get().notificationPrefs, ...updates };
    set({ notificationPrefs: next });
    await saveNotificationPreferences(next);
  },
}));
