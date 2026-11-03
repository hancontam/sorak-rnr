import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_MODE_KEY = '@sorak/theme-mode';
const THEME_MODES = new Set(['system', 'light', 'dark']);

export async function readThemeMode() {
  const value = await AsyncStorage.getItem(THEME_MODE_KEY);
  return THEME_MODES.has(value) ? value : 'system';
}

export async function saveThemeMode(value) {
  if (!THEME_MODES.has(value)) throw new Error('Chế độ giao diện không hợp lệ.');
  await AsyncStorage.setItem(THEME_MODE_KEY, value);
}
