import { apiClient } from '@/shared/api/client';

const path = '/notifications/device-token';

export async function registerPushDevice(device, accessToken) {
  const config = accessToken
    ? { skipSession: true, headers: { Authorization: `Bearer ${accessToken}` } }
    : undefined;
  const { data } = await apiClient.post(path, device, config);
  if (data?.success !== true) throw new Error('Push registration was not confirmed');
}

// Backend nhận refresh token của phiên đã đăng ký token, nên gỡ được cả khi access token đã hết hạn
// hoặc phiên đã bị thu hồi (test2 21/11), không cần làm mới phiên trước.
export async function unregisterPushDevice(deviceToken, { accessToken, refreshToken }) {
  const { data } = await apiClient.delete(path, {
    data: { deviceToken, refreshToken },
    skipSession: true,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (data?.success !== true) throw new Error('Push removal was not confirmed');
}
