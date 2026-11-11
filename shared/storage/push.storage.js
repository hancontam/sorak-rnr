import * as SecureStore from 'expo-secure-store';

const key = (accountId) => `sorak.push.v1.${accountId}`;

export function readPushToken(accountId) {
  return SecureStore.getItemAsync(key(accountId));
}

export function writePushToken(accountId, token) {
  return SecureStore.setItemAsync(key(accountId), token);
}

export function clearPushToken(accountId) {
  return SecureStore.deleteItemAsync(key(accountId));
}
