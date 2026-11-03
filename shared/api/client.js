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
