import { Platform } from 'react-native';

import { clearPushToken, readPushToken, writePushToken } from '@/shared/storage/push.storage';

import { registerPushDevice, unregisterPushDevice } from './api/push.api';

let pendingRegistration;
const pausedUsers = new Set();

export function setPushRegistrationPaused(user, paused) {
  if (!user) return;
  if (paused) pausedUsers.add(user.id);
  else pausedUsers.delete(user.id);
}

export function registerPushForSession(user, device, isCurrent, register = registerPushDevice) {
  const previous = pendingRegistration;
  const operation = (async () => {
    await previous?.catch(() => {});
    if (!isCurrent() || pausedUsers.has(user.id)) return;
    // Remember the token even if the server saves it and the response is lost.
    await writePushToken(user.id, device.deviceToken);
    if (isCurrent() && !pausedUsers.has(user.id)) await register(device);
  })();
  pendingRegistration = operation;
  return operation.finally(() => {
    if (pendingRegistration === operation) pendingRegistration = undefined;
  });
}

export async function removePushForSession(user, accessToken) {
  if ((Platform.OS !== 'android' && Platform.OS !== 'ios') || !user?.id || !accessToken) return;
  await pendingRegistration?.catch(() => {});
  const deviceToken = await readPushToken(user.id);
  if (!deviceToken) return;
  await unregisterPushDevice(deviceToken, accessToken);
  await clearPushToken(user.id);
}
