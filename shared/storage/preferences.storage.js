import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'sorak.preferences.theme.v1';
const LANGUAGE_KEY = 'sorak.preferences.language.v1';
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
