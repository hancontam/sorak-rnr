import {
  confirmEnableTwoFactor,
  disableTwoFactor,
  requestEnableTwoFactor,
} from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useMutation } from '@tanstack/react-query';
import * as React from 'react';

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Thao tác không thành công.';
}

export function useTwoFactor() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const [step, setStep] = React.useState(null);
  const [otp, setOtp] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const requestEnable = useMutation({ mutationFn: requestEnableTwoFactor });
  const confirmEnable = useMutation({ mutationFn: confirmEnableTwoFactor });
  const disable = useMutation({ mutationFn: disableTwoFactor });

  function close() {
    setStep(null);
    setOtp('');
    setPassword('');
    setError('');
  }

  async function startEnable() {
    setError('');
    setNotice('');
    try {
      await requestEnable.mutateAsync();
      setOtp('');
      setStep('enable');
    } catch (requestError) {
      setNotice(getErrorMessage(requestError));
    }
  }

  function startDisable() {
    setError('');
    setNotice('');
    setPassword('');
    setStep('disable');
  }

  async function submit() {
    setError('');
    if (step === 'enable') {
      if (otp.length !== 6) {
        setError('Vui lòng nhập đủ 6 chữ số của mã OTP.');
        return;
      }
      try {
        await confirmEnable.mutateAsync(otp);
        updateUser({ is_2fa_enabled: true });
        close();
        setNotice('Đã bật xác thực 2 bước.');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
        setOtp('');
      }
      return;
    }

    if (step === 'disable') {
      if (!password) {
        setError('Vui lòng nhập mật khẩu hiện tại.');
        return;
      }
      try {
        await disable.mutateAsync(password);
        updateUser({ is_2fa_enabled: false });
        close();
        setNotice('Đã tắt xác thực 2 bước.');
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    }
  }

  return {
    step,
    otp,
    setOtp,
    password,
    setPassword,
    error,
    setError,
    notice,
    close,
    startEnable,
    startDisable,
    submit,
    isRequesting: requestEnable.isPending,
    isSubmitting: confirmEnable.isPending || disable.isPending,
  };
}
