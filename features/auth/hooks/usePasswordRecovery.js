import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { requestPasswordReset, resetPassword, verifyPasswordResetOtp } from '../api/auth.api';

const RESEND_SECONDS = 60;

function recoveryError(error, action) {
  const status = error.response?.status;
  if (status === 403) return 'Tài khoản chưa được phép thao tác. Vui lòng liên hệ nhà trường.';
  if (status === 404 && action === 'send')
    return 'Không tìm thấy tài khoản. Kiểm tra lại mã cán bộ.';
  if (status === 429) return 'Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại.';
  if (status === 400 && action === 'verify')
    return 'Mã OTP không chính xác. Hãy kiểm tra và thử lại.';
  if (error.isAxiosError && !error.response) {
    return 'Không kết nối được với máy chủ. Kiểm tra mạng rồi thử lại.';
  }
  return action === 'send'
    ? 'Chưa gửi được mã xác thực. Vui lòng thử lại.'
    : 'Chưa đặt lại được mật khẩu. Vui lòng kiểm tra và thử lại.';
}

export function usePasswordRecovery() {
  const activeRequest = useRef(null);
  const resetToken = useRef(null);
  const [challenge, setChallenge] = useState(null);
  const [otpStatus, setOtpStatus] = useState('waiting');
  const [error, setError] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { mutateAsync, isPending, reset } = useMutation({
    mutationFn: ({ send, signal }) => send(signal),
    networkMode: 'always',
    gcTime: 0,
  });

  useEffect(() => () => activeRequest.current?.abort(), []);

  useEffect(() => {
    if (!resendAt) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [resendAt]);

  function setCooldown(seconds) {
    setResendAt(Date.now() + seconds * 1000);
    setSecondsLeft(seconds);
  }

  async function run(send, onError) {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setError('');
    try {
      return await mutateAsync({ send, signal: controller.signal });
    } catch (failure) {
      if (!controller.signal.aborted && failure.code !== 'ERR_CANCELED') onError(failure);
    } finally {
      activeRequest.current = null;
      reset();
    }
  }

  function sendCode(identifier) {
    if (Date.now() < resendAt) return;
    return run(
      async (signal) => {
        const result = await requestPasswordReset(identifier, signal);
        if (signal.aborted) return;
        if (result.support) {
          setError(
            result.support === 'role'
              ? 'Vui lòng nhập mã cán bộ của giáo viên.'
              : 'Tài khoản chưa có email nhận mã. Vui lòng liên hệ Ban giám hiệu để được hỗ trợ.'
          );
          return;
        }
        resetToken.current = null;
        setOtpStatus('waiting');
        setChallenge({ identifier, emailMasked: result.emailMasked });
        setCooldown(RESEND_SECONDS);
        return true;
      },
      (failure) => {
        const message = failure.response?.data?.message;
        const cooldown =
          failure.response?.status === 400 &&
          typeof message === 'string' &&
          message.match(/đợi (\d{1,3}) giây trước khi yêu cầu gửi lại/i);
        if (cooldown) {
          const seconds = Number(cooldown[1]);
          setCooldown(seconds);
          setError(`Vui lòng chờ ${seconds} giây trước khi yêu cầu mã mới.`);
        } else setError(recoveryError(failure, 'send'));
      }
    );
  }

  function savePassword(otp, password) {
    if (!challenge || otpStatus === 'expired') return;
    const { identifier } = challenge;
    let action = 'verify';
    return run(
      async (signal) => {
        if (!resetToken.current) {
          const token = await verifyPasswordResetOtp({ identifier, otp }, signal);
          if (signal.aborted) return;
          resetToken.current = token;
          setOtpStatus('verified');
        }
        action = 'reset';
        await resetPassword({ identifier, resetToken: resetToken.current, password }, signal);
        if (signal.aborted) return;
        resetToken.current = null;
        return identifier;
      },
      (failure) => {
        const message = failure.response?.data?.message;
        if (
          action === 'reset' &&
          failure.response?.status === 400 &&
          typeof message === 'string' &&
          /Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ/i.test(message)
        ) {
          resetToken.current = null;
          setOtpStatus('expired');
          setError('Phiên đặt lại đã hết hạn. Hãy yêu cầu mã OTP mới.');
          return;
        }
        if (
          action === 'verify' &&
          failure.response?.status === 400 &&
          typeof message === 'string' &&
          /hết hạn|vượt quá số lần/i.test(message)
        ) {
          setOtpStatus('expired');
          setError('Mã OTP đã hết hiệu lực. Hãy yêu cầu mã mới.');
          return;
        }
        setError(recoveryError(failure, action));
      }
    );
  }

  return {
    challenge,
    otpVerified: otpStatus === 'verified',
    otpNeedsResend: otpStatus === 'expired',
    secondsLeft,
    error,
    isPending,
    sendCode,
    savePassword,
    clearError: () => setError(''),
  };
}
