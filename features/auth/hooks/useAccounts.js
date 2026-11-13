import { useRef, useState } from 'react';

import { signOut, switchAccount } from '../session';
import { useAuthStore } from '../store/auth.store';
import { AUTH_ROLES } from '../utils/auth-roles';

export function useAccounts() {
  const linkedAccounts = useAuthStore((state) => state.linkedAccounts);
  const activeId = useAuthStore((state) => state.activeAccountId);
  const status = useAuthStore((state) => state.status);
  const notice = useAuthStore((state) => state.notice);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);

  async function run(action) {
    if (pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
      return true;
    } catch (failure) {
      if (failure.code !== 'ERR_CANCELED')
        setError('Chưa thực hiện được thao tác. Kiểm tra kết nối rồi thử lại.');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return {
    accounts: linkedAccounts.filter((account) => account.role === AUTH_ROLES.parent),
    activeId,
    status,
    error,
    notice,
    busy,
    choose: (id) => run(() => switchAccount(id)),
    remove: (id) => run(() => signOut(id)),
  };
}
