import axios from 'axios';
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

const headers = { Accept: 'application/json' };
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  headers['X-Client-Platform'] = Platform.OS;
}

export const apiClient = axios.create({
  baseURL: apiUrl.replace(/\/+$/, ''),
  timeout: 15000,
  headers,
});
