import { CanceledError } from 'axios';

import { apiClient } from '@/shared/api/client';
import { attachSessionInterceptors } from '@/shared/api/session-interceptors';
import { clearTokens, readTokens, writeTokens } from '@/shared/storage/token.storage';

import { getCurrentUser, refreshTokens, revokeAllSessions, revokeSession } from './api/auth.api';
import { useAuthStore } from './store/auth.store';
import { isMobileRole, WEB_ACCOUNT_NOTICE } from './utils/auth-roles';

const setAuth = useAuthStore.setState;
let tokens = null;
let rememberSession = false;
let version = 0;
let queryClient;
let restoreInFlight;
let refreshInFlight;
let cleanupRequired = false;
let storageQueue = Promise.resolve();

function queueStorage(operation) {
  const result = storageQueue.then(operation);
  storageQueue = result.catch(() => {});
  return result;
}

function getSession() {
  return { version, accessToken: tokens?.accessToken ?? null, refreshToken: tokens?.refreshToken };
}

export function connectSessionClient(client) {
  queryClient = client;
  return attachSessionInterceptors(apiClient, { getSession, refreshSession });
}

function showSignedOut(notice = '') {
  setAuth({ status: 'signed-out', user: null, error: '', notice });
}

async function removeSavedSession() {
  await queueStorage(clearTokens);
  cleanupRequired = false;
}

async function endSession({ revoke = false, notice = '' } = {}) {
  const previousTokens = tokens;
  const pendingRefresh = refreshInFlight?.promise;
  version += 1;
  tokens = null;
  rememberSession = false;
  cleanupRequired = true;
  setAuth({ status: 'signing-out', user: null, error: '', notice: '', loginSucceeded: false });
  const canceledQueries = queryClient?.cancelQueries();
  queryClient?.clear();

  const removed = removeSavedSession().then(
    () => true,
    () => false
  );
  if (revoke && previousTokens) {
    try {
      // Khi refresh vừa xoay token, thu hồi cặp mới nhất server đã cấp.
      const latest = await pendingRefresh?.catch(() => null);
      await revokeSession(latest ?? previousTokens);
    } catch {
      notice = 'Đã thoát trên thiết bị. Chưa xác nhận được thu hồi phiên trên máy chủ.';
    }
  }

  await canceledQueries;
  if (await removed) showSignedOut(notice);
  else {
    setAuth({
      status: 'restore-error',
      error: 'Chưa xóa được phiên đã lưu. Hãy thử lại.',
    });
  }
}

export function signOut() {
  if (useAuthStore.getState().status === 'signing-out') return;
  return endSession({ revoke: true });
}

export async function revokeAllSessionsAndSignOut() {
  const expectedVersion = version;
  await revokeAllSessions();
  if (version === expectedVersion) {
    await endSession({ notice: 'Đã đăng xuất khỏi tất cả thiết bị.' });
  }
}

function refreshSession(expectedVersion) {
  if (version !== expectedVersion || !tokens) throw new CanceledError();
  if (refreshInFlight?.version === expectedVersion) return refreshInFlight.promise;

  const promise = refreshTokens(tokens.refreshToken)
    .then(async (nextTokens) => {
      if (version === expectedVersion) {
        if (rememberSession) {
          try {
            await queueStorage(() => writeTokens(nextTokens));
          } catch {
            if (version === expectedVersion) {
              setAuth({ notice: 'Chưa lưu được phiên mới trên thiết bị.' });
            }
          }
        }
        if (version === expectedVersion) tokens = nextTokens;
      }
      return nextTokens;
    })
    .catch(async (error) => {
      if (version === expectedVersion && error.response?.status === 401) {
        await endSession({ notice: 'Phiên đã hết hạn. Vui lòng đăng nhập lại.' });
      }
      throw error;
    })
    .finally(() => {
      if (refreshInFlight?.promise === promise) refreshInFlight = undefined;
    });

  refreshInFlight = { version: expectedVersion, promise };
  return promise;
}

export function restoreSession() {
  if (restoreInFlight) return restoreInFlight;
  setAuth({ status: 'restoring', user: null, error: '', notice: '', loginSucceeded: false });
  const expectedVersion = version;

  restoreInFlight = (async () => {
    try {
      if (cleanupRequired) {
        await removeSavedSession();
        showSignedOut();
        return;
      }
      if (!tokens) {
        const savedTokens = await readTokens();
        if (version !== expectedVersion) return;
        if (!savedTokens) {
          showSignedOut();
          return;
        }
        tokens = savedTokens;
        rememberSession = true;
      }
      const user = await getCurrentUser();
      if (version !== expectedVersion) return;
      if (!isMobileRole(user.role)) {
        await endSession({ revoke: true, notice: WEB_ACCOUNT_NOTICE });
        return;
      }
      setAuth({ status: 'signed-in', user });
    } catch (error) {
      if (version !== expectedVersion) return;
      setAuth({
        status: 'restore-error',
        error: cleanupRequired
          ? 'Chưa xóa được phiên đã lưu. Hãy thử lại.'
          : error.response?.status === 403
            ? 'Tài khoản chưa được phép truy cập. Bạn có thể thoát để đổi tài khoản.'
            : 'Chưa khôi phục được phiên. Kiểm tra kết nối rồi thử lại.',
      });
    }
  })().finally(() => {
    restoreInFlight = undefined;
  });
  return restoreInFlight;
}

export async function acceptLogin(result, expectedRole, remember, signal) {
  const { user, tokens: nextTokens } = result;
  if (!isMobileRole(user.role) || user.role !== expectedRole) {
    void revokeSession(nextTokens).catch(() => {});
    throw new Error(
      isMobileRole(user.role) ? 'Tài khoản không thuộc loại đã chọn.' : WEB_ACCOUNT_NOTICE
    );
  }

  try {
    await queueStorage(async () => {
      if (signal.aborted || useAuthStore.getState().status !== 'signed-out') {
        throw new CanceledError();
      }
      if (remember) await writeTokens(nextTokens);
      if (signal.aborted) {
        if (remember) {
          try {
            await clearTokens();
          } catch {
            cleanupRequired = true;
            setAuth({ status: 'restore-error', error: 'Chưa xóa được phiên vừa hủy.' });
          }
        }
        throw new CanceledError();
      }

      version += 1;
      queryClient?.clear();
      tokens = nextTokens;
      rememberSession = remember;
      setAuth({ status: 'signed-in', user, notice: '', loginSucceeded: true });
    });
  } catch (error) {
    void revokeSession(nextTokens).catch(() => {});
    throw error;
  }
}
