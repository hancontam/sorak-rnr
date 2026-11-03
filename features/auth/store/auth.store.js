import { create } from 'zustand';
import { saveSessionTokens } from '@/shared/storage/auth.storage';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isRestoring: true,
  setAccessToken: (accessToken) => set({ accessToken }),
  setSession: ({ user, accessToken }) => set({ user, accessToken }),
  updateUser: (changes) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...changes } : null,
    })),
  finishRestoring: () => set({ isRestoring: false }),
  clearSession: () => set({ user: null, accessToken: null }),
}));

export async function persistAuthenticatedSession(
  { user, accessToken, refreshToken },
  expectedRole
) {
  if (user?.role === 'PRINCIPAL_BGH' || user?.role === 'ADMIN_BGH') {
    return { kind: 'web-only' };
  }
  if (user?.role !== expectedRole) {
    throw new Error('Tài khoản không thuộc loại đã chọn. Vui lòng chọn lại loại tài khoản.');
  }
  if (!accessToken || !refreshToken || !user) {
    throw new Error('Phản hồi đăng nhập thiếu thông tin phiên.');
  }

  await saveSessionTokens({ accessToken, refreshToken });
  useAuthStore.getState().setSession({ user, accessToken });
  return { kind: 'success', user };
}
