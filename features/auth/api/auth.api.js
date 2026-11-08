import { apiClient } from '@/shared/api/client';

function readData({ data }) {
  if (data?.success !== true || !data.data || typeof data.data !== 'object') {
    throw new Error('Phản hồi xác thực không hợp lệ.');
  }
  return data.data;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readUser(user) {
  if (!nonEmptyString(user?.id) || !nonEmptyString(user.role)) {
    throw new Error('Máy chủ chưa trả đủ thông tin tài khoản.');
  }
  return user;
}

function readTokens(data) {
  const { accessToken, refreshToken } = data;
  if (!nonEmptyString(accessToken) || !nonEmptyString(refreshToken)) {
    throw new Error('Máy chủ chưa trả đủ token cho ứng dụng.');
  }
  return { accessToken, refreshToken };
}

function readSession(data) {
  return { user: readUser(data.user), tokens: readTokens(data) };
}

export function getChallengeUrl() {
  return `${apiClient.defaults.baseURL}/auth/mobile-challenge`;
}

export async function login({ username, password, role, captchaToken }, signal) {
  const response = await apiClient.post(
    '/auth/login',
    { username, password, role, captchaToken },
    { skipSession: true, signal }
  );
  const data = readData(response);
  if (data.requires2FA === true) {
    if (!nonEmptyString(data.tempToken)) throw new Error('Thiếu mã phiên xác thực.');
    return { tempToken: data.tempToken, emailMasked: data.emailMasked };
  }
  return readSession(data);
}

export async function verifyLoginOtp({ tempToken, otp }, signal) {
  const response = await apiClient.post(
    '/auth/verify-2fa',
    { tempToken, otp },
    { skipSession: true, signal }
  );
  return readSession(readData(response));
}

export async function requestPasswordReset(identifier, signal) {
  const data = readData(
    await apiClient.post('/auth/forgot-password', { identifier }, { skipSession: true, signal })
  );
  if (data.contactAdmin) return { support: 'admin' };
  if (data.role && data.role !== 'TEACHER_GV') return { support: 'role' };
  if (data.contactTeacher || data.hasEmail === false) return { support: 'admin' };
  if (data.hasEmail !== true) throw new Error('Phản hồi gửi mã xác thực không hợp lệ.');
  const emailMasked = /^[^@\s]*\*[^@\s]*@[^@\s]+$/.test(data.emailMasked ?? '')
    ? data.emailMasked
    : '';
  return { emailMasked };
}

export async function verifyPasswordResetOtp({ identifier, otp }, signal) {
  // Backend gọi trường này là email nhưng chấp nhận mã cán bộ.
  const data = readData(
    await apiClient.post(
      '/auth/verify-otp',
      { email: identifier, otp },
      { skipSession: true, signal }
    )
  );
  if (!nonEmptyString(data.resetToken)) throw new Error('Phản hồi thiếu mã đặt lại mật khẩu.');
  return data.resetToken;
}

export async function resetPassword({ identifier, resetToken, password }, signal) {
  readData(
    await apiClient.post(
      '/auth/reset-password',
      { email: identifier, resetToken, password },
      { skipSession: true, signal }
    )
  );
}

export async function getCurrentUser() {
  return readUser(readData(await apiClient.get('/auth/me')).user);
}

export async function refreshTokens(refreshToken) {
  const response = await apiClient.post('/auth/refresh', { refreshToken }, { skipSession: true });
  return readTokens(readData(response));
}

export async function revokeSession({ accessToken, refreshToken }) {
  const response = await apiClient.post(
    '/auth/logout',
    { refreshToken },
    { skipSession: true, headers: { Authorization: `Bearer ${accessToken}` } }
  );
  readData(response);
}
