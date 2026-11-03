import { verifyLoginOtp } from '@/features/auth/api/auth.api';
import { persistAuthenticatedSession } from '@/features/auth/store/auth.store';
import { useMutation } from '@tanstack/react-query';

export function useLoginOtp() {
  return useMutation({
    mutationFn: async ({ tempToken, otp, role }) => {
      const payload = await verifyLoginOtp({ tempToken, otp });
      return persistAuthenticatedSession(payload, role);
    },
  });
}
