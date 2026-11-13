import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'sorak.preferences.theme.v1';
const LANGUAGE_KEY = 'sorak.preferences.language.v1';
const PUSH_KEY = 'sorak.preferences.push.v1';
const SOUND_KEY = 'sorak.preferences.notificationSound.v1';
const THEME_MODES = ['light', 'dark', 'system'];

export async function readThemeMode() {
  const value = await AsyncStorage.getItem(THEME_KEY);
  return THEME_MODES.includes(value) ? value : 'system';
}

export async function writeThemeMode(mode) {
  if (!THEME_MODES.includes(mode)) {
    throw new Error('Giao diện phải là light, dark hoặc system.');
  }

  await AsyncStorage.setItem(THEME_KEY, mode);
}

export async function readLanguage() {
  return (await AsyncStorage.getItem(LANGUAGE_KEY)) === 'en' ? 'en' : 'vi';
}

export function writeLanguage(language) {
  return AsyncStorage.setItem(LANGUAGE_KEY, language);
}

// Lựa chọn nhận thông báo đẩy trên máy này: 'on', 'off' hoặc 'unset' khi chưa hỏi.
export async function readPushPreference() {
  const value = await AsyncStorage.getItem(PUSH_KEY);
  return value === 'on' || value === 'off' ? value : 'unset';
}

export function writePushPreference(value) {
  if (value !== 'on' && value !== 'off') throw new Error('Thông báo đẩy phải là on hoặc off.');
  return AsyncStorage.setItem(PUSH_KEY, value);
}

export async function readNotificationSound() {
  return (await AsyncStorage.getItem(SOUND_KEY)) !== 'off';
}

export function writeNotificationSound(enabled) {
  return AsyncStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off');
}
