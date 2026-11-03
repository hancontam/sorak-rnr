import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'sorak-mobile-session';

export async function saveSessionTokens({ accessToken, refreshToken }) {
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ accessToken, refreshToken }));
}

export async function getSessionTokens() {
  if (Platform.OS === 'web') return null;
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearSessionTokens() {
  if (Platform.OS === 'web') return;
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
