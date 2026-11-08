import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { AuthSubmitButton } from './AuthSubmitButton';
import { LoginError } from './LoginError';

export function LoginOtpForm({
  emailMasked,
  error,
  pending,
  typography,
  onSubmit,
  onBack,
  onEdit,
}) {
  const [otp, setOtp] = useState('');
  const [focused, setFocused] = useState(false);

  function submit() {
    if (!pending && otp.length === 6) onSubmit(otp);
  }

  return (
    <Card className="gap-3.5 rounded-2xl py-4">
      <CardHeader className="gap-0.5 px-4">
        <CardTitle className="text-sm leading-5" style={typography.semiBold}>
          Nhập mã xác thực OTP
        </CardTitle>
        <CardDescription className="text-xs leading-[19px]" style={typography.regular}>
          {emailMasked
            ? `Nhập mã 6 số đã gửi đến ${emailMasked}.`
            : 'Nhập mã 6 số đã gửi đến email liên kết với tài khoản.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-3.5 px-4">
        <View className="relative">
          <View
            className="flex-row gap-2"
            importantForAccessibility="no-hide-descendants"
            aria-hidden>
            {Array.from({ length: 6 }, (_, index) => (
              <View
                key={index}
                className={`min-h-11 flex-1 items-center justify-center rounded-lg border py-1 ${focused && index === Math.min(otp.length, 5) ? 'border-primary' : 'border-input'}`}>
                <Text className="text-sm leading-5" style={typography.monoSemiBold}>
                  {otp[index] || ''}
                </Text>
              </View>
            ))}
          </View>
          <TextInput
            className="absolute inset-0 h-full w-full opacity-0"
            accessibilityLabel="Mã xác thực, 6 chữ số"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            caretHidden
            maxLength={6}
            value={otp}
            onChangeText={(value) => {
              setOtp(value.replace(/\D/g, ''));
              onEdit();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            editable={!pending}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </View>
        <LoginError message={error} typography={typography} />
        <AuthSubmitButton
          label="Xác minh"
          labelStyle={typography.semiBold}
          pending={pending}
          disabled={otp.length !== 6}
          onPress={submit}
        />
        <Button variant="ghost" size="sm" disabled={pending} onPress={onBack}>
          <Text className="text-xs" style={typography.medium}>
            Quay lại đăng nhập
          </Text>
        </Button>
      </CardContent>
    </Card>
  );
}
