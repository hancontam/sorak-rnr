import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { getChallengeUrl, login, verifyLoginOtp } from '../api/auth.api';
import { acceptLogin } from '../session';
import { useAuthStore } from '../store/auth.store';

function errorMessage(error, isOtp) {
  switch (error.response?.status) {
    case 400:
      return isOtp
        ? 'Mã xác thực không hợp lệ hoặc đã hết hạn.'
        : 'Kiểm tra lại thông tin và thử xác minh bảo mật mới.';
    case 401:
      return isOtp
        ? 'Mã hoặc phiên xác thực không còn hợp lệ.'
        : 'Kiểm tra lại tài khoản, mật khẩu và loại tài khoản.';
    case 403:
      return 'Tài khoản chưa được phép đăng nhập. Vui lòng liên hệ nhà trường.';
    case 429:
      return 'Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.';
    default:
      if (error.isAxiosError) {
        return error.response
          ? 'Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại.'
          : 'Không kết nối được với máy chủ. Kiểm tra mạng rồi thử lại.';
      }
      return error.message || 'Đăng nhập chưa thành công.';
  }
}

export function useLogin(role, { adding = false, accountId, onAuthenticated } = {}) {
  const activeRequest = useRef(null);
  const originId = useRef(useAuthStore.getState().user?.id);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState('');
  const { mutateAsync, isPending, reset } = useMutation({
    networkMode: 'always',
    gcTime: 0,
    mutationFn: async ({ send, remember, signal }) => {
      const result = await send(signal);
      if (result.user) {
        await acceptLogin(result, role, remember, signal, {
          adding,
          accountId,
          originId: originId.current,
        });
        // Re-adding the active account keeps the same guarded stack identity.
        if (!signal.aborted && result.user.id === originId.current) onAuthenticated?.();
      } else if (!signal.aborted) setChallenge({ ...result, remember });
    },
  });

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function submit(send, remember, isOtp = false) {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setError('');
    try {
      await mutateAsync({ send, remember, signal: controller.signal });
    } catch (failure) {
      if (!controller.signal.aborted && failure.code !== 'ERR_CANCELED') {
        setError(errorMessage(failure, isOtp));
      }
    } finally {
      activeRequest.current = null;
      reset();
    }
  }

  function submitLogin({ username, password, captchaToken, remember }) {
    return submit((signal) => login({ username, password, role, captchaToken }, signal), remember);
  }

  function submitOtp(otp) {
    if (!challenge) return;
    const { tempToken, remember } = challenge;
    return submit((signal) => verifyLoginOtp({ tempToken, otp }, signal), remember, true);
  }

  function returnToCredentials() {
    setChallenge(null);
    setError('');
  }

  const emailMasked = /^[^@]*\*[^@]*@[^@\s]+$/.test(challenge?.emailMasked ?? '')
    ? challenge.emailMasked
    : '';

  return {
    submitLogin,
    submitOtp,
    returnToCredentials,
    clearError: () => setError(''),
    isPending,
    error,
    needsOtp: !!challenge,
    emailMasked,
    challengeUrl: getChallengeUrl(),
  };
}
