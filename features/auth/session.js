import { CanceledError } from 'axios';

import {
  removePushForSession,
  setPushRegistrationPaused,
} from '@/features/notification/push-registration';
import { apiClient } from '@/shared/api/client';
import { attachSessionInterceptors } from '@/shared/api/session-interceptors';
import {
  readAccountIndex,
  readAccountTokens,
  removeAccountTokens,
  writeAccountIndex,
  writeAccountTokens,
} from '@/shared/storage/accounts.storage';
import { clearTokens, readTokens, writeTokens } from '@/shared/storage/token.storage';

import { getCurrentUser, refreshTokens, revokeAllSessions, revokeSession } from './api/auth.api';
import { useAuthStore } from './store/auth.store';
import { AUTH_ROLES, isMobileRole, WEB_ACCOUNT_NOTICE } from './utils/auth-roles';
import { describeAccount } from './utils/linked-accounts';

const setAuth = useAuthStore.setState;
const PUSH_REMOVAL_NOTICE = 'Đã thoát trên thiết bị. Chưa xác nhận được việc ngừng nhận thông báo.';
// Credentials stay private. Zustand exposes display metadata only.
let accounts = new Map();
let activeId = null;
let version = 0;
let queryClient;
let hydrated = false;
let transition;
let storageQueue = Promise.resolve();
const refreshing = new Map();

function queueStorage(operation) {
  const result = storageQueue.then(operation);
  storageQueue = result.catch(() => {});
  return result;
}

function exclusively(operation) {
  if (transition) return Promise.reject(new CanceledError());
  const promise = Promise.resolve().then(operation);
  transition = promise;
  return promise.finally(() => {
    if (transition === promise) transition = undefined;
  });
}

function descriptors(pool = accounts) {
  return [...pool.values()].filter((entry) => entry.remember).map((entry) => entry.account);
}

function publishAccounts() {
  setAuth({
    linkedAccounts: [...accounts.values()].map((entry) => ({
      ...entry.account,
      requiresLogin: !entry.pair,
    })),
    activeAccountId: activeId,
  });
}

function getSession() {
  const pair = accounts.get(activeId)?.pair;
  return { version, accessToken: pair?.accessToken ?? null, refreshToken: pair?.refreshToken };
}

export function connectSessionClient(client) {
  queryClient = client;
  return attachSessionInterceptors(apiClient, { getSession, refreshSession });
}

async function clearAccountData(status) {
  version += 1;
  setAuth({ status, user: null, error: '', notice: '', loginSucceeded: false });
  await queryClient?.cancelQueries();
  queryClient?.clear();
}

function signedOut(notice = '') {
  activeId = null;
  publishAccounts();
  setAuth({ status: 'signed-out', user: null, error: '', notice, loginSucceeded: false });
}

async function hydrate() {
  if (hydrated) return;
  const index = await readAccountIndex();
  const pool = new Map(
    index.accounts.map((account) => [account.id, { account, pair: null, remember: true }])
  );
  // Retain the index if reading one credential fails. Recovery must not delete siblings.
  accounts = pool;
  activeId = pool.has(index.activeId) ? index.activeId : null;
  publishAccounts();
  for (const account of index.accounts) {
    pool.get(account.id).pair = await readAccountTokens(account.id);
  }
  // An existing index (even empty) must never revive a legacy session.
  if (!index.initialized) {
    const pair = await readTokens();
    if (pair) {
      let latest = pair;
      let user;
      try {
        user = await getCurrentUser(pair.accessToken);
      } catch (error) {
        if (error.response?.status !== 401) throw error;
        try {
          latest = await refreshTokens(pair.refreshToken);
          // Rotation invalidates the old refresh token, even if /me later loses its connection.
          await writeTokens(latest);
        } catch (failure) {
          if (failure.response?.status !== 401) throw failure;
          await clearTokens();
        }
        if (latest !== pair) user = await getCurrentUser(latest.accessToken);
      }
      if (user && isMobileRole(user.role)) {
        const account = describeAccount(user);
        await writeAccountTokens(account.id, latest);
        pool.set(account.id, { account, pair: latest, remember: true });
        index.activeId = account.id;
      }
    }
    await writeAccountIndex(descriptors(pool), index.activeId ?? null);
    await clearTokens();
  }
  accounts = pool;
  activeId = pool.has(index.activeId) ? index.activeId : null;
  hydrated = true;
  publishAccounts();
}

function refreshAccount(id) {
  if (refreshing.has(id)) return refreshing.get(id);
  const entry = accounts.get(id);
  if (!entry?.pair) return Promise.reject(new Error('Phiên đã hết hạn. Vui lòng đăng nhập lại.'));
  const previous = entry.pair;
  const promise = refreshTokens(previous.refreshToken)
    .then(async (pair) => {
      await queueStorage(async () => {
        if (accounts.get(id)?.pair !== previous) throw new CanceledError();
        if (accounts.get(id).remember) {
          try {
            await writeAccountTokens(id, pair);
          } catch {
            setAuth({ notice: 'Chưa lưu được phiên mới trên thiết bị.' });
          }
        }
        accounts.get(id).pair = pair;
      });
      return pair;
    })
    .finally(() => {
      if (refreshing.get(id) === promise) refreshing.delete(id);
    });
  refreshing.set(id, promise);
  return promise;
}

