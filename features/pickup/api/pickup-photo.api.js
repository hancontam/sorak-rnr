import { Platform } from 'react-native';

import { apiClient } from '@/shared/api/client';

export async function uploadPickupPhoto(asset, signal) {
  const form = new FormData();
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('Chưa đọc được tệp ảnh đã chọn.');
    form.append('file', asset.file);
  } else {
    form.append('file', {
      uri: asset.uri,
      name: asset.fileName || 'pickup.jpg',
      type: asset.mimeType || 'image/jpeg',
    });
  }
  const response = await apiClient.post('/upload/pickup', form, {
    signal,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = response.data?.data;
  const url = data?.url || data?.relativeUrl;
  if (response.data?.success !== true || typeof url !== 'string' || !url) {
    throw new Error('Máy chủ chưa trả đường dẫn ảnh. Hãy thử tải lại.');
  }
  return url;
}
