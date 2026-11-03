import { loginWithPassword } from '@/features/auth/api/auth.api';
import { persistAuthenticatedSession } from '@/features/auth/store/auth.store';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password, role }) => {
      const payload = await loginWithPassword({ username, password, role });

      if (payload?.requires2FA) {
        return {
          kind: 'requires-2fa',
          tempToken: payload.tempToken,
          emailMasked: payload.emailMasked,
        };
      }
      return persistAuthenticatedSession(payload, role);
    },
  });
}
