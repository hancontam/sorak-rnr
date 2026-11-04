import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_MODE_KEY = '@sorak/theme-mode';
const THEME_MODES = new Set(['system', 'light', 'dark']);

const LANGUAGE_KEY = '@sorak/language';
const LANGUAGES = new Set(['vi', 'en']);

const NOTIFICATION_PREFS_KEY = '@sorak/notification-prefs';
const DEFAULT_NOTIFICATION_PREFS = {
  notificationsEnabled: true,
  emailClassAttendance: true,
  emailRequests: true,
  emailSecurity: true,
  pushNotifications: true,
  soundEnabled: false,
};

export async function readThemeMode() {
  const value = await AsyncStorage.getItem(THEME_MODE_KEY);
  return THEME_MODES.has(value) ? value : 'system';
}

export async function saveThemeMode(value) {
  if (!THEME_MODES.has(value)) throw new Error('Chế độ giao diện không hợp lệ.');
  await AsyncStorage.setItem(THEME_MODE_KEY, value);
}

export async function readLanguage() {
  const value = await AsyncStorage.getItem(LANGUAGE_KEY);
  return LANGUAGES.has(value) ? value : 'vi';
}

export async function saveLanguage(value) {
  if (!LANGUAGES.has(value)) throw new Error('Ngôn ngữ không hợp lệ.');
  await AsyncStorage.setItem(LANGUAGE_KEY, value);
}

export async function readNotificationPreferences() {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export async function saveNotificationPreferences(prefs) {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
}
