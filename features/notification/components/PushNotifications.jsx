import * as Notifications from 'expo-notifications';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { notificationAccount } from '@/features/auth/utils/linked-accounts';

import { supportsPush, usePushRegistration } from '../hooks/usePushRegistration';
import { usePushResponse } from '../hooks/usePushResponse';

if (supportsPush) {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const { status, user, linkedAccounts } = useAuthStore.getState();
      const target = notificationAccount(linkedAccounts, user, notification.request.content.data);
      const show =
        status === 'signed-in' &&
        (user?.role === AUTH_ROLES.teacher ||
          linkedAccounts.some((account) => account.id === target && !account.requiresLogin));
      return {
        shouldShowBanner: show,
        shouldShowList: show,
        shouldPlaySound: show,
        shouldSetBadge: false,
      };
    },
  });
}

export default function PushNotifications() {
  return supportsPush ? <NativePushNotifications /> : null;
}

function NativePushNotifications() {
  usePushRegistration();
  const response = Notifications.useLastNotificationResponse();
  usePushResponse(response);
  return null;
}
