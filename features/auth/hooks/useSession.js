import { getCurrentUser, logoutSession, refreshSession } from '@/features/auth/api/auth.api';
import { isMobileRole, useAuthStore } from '@/features/auth/store/auth.store';
import { configureSessionClient } from '@/shared/api/client';
import {
  clearSessionTokens,
  getSessionTokens,
  saveSessionTokens,
} from '@/shared/storage/auth.storage';
import * as React from 'react';

async function clearLocalSession() {
  await clearSessionTokens();
  useAuthStore.getState().clearSession();
}

async function refreshAccessToken() {
  const stored = await getSessionTokens();
  if (!stored?.refreshToken) throw new Error('Không tìm thấy phiên đăng nhập.');

  const session = await refreshSession(stored.refreshToken);
  if (!session?.accessToken || !session?.refreshToken) {
    throw new Error('Phản hồi làm mới phiên thiếu token.');
  }

  await saveSessionTokens(session);
  useAuthStore.getState().setAccessToken(session.accessToken);
  return session.accessToken;
}

configureSessionClient({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken,
  onSessionExpired: clearLocalSession,
});

export function useRestoreSession() {
  React.useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const stored = await getSessionTokens();
        if (!stored?.accessToken || !stored?.refreshToken) return;

        useAuthStore.getState().setAccessToken(stored.accessToken);
        const user = await getCurrentUser();
        if (!isMobileRole(user.role)) {
          await clearLocalSession();
          return;
        }
        if (active) {
          useAuthStore.getState().setSession({
            user,
            accessToken: useAuthStore.getState().accessToken,
          });
        }
      } catch (error) {
        if (error.response?.status === 401) await clearLocalSession();
      } finally {
        if (active) useAuthStore.getState().finishRestoring();
      }
    }

    restore();
    return () => {
      active = false;
    };
  }, []);
}

export async function signOut() {
  try {
    const stored = await getSessionTokens();
    if (!stored?.refreshToken) return;
    try {
      await logoutSession(
        stored.refreshToken,
        useAuthStore.getState().accessToken || stored.accessToken
      );
    } catch (error) {
      if (error.response?.status !== 401) throw error;
      const accessToken = await refreshAccessToken();
      const current = await getSessionTokens();
      await logoutSession(current.refreshToken, accessToken);
    }
  } finally {
    await clearLocalSession();
  }
}
