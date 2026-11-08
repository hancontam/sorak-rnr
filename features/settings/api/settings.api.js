import { apiClient } from '@/shared/api/client';

function readData({ data }) {
  if (data?.success !== true || !data.data || typeof data.data !== 'object') {
    throw new Error('Phản hồi cài đặt không hợp lệ.');
  }
  return data.data;
}

export async function getDeviceSessions(signal) {
  const data = readData(
    await apiClient.get('/auth/sessions', { identifyCurrentSession: true, signal })
  );
  if (!Array.isArray(data.sessions)) throw new Error('Thiếu danh sách phiên đăng nhập.');

  // Context API có thể trả một phiên ảo khi tài khoản không còn refresh token.
  return data.sessions.filter(
    (session) => typeof session?.id === 'string' && session.id !== 'current'
  );
}

export async function changePassword(values) {
  readData(await apiClient.post('/auth/change-password', values));
}

export async function requestTwoFactorCode() {
  readData(await apiClient.post('/auth/2fa/request-enable'));
}

export async function confirmTwoFactor({ enabled, value }) {
  const response = enabled
    ? await apiClient.post('/auth/2fa/disable', { password: value })
    : await apiClient.post('/auth/2fa/confirm-enable', { otp: value });
  const { is_2fa_enabled: nextEnabled } = readData(response);
  if (typeof nextEnabled !== 'boolean' || nextEnabled === enabled) {
    throw new Error('Chưa xác nhận được trạng thái xác thực hai bước.');
  }
  return nextEnabled;
}
