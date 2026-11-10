import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';

import { uploadPickupPhoto } from '../api/pickup-photo.api';

export function usePickupPhoto() {
  const user = useAuthStore((state) => state.user);
  const [asset, setAsset] = useState(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const operation = useRef(null);
  const picking = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      operation.current?.abort();
    };
  }, []);
  const current = () => mounted.current && useAuthStore.getState().user === user;

  async function upload(next) {
    if (!current() || operation.current) return;
    const controller = new AbortController();
    operation.current = controller;
    setBusy(true);
    setError('');
    try {
      const uploadedUrl = await uploadPickupPhoto(next, controller.signal);
      if (current()) setUrl(uploadedUrl);
    } catch (failure) {
      if (current() && !controller.signal.aborted) {
        setError(
          failure.response?.status === 413
            ? 'Ảnh quá lớn. Hãy chọn ảnh dưới 2 MB.'
            : 'Chưa tải được ảnh. Thử lại hoặc bỏ ảnh trước khi gửi đơn.'
        );
      }
    } finally {
      operation.current = null;
      if (current()) setBusy(false);
    }
  }

  async function choose(camera) {
    if (picking.current || operation.current) return;
    picking.current = true;
    setBusy(true);
    setError('');
    let next;
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          if (current())
            setError('Cho phép Camera trong cài đặt để chụp ảnh, hoặc chọn ảnh từ thư viện.');
          return;
        }
      }
      if (!current()) return;
      const options = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        exif: false,
      };
      const result = await (camera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));
      if (!current() || result.canceled) return;
      next = result.assets?.[0];
      if (!next?.uri) throw new Error('Không đọc được ảnh đã chọn.');
      if (next.fileSize > 2 * 1024 * 1024)
        throw new Error('Chọn ảnh dưới 2 MB; có thể cắt ảnh nhỏ hơn.');
      if (
        next.mimeType &&
        !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(next.mimeType)
      ) {
        throw new Error('Chọn ảnh JPG, PNG hoặc WebP.');
      }
      setAsset(next);
      setUrl('');
    } catch (failure) {
      next = null;
      if (current()) setError(failure.message || 'Không mở được camera hoặc thư viện ảnh.');
    } finally {
      picking.current = false;
      if (current()) setBusy(false);
    }
    if (next && current()) await upload(next);
  }

  function remove() {
    if (picking.current || operation.current) return;
    setAsset(null);
    setUrl('');
    setError('');
  }

  return {
    asset,
    url,
    busy,
    error,
    choose,
    remove,
    retry: () => asset && upload(asset),
    ready: !asset || Boolean(url),
  };
}
