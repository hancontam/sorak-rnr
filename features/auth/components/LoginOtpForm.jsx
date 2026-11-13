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
    <Card>
      <CardHeader className="gap-1">
        <CardTitle>{t('Nhập mã xác thực OTP')}</CardTitle>
        <CardDescription className="leading-5">
          {emailMasked
            ? t('Nhập mã 6 số đã gửi đến {email}.', { email: emailMasked })
            : t('Nhập mã 6 số đã gửi đến email liên kết với tài khoản.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
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
        <Button variant="ghost" disabled={pending} onPress={onBack}>
          <Text>{t('Quay lại đăng nhập')}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
