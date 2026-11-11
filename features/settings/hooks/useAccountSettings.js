import { useMutation, useQuery } from '@tanstack/react-query';

import { revokeAllSessionsAndSignOut } from '@/features/auth/session';
import { useAuthStore } from '@/features/auth/store/auth.store';

import {
  changePassword,
  confirmTwoFactor,
  getDeviceSessions,
  requestTwoFactorCode,
} from '../api/settings.api';

export function useDeviceSessions() {
  const userId = useAuthStore((state) => state.user?.id);
  const sessions = useQuery({
    queryKey: ['settings', 'sessions', userId],
    queryFn: ({ signal }) => getDeviceSessions(signal),
    enabled: Boolean(userId),
  });
  const revokeAll = useMutation({ mutationFn: revokeAllSessionsAndSignOut, gcTime: 0 });
  return { sessions, revokeAll };
}

export function useChangePassword() {
  return useMutation({ mutationFn: changePassword, gcTime: 0 });
}

export function useTwoFactorSettings() {
  const sendCode = useMutation({ mutationFn: requestTwoFactorCode, gcTime: 0 });
  const update = useMutation({
    mutationFn: async (values) => {
      const user = useAuthStore.getState().user;
      const enabled = await confirmTwoFactor(values);
      useAuthStore.setState((state) =>
        state.user?.id === user?.id && state.status === 'signed-in'
          ? { user: { ...state.user, is_2fa_enabled: enabled } }
          : state
      );
    },
    gcTime: 0,
  });
  return { sendCode, update };
}
