import { apiClient } from '@/shared/api/client';

const STAGING_API_URLS = new Set([
  'https://testmamnonhontre.sorak.io.vn/api',
  'https://test2mamnonhontre.sorak.io.vn/api',
]);

function getStagingTurnstileToken() {
  const baseURL = apiClient.defaults.baseURL?.replace(/\/+$/, '');

  if (!STAGING_API_URLS.has(baseURL)) {
    throw new Error('The staging CAPTCHA bypass cannot be used with this API URL');
  }

  return 'sorak-mobile-bypass';
}

export async function loginWithPassword({ username, password, turnstileToken }) {
  const response = await apiClient.post('/auth/login', {
    username,
    password,
    turnstileToken: turnstileToken ?? getStagingTurnstileToken(),
  });

  return response.data.data;
}

export async function verifyLoginTotp({ tempToken, totpCode }) {
  const response = await apiClient.post('/auth/verify-2fa', { tempToken, totpCode });
  return response.data.data;
}

export async function requestPasswordReset(email) {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data.data;
}

export async function verifyPasswordResetOtp({ email, otp }) {
  const response = await apiClient.post('/auth/verify-otp', { email, otp });
  return response.data.data;
}

export async function resetPassword({ resetToken, newPassword }) {
  const response = await apiClient.post('/auth/reset-password', { resetToken, newPassword });
  return response.data.data;
}
