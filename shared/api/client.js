import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!apiUrl) {
  throw new Error('Thiếu EXPO_PUBLIC_API_URL. Hãy tạo .env.local theo .env.example.');
}

const parsedUrl = new URL(apiUrl);

if (
  parsedUrl.protocol !== 'https:' ||
  parsedUrl.username ||
  parsedUrl.password ||
  parsedUrl.search ||
  parsedUrl.hash
) {
  throw new Error('EXPO_PUBLIC_API_URL phải là URL HTTPS, không chứa tài khoản hoặc query/hash.');
}

// Backend đặt tên thiết bị của phiên đăng nhập theo User-Agent. Mặc định của React Native
// (okhttp/CFNetwork) không có tên hệ điều hành nên điện thoại bị ghi "Trình duyệt Web · Thiết bị".
// Dạng "Sorak/1.0.0 (Android 16; Pixel 7)" để backend nhận Android/iPhone và app nhận phiên của mình.
function appUserAgent() {
  const version = Constants.expoConfig?.version || '0';
  const osVersion = Device.osVersion || String(Platform.Version);
  const model = (Device.modelName || '').replace(/[();]/g, '').trim();
  const system =
    Platform.OS === 'ios'
      ? `${model.startsWith('iPad') ? 'iPad' : 'iPhone'}; iOS ${osVersion}`
      : `Android ${osVersion}`;
  return `Sorak/${version} (${[system, model].filter(Boolean).join('; ')})`;
}

const headers = { Accept: 'application/json' };
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  headers['X-Client-Platform'] = Platform.OS;
  headers['User-Agent'] = appUserAgent();
}

export const apiClient = axios.create({
  baseURL: apiUrl.replace(/\/+$/, ''),
  timeout: 15000,
  headers,
  // App tự giữ token (SecureStore/RAM) và gửi refresh token trong body. Nếu để mặc định, XHR của
  // React Native bật cookie jar hệ thống và gửi kèm cookie `sorak_refresh` cũ; server ưu tiên cookie
  // nên /auth/refresh trả 401 và phiên bị đăng xuất. `/auth/sessions` tự gắn cookie riêng.
  withCredentials: false,
});
