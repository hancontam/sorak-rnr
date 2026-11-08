import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  status: 'restoring',
  user: null,
  error: '',
  notice: '',
  loginSucceeded: false,
  dismissLoginSuccess: () => set({ loginSucceeded: false }),
}));
