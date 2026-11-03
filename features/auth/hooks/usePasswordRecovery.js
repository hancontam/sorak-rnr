import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from '@/features/auth/api/auth.api';
import { useMutation } from '@tanstack/react-query';
import { maskEmail } from '@/shared/utils/mask-email';
import * as React from 'react';

export function usePasswordRecovery() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState('account');
  const [identifier, setIdentifier] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [resetToken, setResetToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const sendEmailRequest = useMutation({ mutationFn: requestPasswordReset });
  const verifyOtpRequest = useMutation({ mutationFn: verifyPasswordResetOtp });
  const resetRequest = useMutation({ mutationFn: resetPassword });

  function start(username) {
    setStep('account');
    setIdentifier(username);
    setDestination('');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setOpen(true);
  }

  async function sendEmail() {
    const value = identifier.trim();
    if (!value) {
      setError('Vui lòng nhập mã cán bộ ở bước trước.');
      return;
    }
    setError('');
    try {
      const result = await sendEmailRequest.mutateAsync(value);
      if (result?.contactTeacher) {
        setError(result.message || 'Vui lòng liên hệ nhà trường để được hỗ trợ.');
        return;
      }
      setDestination(maskEmail(result?.emailMasked) || 'email liên kết với tài khoản');
      setStep('otp');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Không gửi được mã xác thực.'
      );
    }
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số của mã OTP.');
      return;
    }
    setError('');
    try {
      const result = await verifyOtpRequest.mutateAsync({ email: identifier, otp });
      if (!result?.resetToken) throw new Error('Phản hồi xác thực thiếu mã đặt lại mật khẩu.');
      setResetToken(result.resetToken);
      setStep('reset');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || requestError.message || 'Mã OTP không hợp lệ.'
      );
    }
  }

  async function resendOtp() {
    setError('');
    try {
      await sendEmailRequest.mutateAsync(identifier);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || requestError.message || 'Không gửi lại được mã.'
      );
    }
  }

  async function submitNewPassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Hai lần nhập mật khẩu mới chưa khớp.');
      return false;
    }
    setError('');
    try {
      await resetRequest.mutateAsync({ email: identifier, resetToken, password: newPassword });
      setOpen(false);
      setResetToken('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      return true;
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Không đặt lại được mật khẩu.'
      );
      return false;
    }
  }

  return {
    open,
    setOpen,
    start,
    step,
    identifier,
    destination,
    otp,
    setOtp,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    sendEmail,
    verifyOtp,
    resendOtp,
    submitNewPassword,
    isSending: sendEmailRequest.isPending,
    isVerifying: verifyOtpRequest.isPending,
    isResetting: resetRequest.isPending,
  };
}
