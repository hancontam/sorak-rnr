import axios from 'axios';
import { Platform } from 'react-native';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL');
}

const headers = { 'Content-Type': 'application/json' };

if (Platform.OS === 'android' || Platform.OS === 'ios') {
  headers['X-Client-Platform'] = Platform.OS;
}

export const apiClient = axios.create({ baseURL, headers });

let sessionHandlers = null;
let refreshPromise = null;

export function configureSessionClient(handlers) {
  sessionHandlers = handlers;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = sessionHandlers?.getAccessToken();
  if (!config.skipAuth && accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  if (
    error.response?.status !== 401 ||
    !original ||
    original.skipAuth ||
    original._retriedAfterRefresh ||
    !original.headers?.Authorization ||
    !sessionHandlers
  ) {
    return Promise.reject(error);
  }

  original._retriedAfterRefresh = true;
  try {
    refreshPromise ??= sessionHandlers.refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const accessToken = await refreshPromise;
    original.headers.Authorization = `Bearer ${accessToken}`;
    return apiClient(original);
  } catch (refreshError) {
    if ([401, 403].includes(refreshError.response?.status)) {
      await sessionHandlers.onSessionExpired();
    }
    return Promise.reject(refreshError);
  }
});
