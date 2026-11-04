import { apiClient } from '@/shared/api/client';

export function getMobileChallengeUrl() {
  const baseURL = apiClient.defaults.baseURL?.replace(/\/+$/, '');
  if (!baseURL?.startsWith('https://')) {
    throw new Error('Trang xác minh bảo mật cần API HTTPS.');
  }
  return `${baseURL}/auth/mobile-challenge`;
}

export async function loginWithPassword({ username, password, role, captchaToken }) {
  if (!captchaToken) throw new Error('Vui lòng hoàn tất xác minh bảo mật.');
  const response = await apiClient.post(
    '/auth/login',
    {
      username,
      password,
      role,
      captchaToken,
    },
    { skipAuth: true }
  );

  return response.data.data;
}

export async function verifyLoginOtp({ tempToken, otp }) {
  const response = await apiClient.post('/auth/verify-2fa', { tempToken, otp }, { skipAuth: true });
  return response.data.data;
}

export async function requestPasswordReset(identifier) {
  const response = await apiClient.post(
    '/auth/forgot-password',
    { identifier },
    { skipAuth: true }
  );
  return response.data.data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const response = await apiClient.post('/auth/verify-otp', { email, otp }, { skipAuth: true });
  return response.data.data;
}

export async function resetPassword({ email, resetToken, password }) {
  const response = await apiClient.post(
    '/auth/reset-password',
    { email, resetToken, password },
    { skipAuth: true }
  );
  return response.data.data;
}

export async function refreshSession(refreshToken) {
  const response = await apiClient.post('/auth/refresh', { refreshToken }, { skipAuth: true });
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me');
  const user = response.data.data?.user;
  if (!user) throw new Error('Phản hồi hồ sơ thiếu thông tin người dùng.');
  return user;
}

export async function logoutSession(refreshToken, accessToken) {
  const response = await apiClient.post(
    '/auth/logout',
    { refreshToken },
    {
      skipAuth: true,
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data.data;
}

export async function requestEnableTwoFactor() {
  const response = await apiClient.post('/auth/2fa/request-enable');
  return response.data.data;
}

export async function confirmEnableTwoFactor(otp) {
  const response = await apiClient.post('/auth/2fa/confirm-enable', { otp });
  return response.data.data;
}

export async function disableTwoFactor(password) {
  const response = await apiClient.post('/auth/2fa/disable', { password });
  return response.data.data;
}
