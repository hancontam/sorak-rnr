import { loginWithPassword } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { saveSessionTokens } from '@/shared/storage/auth.storage';
import { useMutation } from '@tanstack/react-query';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password, role }) => {
      const payload = await loginWithPassword({ username, password, role });

      if (payload?.requires2FA) {
        return { kind: 'requires-2fa', tempToken: payload.tempToken };
      }

      if (payload?.user?.role === 'PRINCIPAL_BGH') {
        return { kind: 'web-only' };
      }

      if (payload?.user?.role !== role) {
        throw new Error('Tài khoản không thuộc loại đã chọn. Vui lòng chọn lại loại tài khoản.');
      }

      const { accessToken, refreshToken, user } = payload;
      if (!accessToken || !refreshToken || !user) {
        throw new Error('Phản hồi đăng nhập thiếu thông tin phiên.');
      }

      await saveSessionTokens({ accessToken, refreshToken });
      useAuthStore.getState().setSession({ user, accessToken });
      return { kind: 'success', user };
    },
  });
}
