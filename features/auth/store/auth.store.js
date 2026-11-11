import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  status: 'restoring',
  user: null,
  linkedAccounts: [],
  activeAccountId: null,
  error: '',
  notice: '',
  loginSucceeded: false,
  dismissLoginSuccess: () => set({ loginSucceeded: false }),
}));
