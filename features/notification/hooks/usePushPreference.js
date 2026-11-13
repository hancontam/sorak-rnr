import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { create } from 'zustand';

import { withAccountSession } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  readNotificationSound,
  readPushPreference,
  writeNotificationSound,
  writePushPreference,
} from '@/shared/storage/preferences.storage';

import { pushAccounts, removePushForSession, supportsPush } from '../push-registration';

// Lựa chọn của máy này; token và đăng ký vẫn do usePushRegistration xử lý theo từng phiên.
export const usePushPreferenceStore = create(() => ({
  preference: 'unset',
  sound: true,
  ready: false,
}));

const UNSUPPORTED = { status: 'unsupported', granted: false, canAskAgain: false };

async function readPermission() {
  if (!supportsPush) return UNSUPPORTED;
  const permission = await Notifications.getPermissionsAsync();
  const granted =
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  return { status: permission.status, granted, canAskAgain: permission.canAskAgain !== false };
}

export function useRestorePushPreference() {
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        let [preference, sound] = await Promise.all([
          readPushPreference(),
          readNotificationSound(),
        ]);
        // Máy đã cấp quyền từ bản trước (tự hỏi khi đăng nhập) thì giữ nguyên trạng thái đang nhận.
        if (preference === 'unset' && (await readPermission()).granted) {
          preference = 'on';
          await writePushPreference('on');
        }
        if (active) usePushPreferenceStore.setState({ preference, sound, ready: true });
      } catch {
        if (active) usePushPreferenceStore.setState({ ready: true });
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, []);
}

// Trạng thái quyền hệ thống, làm mới mỗi lần app trở lại để phản ánh thay đổi trong Cài đặt máy.
export function usePushPermission() {
  const [permission, setPermission] = useState(null);
  const refresh = useCallback(async () => {
    try {
      setPermission(await readPermission());
    } catch {
      setPermission(UNSUPPORTED);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);
  return { permission, refresh };
}

export function usePushSettings() {
  const { preference, sound, ready } = usePushPreferenceStore();
  const { permission, refresh } = usePushPermission();
  const [busy, setBusy] = useState(false);
  const enabled = preference === 'on' && Boolean(permission?.granted);

  // Trả về 'enabled', 'denied' (người dùng từ chối lần này) hoặc 'blocked' (phải mở Cài đặt máy).
  async function enable() {
    if (!supportsPush || busy) return 'unsupported';
    setBusy(true);
    try {
      let current = await readPermission();
      if (!current.granted && current.canAskAgain) {
        await Notifications.requestPermissionsAsync();
        current = await readPermission();
      }
      await refresh();
      if (!current.granted) {
        await writePushPreference('off');
        usePushPreferenceStore.setState({ preference: 'off' });
        return current.canAskAgain ? 'denied' : 'blocked';
      }
      await writePushPreference('on');
      usePushPreferenceStore.setState({ preference: 'on' });
      return 'enabled';
    } finally {
      setBusy(false);
    }
  }

  // Gỡ token của các tài khoản trên máy này khỏi máy chủ; lỗi thì giữ trạng thái đang bật.
  async function disable() {
    if (busy) return;
    setBusy(true);
    const previous = usePushPreferenceStore.getState().preference;
    usePushPreferenceStore.setState({ preference: 'off' });
    try {
      const { user, linkedAccounts } = useAuthStore.getState();
      for (const account of pushAccounts(user, linkedAccounts)) {
        await withAccountSession(account.id, (access) => removePushForSession(account, access));
      }
      await writePushPreference('off');
    } catch (error) {
      usePushPreferenceStore.setState({ preference: previous });
      throw error;
    } finally {
      setBusy(false);
    }
  }

  // "Để sau" ở sheet giới thiệu: không hỏi quyền hệ thống, có thể bật lại trong Cài đặt.
  async function decline() {
    usePushPreferenceStore.setState({ preference: 'off' });
    await writePushPreference('off').catch(() => {});
  }

  async function setSound(next) {
    usePushPreferenceStore.setState({ sound: next });
    try {
      await writeNotificationSound(next);
    } catch (error) {
      usePushPreferenceStore.setState({ sound: !next });
      throw error;
    }
  }

  return {
    supported: supportsPush,
    ready: (ready || !supportsPush) && Boolean(permission),
    preference,
    permission,
    enabled,
    sound,
    busy,
    enable,
    disable,
    decline,
    setSound,
    openSystemSettings: () => Linking.openSettings(),
  };
}
