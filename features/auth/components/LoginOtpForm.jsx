import { useState } from 'react';

import { OtpCodeInput } from '@/components/shared/OtpCodeInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AuthSubmitButton } from './AuthSubmitButton';
import { LoginError } from './LoginError';

export function LoginOtpForm({ emailMasked, error, pending, onSubmit, onBack, onEdit }) {
  const t = useTranslation();
  const [otp, setOtp] = useState('');

  function submit(code = otp) {
    if (!pending && code.length === 6) onSubmit(code);
  }

  return (
    <Card className="gap-3.5 rounded-2xl py-4">
      <CardHeader className="gap-0.5 px-4">
        <CardTitle className="text-sm font-semibold leading-5">
          {t('Nhập mã xác thực OTP')}
        </CardTitle>
        <CardDescription className="text-xs leading-[19px]">
          {emailMasked
            ? t('Nhập mã 6 số đã gửi đến {email}.', { email: emailMasked })
            : t('Nhập mã 6 số đã gửi đến email liên kết với tài khoản.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-3.5 px-4">
        <OtpCodeInput
          otp={otp}
          pending={pending}
          onChange={(value) => {
            setOtp(value);
            onEdit();
          }}
          onSubmit={submit}
        />
        <LoginError message={error} />
        <AuthSubmitButton
          label={t('Xác minh')}
          pending={pending}
          disabled={otp.length !== 6}
          onPress={submit}
        />
        <Button variant="ghost" size="sm" disabled={pending} onPress={onBack}>
          <Text className="text-xs font-medium">{t('Quay lại đăng nhập')}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
