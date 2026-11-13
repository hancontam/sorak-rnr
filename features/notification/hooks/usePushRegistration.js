import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { withAccountSession } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { notificationAccount } from '@/features/auth/utils/linked-accounts';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { registerPushDevice } from '../api/push.api';
import { pushAccounts, pushProjectId, registerPushForSession } from '../push-registration';
import { usePushPreferenceStore } from './usePushPreference';

// Chỉ dùng quyền đã có; việc hỏi quyền nằm ở sheet giới thiệu hoặc màn Cài đặt > Thông báo.
async function getDeviceToken(channelName, isCurrent) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: channelName,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const permission = await Notifications.getPermissionsAsync();
  const allowed =
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!allowed || !isCurrent()) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId: pushProjectId })).data;
}

export function usePushRegistration() {
  const t = useTranslation();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const linkedAccounts = useAuthStore((state) => state.linkedAccounts);
  const queryClient = useQueryClient();
  const channelName = t('Thông báo');
  const preference = usePushPreferenceStore((state) => state.preference);

  useEffect(() => {
    if (status !== 'signed-in' || !user?.id || preference !== 'on') return;
    let active = true;
    let pending = false;
    const isCurrent = () =>
      active &&
      useAuthStore.getState().status === 'signed-in' &&
      useAuthStore.getState().user === user;

    async function register() {
      if (!isCurrent() || pending) return;
      pending = true;
      try {
        const deviceToken = await getDeviceToken(channelName, isCurrent);
        if (!deviceToken || !isCurrent()) return;
        const device = {
          deviceToken,
          platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
          deviceName: Device.modelName || (Platform.OS === 'ios' ? 'iOS' : 'Android'),
        };
        for (const account of pushAccounts(user, linkedAccounts)) {
          const stillLinked = () =>
            isCurrent() &&
            useAuthStore
              .getState()
              .linkedAccounts.some((item) => item.id === account.id && !item.requiresLogin);
          try {
            await registerPushForSession(account, device, stillLinked, (body) =>
              withAccountSession(account.id, (access) => registerPushDevice(body, access))
            );
          } catch {
            /* Retry this account next foreground; other children can still register. */
          }
        }
      } catch {
        // Notification setup should never block sign-in. Retry on the next foreground.
      } finally {
        pending = false;
      }
    }

    if (AppState.currentState === 'active') void register();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void register();
    });
    const received = Notifications.addNotificationReceivedListener((notification) => {
      const target = notificationAccount(
        useAuthStore.getState().linkedAccounts,
        user,
        notification.request.content.data
      );
      if (!isCurrent() || (user.role !== AUTH_ROLES.teacher && target !== user.id)) return;
      void queryClient.invalidateQueries({ queryKey: ['notification-inbox', user.id] });
    });
    return () => {
      active = false;
      appState.remove();
      received.remove();
    };
  }, [channelName, linkedAccounts, preference, queryClient, status, user]);

  useEffect(() => {
    if (status === 'signed-out') void Notifications.dismissAllNotificationsAsync().catch(() => {});
  }, [status]);
}
