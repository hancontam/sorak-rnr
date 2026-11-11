import { apiClient } from '@/shared/api/client';

const path = '/notifications/device-token';

export async function registerPushDevice(device, accessToken) {
  const config = accessToken
    ? { skipSession: true, headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;
  const { data } = await apiClient.post(path, device, config);
  if (data?.success !== true) throw new Error('Push registration was not confirmed');
}

export async function unregisterPushDevice(deviceToken, accessToken) {
  const { data } = await apiClient.delete(path, {
    data: { deviceToken },
    skipSession: true,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (data?.success !== true) throw new Error('Push removal was not confirmed');
}
