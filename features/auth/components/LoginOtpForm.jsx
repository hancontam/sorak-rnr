import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AuthSubmitButton } from './AuthSubmitButton';
import { LoginError } from './LoginError';
import { OtpCodeInput } from './OtpCodeInput';

export function LoginOtpForm({
  emailMasked,
  error,
  pending,
  typography,
  onSubmit,
  onBack,
  onEdit,
}) {
  const t = useTranslation();
  const [otp, setOtp] = useState('');

  function submit() {
    if (!pending && otp.length === 6) onSubmit(otp);
  }

  return (
    <Card className="gap-3.5 rounded-2xl py-4">
      <CardHeader className="gap-0.5 px-4">
        <CardTitle className="text-sm leading-5" style={typography.semiBold}>
          {t('Nhập mã xác thực OTP')}
        </CardTitle>
        <CardDescription className="text-xs leading-[19px]" style={typography.regular}>
          {emailMasked
            ? t('Nhập mã 6 số đã gửi đến {email}.', { email: emailMasked })
            : t('Nhập mã 6 số đã gửi đến email liên kết với tài khoản.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-3.5 px-4">
        <OtpCodeInput
          otp={otp}
          typography={typography}
          pending={pending}
          onChange={(value) => {
            setOtp(value);
            onEdit();
          }}
          onSubmit={submit}
        />
        <LoginError message={error} typography={typography} />
        <AuthSubmitButton
          label={t('Xác minh')}
          labelStyle={typography.semiBold}
          pending={pending}
          disabled={otp.length !== 6}
          onPress={submit}
        />
        <Button variant="ghost" size="sm" disabled={pending} onPress={onBack}>
          <Text className="text-xs" style={typography.medium}>
            {t('Quay lại đăng nhập')}
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}
