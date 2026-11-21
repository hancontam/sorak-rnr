import * as Notifications from 'expo-notifications';
import { useNavigationContainerRef, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { switchAccount } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { notificationAccount } from '@/features/auth/utils/linked-accounts';

// Expo Router đặt mọi route dưới "__root", nên phải tìm route cần mở trong state lồng nhau thay vì
// chỉ đọc routeNames ở gốc (ở gốc chỉ có __root, +not-found, _sitemap).
function hasRoute(state, name) {
  if (!state) return false;
  return (
    Boolean(state.routeNames?.includes(name)) ||
    Boolean(state.routes?.some((route) => hasRoute(route.state, name)))
  );
}

export function usePushResponse(response) {
  const navigation = useNavigationContainerRef();
  const router = useRouter();
  const queryClient = useQueryClient();
  const handled = useRef(null);

  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const { request } = response.notification;
    let working = false;
    let disposed = false;
    let loginShown = false;
    let retryAfterSwitch;

    function consume() {
      handled.current = request.identifier;
      Notifications.clearLastNotificationResponse();
    }

    async function process() {
      if (disposed || working || handled.current === request.identifier || !navigation.isReady())
        return;
      const state = useAuthStore.getState();
      if (!['signed-in', 'signed-out'].includes(state.status)) return;
      const teacher = state.user?.role === AUTH_ROLES.teacher;
      const targetId = teacher
        ? state.user.id
        : notificationAccount(state.linkedAccounts, state.user, request.content.data);
      if (!targetId) {
        consume();
        return;
      }
      const target = state.linkedAccounts.find((account) => account.id === targetId);
      const root = navigation.getRootState();
      if (target?.requiresLogin) {
        const path = state.status === 'signed-in' ? '/add-account' : '/auth/login';
        if (!hasRoute(root, path.slice(1)) || loginShown) return;
        loginShown = true;
        router.push({ pathname: path, params: { role: AUTH_ROLES.parent, accountId: targetId } });
        return;
      }
      working = true;
      try {
        if (state.user?.id !== targetId) {
          await switchAccount(targetId);
          // Account changes remount the guarded stack. Wait for its navigation state.
          retryAfterSwitch = setTimeout(() => void process(), 50);
          return;
        }
        const group = teacher ? '(teacher)' : '(parent)';
        if (!hasRoute(root, group)) return;
        consume();
        void queryClient.invalidateQueries({ queryKey: ['notification-inbox', targetId] });
        router.navigate(teacher ? '/(teacher)/notifications' : '/(parent)/notifications');
      } catch (error) {
        const current = useAuthStore.getState();
        if (
          error.code === 'ERR_CANCELED' ||
          current.linkedAccounts.find((account) => account.id === targetId)?.requiresLogin
        ) {
          retryAfterSwitch = setTimeout(() => void process(), 50);
        } else {
          // A network failure must not silently open the current child's inbox.
          consume();
        }
      } finally {
        working = false;
      }
    }

    const unsubscribeNavigation = navigation.addListener('state', () => void process());
    const unsubscribeSession = useAuthStore.subscribe(() => void process());
    void process();
    return () => {
      disposed = true;
      clearTimeout(retryAfterSwitch);
      unsubscribeNavigation();
      unsubscribeSession();
    };
  }, [navigation, queryClient, response, router]);
}
