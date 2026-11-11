import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const INDEX_KEY = 'sorak.accounts.v1';

function tokenKey(id) {
  if (typeof id !== 'string' || !id) throw new Error('Thiếu định danh tài khoản.');
  // SecureStore keys only accept alphanumeric characters, '.', '-' and '_'.
  return `sorak.account.v1.${Array.from(id, (char) => char.codePointAt(0).toString(16)).join('-')}`;
}

export async function readAccountIndex() {
  const raw = await AsyncStorage.getItem(INDEX_KEY);
  if (!raw) return { accounts: [], activeId: null, initialized: false };
  const index = JSON.parse(raw);
  if (
    !Array.isArray(index.accounts) ||
    index.accounts.some(
      (account) =>
        typeof account?.id !== 'string' ||
        !account.id ||
        !['TEACHER_GV', 'PARENT_PH'].includes(account.role)
    ) ||
    new Set(index.accounts.map((account) => account.id)).size !== index.accounts.length
  ) {
    throw new Error('Không đọc được danh sách tài khoản đã lưu.');
  }
  return { ...index, initialized: true };
}

export function writeAccountIndex(accounts, activeId) {
  // Only compact display metadata. Never put tokens or passwords in AsyncStorage.
  return AsyncStorage.setItem(INDEX_KEY, JSON.stringify({ accounts, activeId }));
}

export async function readAccountTokens(id) {
  const raw = await SecureStore.getItemAsync(tokenKey(id));
  if (!raw) return null;
  const pair = JSON.parse(raw);
  if (
    typeof pair?.accessToken !== 'string' ||
    !pair.accessToken ||
    typeof pair?.refreshToken !== 'string' ||
    !pair.refreshToken
  )
    throw new Error('Cặp token phiên không hợp lệ.');
  return pair;
}

export function writeAccountTokens(id, pair) {
  if (
    typeof pair?.accessToken !== 'string' ||
    !pair.accessToken ||
    typeof pair?.refreshToken !== 'string' ||
    !pair.refreshToken
  )
    throw new Error('Cặp token phiên không hợp lệ.');
  return SecureStore.setItemAsync(
    tokenKey(id),
    JSON.stringify({ accessToken: pair.accessToken, refreshToken: pair.refreshToken })
  );
}

export function removeAccountTokens(id) {
  return SecureStore.deleteItemAsync(tokenKey(id));
}
