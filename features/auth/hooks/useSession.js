import { signOut } from '../session';
import { useAuthStore } from '../store/auth.store';

export function useSession() {
  const user = useAuthStore((state) => state.user);
  const notice = useAuthStore((state) => state.notice);
  const loginSucceeded = useAuthStore((state) => state.loginSucceeded);
  const dismissLoginSuccess = useAuthStore((state) => state.dismissLoginSuccess);
  return { user, notice, signOut, loginSucceeded, dismissLoginSuccess };
}