async function refreshSession(expectedVersion) {
  if (version !== expectedVersion || !activeId) throw new CanceledError();
  const id = activeId;
  try {
    return await refreshAccount(id);
  } catch (error) {
    if (version === expectedVersion && error.response?.status === 401) {
      await clearAccountData('signing-out');
      await expireAccount(id);
      signedOut('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
    }
    throw error;
  }
}

async function expireAccount(id) {
  const entry = accounts.get(id);
  if (!entry) return;
  entry.pair = null;
  publishAccounts();
  try {
    // Keep metadata for re-login; never silently select another child's credentials.
    await queueStorage(() => removeAccountTokens(id));
  } catch (error) {
    if (id === activeId) {
      await clearAccountData('restore-error');
      setAuth({ error: 'Chưa xóa được phiên đã lưu. Hãy thử lại.' });
    }
    throw error;
  }
}

// Inactive requests always receive explicit credentials, never the active child's token.
export async function withAccountSession(id, request) {
  const entry = accounts.get(id);
  if (!entry?.pair) throw new Error('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
  const pair = entry.pair;
  try {
    return await request(pair.accessToken);
  } catch (error) {
    if (error.response?.status !== 401) throw error;
    if (accounts.get(id) !== entry) throw new CanceledError();
    try {
      if (entry.pair === pair) await refreshAccount(id);
      return await request(entry.pair.accessToken);
    } catch (failure) {
      if (failure.response?.status === 401 && accounts.get(id) === entry) {
        const endActive =
          activeId === id && !transition && useAuthStore.getState().status === 'signed-in';
        if (endActive) await clearAccountData('signing-out');
        await expireAccount(id);
        if (endActive) {
          signedOut('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
        }
      }
      throw failure;
    }
  }
}

async function activate(id) {
  const entry = accounts.get(id);
  if (!entry?.pair) throw new Error('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
  const user = await withAccountSession(id, getCurrentUser);
  if (accounts.get(id) !== entry || !entry.pair) throw new CanceledError();
  if (user.id !== id || !isMobileRole(user.role) || user.role !== entry.account.role) {
    throw new Error('Thông tin tài khoản không khớp với phiên đã lưu.');
  }
  entry.account = describeAccount(user);
  await queueStorage(() => writeAccountIndex(descriptors(), entry.remember ? id : null));
  activeId = id;
  publishAccounts();
  setAuth({ status: 'signed-in', user, error: '' });
}

export function switchAccount(id) {
  return exclusively(async () => {
    if (activeId === id && useAuthStore.getState().status === 'signed-in') return;
    const previousId = activeId;
    const previousUser = useAuthStore.getState().user;
    if (accounts.get(id)?.account.role !== AUTH_ROLES.parent) throw new CanceledError();
    await clearAccountData('switching');
    try {
      await activate(id);
    } catch (error) {
      activeId = previousId;
      publishAccounts();
      if (previousUser && accounts.get(previousId)?.pair) {
        setAuth({
          status: 'signed-in',
          user: previousUser,
          error: '',
          notice:
            'Chưa chuyển được tài khoản. Kiểm tra kết nối hoặc đăng nhập lại tài khoản đã chọn.',
        });
      } else
        signedOut(
          'Chưa chuyển được tài khoản. Kiểm tra kết nối hoặc đăng nhập lại tài khoản đã chọn.'
        );
      throw error;
    }
  });
}

export function restoreSession() {
  if (transition) return transition;
  return exclusively(async () => {
    setAuth({ status: 'restoring', user: null, error: '', notice: '', loginSucceeded: false });
    try {
      await hydrate();
      if (!activeId || !accounts.get(activeId)?.pair) {
        signedOut();
        return;
      }
      await activate(activeId);
    } catch (error) {
      if (error.response?.status === 401) {
        signedOut('Phiên đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      setAuth({
        status: 'restore-error',
        error:
          error.response?.status === 403
            ? 'Tài khoản chưa được phép truy cập. Bạn có thể thoát để đổi tài khoản.'
            : 'Chưa khôi phục được phiên. Kiểm tra kết nối rồi thử lại.',
      });
    }
  });
}

export function acceptLogin(
  result,
  expectedRole,
  remember,
  signal,
  { adding = false, accountId, originId } = {}
) {
  const { user, tokens: pair } = result;
  return exclusively(async () => {
    if (!isMobileRole(user.role) || user.role !== expectedRole) {
      throw new Error(
        isMobileRole(user.role) ? 'Tài khoản không thuộc loại đã chọn.' : WEB_ACCOUNT_NOTICE
      );
    }
    if (accountId && user.id !== accountId)
      throw new Error('Hãy đăng nhập đúng tài khoản đã chọn.');
    const state = useAuthStore.getState();
    if (
      signal.aborted ||
      (adding
        ? state.status !== 'signed-in' ||
          state.user?.role !== AUTH_ROLES.parent ||
          state.user.id !== originId
        : state.status !== 'signed-out')
    )
      throw new CanceledError();
    if (adding && user.role !== AUTH_ROLES.parent) throw new CanceledError();
    await hydrate();
    await refreshing.get(activeId)?.catch(() => {});
    if (
      signal.aborted ||
      (adding && (activeId !== originId || useAuthStore.getState().status !== 'signed-in'))
    )
      throw new CanceledError();
    // Invalidate earlier HTTP responses without unmounting the login form before persistence.
    version += 1;
    await queueStorage(async () => {
      const pool = new Map(accounts);
      const old = pool.get(activeId);
      // Adding a child opts both sessions into secure persistence, including a RAM-only A.
      if (adding && old && !old.remember) pool.set(activeId, { ...old, remember: true });
      pool.set(user.id, { account: describeAccount(user), pair, remember: adding || remember });
      const changed = [...pool.values()].filter(
        (entry) => entry.remember && entry !== accounts.get(entry.account.id)
      );
      try {
        for (const entry of changed) await writeAccountTokens(entry.account.id, entry.pair);
        if (signal.aborted) throw new CanceledError();
        await writeAccountIndex(descriptors(pool), adding || remember ? user.id : null);
        if (signal.aborted) throw new CanceledError();
      } catch (error) {
        for (const entry of changed) {
          const previous = accounts.get(entry.account.id);
          if (previous?.remember && previous.pair)
            await writeAccountTokens(entry.account.id, previous.pair);
          else await removeAccountTokens(entry.account.id);
        }
        await writeAccountIndex(descriptors(), accounts.get(activeId)?.remember ? activeId : null);
        throw error;
      }
      accounts = pool;
    });
    await clearAccountData('switching');
    activeId = user.id;
    publishAccounts();
    setAuth({ status: 'signed-in', user, notice: '', loginSucceeded: true });
  }).catch((error) => {
    void revokeSession(pair).catch(() => {});
    throw error;
  });
}

export function signOut(accountId) {
  // onPress can pass an event; only a string identifies a non-active account.
  const id = typeof accountId === 'string' ? accountId : activeId;
  if (transition) return Promise.resolve();
  return exclusively(() => removeSession(id));
}

async function removeSession(id, { revoke = true, notice = '' } = {}) {
  const entry = accounts.get(id);
  const wasActive = id === activeId;
  if (wasActive || !id) await clearAccountData('signing-out');
  if (entry && !entry.pair) notice = PUSH_REMOVAL_NOTICE;
  setPushRegistrationPaused(entry?.account, true);
  try {
    await refreshing.get(id)?.catch(() => {});
    if (revoke && entry?.pair) {
      try {
        await withAccountSession(id, (access) => removePushForSession(entry.account, access));
      } catch {
        notice = PUSH_REMOVAL_NOTICE;
      }
      try {
        if (entry.pair) await revokeSession(entry.pair);
      } catch {
        notice ||= 'Đã thoát trên thiết bị. Chưa xác nhận được thu hồi phiên trên máy chủ.';
      }
    }
    await queueStorage(async () => {
      if (!id) {
        // A failed index read does not authorize clearing an unknown account collection.
        await clearTokens();
        return;
      }
      await removeAccountTokens(id);
      const pool = new Map(accounts);
      pool.delete(id);
      await writeAccountIndex(descriptors(pool), wasActive ? null : activeId);
      accounts = pool;
    });
    publishAccounts();
    if (!wasActive && id) {
      setAuth({ notice });
      return;
    }
    activeId = null;
    const next = [...accounts.values()].find(
      (item) => item.pair && item.account.role === AUTH_ROLES.parent
    );
    if (next) {
      try {
        await activate(next.account.id);
        setAuth({ notice });
        return;
      } catch {
        /* Keep siblings selectable; never restore the removed child. */
      }
    }
    signedOut(notice);
  } catch {
    if (wasActive || !id)
      setAuth({ status: 'restore-error', error: 'Chưa xóa được phiên đã lưu. Hãy thử lại.' });
    else throw new Error('Chưa xóa được phiên đã lưu. Hãy thử lại.');
  } finally {
    setPushRegistrationPaused(entry?.account, false);
  }
}

export function revokeAllSessionsAndSignOut() {
  return exclusively(async () => {
    const id = activeId;
    const expectedVersion = version;
    const entry = accounts.get(id);
    let pushRemoved = true;
    setPushRegistrationPaused(entry?.account, true);
    try {
      await removePushForSession(entry?.account, entry?.pair?.accessToken).catch(() => {
        pushRemoved = false;
      });
      if (version !== expectedVersion) throw new CanceledError();
      await revokeAllSessions();
      if (version === expectedVersion)
        await removeSession(id, {
          revoke: false,
          notice: pushRemoved ? 'Đã đăng xuất khỏi tất cả thiết bị.' : PUSH_REMOVAL_NOTICE,
        });
    } finally {
      setPushRegistrationPaused(entry?.account, false);
    }
  });
}
