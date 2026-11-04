import { Button } from '@/components/ui/button';
import { BottomSheetContent, Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { maskEmail } from '@/shared/utils/mask-email';
import { View, useWindowDimensions } from 'react-native';

export function TwoFactorSheet({
  step,
  onClose,
  email,
  otp,
  onOtpChange,
  password,
  onPasswordChange,
  error,
  onSubmit,
  isSubmitting,
}) {
  const { height } = useWindowDimensions();
  const compact = height < 480;
  const enabling = step === 'enable';

  return (
    <Dialog open={Boolean(step)} onOpenChange={(open) => !open && onClose()}>
      <BottomSheetContent
        open={Boolean(step)}
        title={enabling ? 'Bật xác thực 2 bước' : 'Tắt xác thực 2 bước'}>
        <View className={compact ? 'mt-3 gap-3' : 'mt-5 gap-4'}>
          {enabling ? (
            <>
              <Text className="text-sm text-secondary-foreground">
                Nhập mã OTP đã gửi đến {maskEmail(email) || 'email liên kết với tài khoản'}.
              </Text>
              <OtpCodeInput value={otp} onChange={onOtpChange} />
            </>
          ) : (
            <>
              <Text className="text-sm text-secondary-foreground">
                Nhập mật khẩu hiện tại để xác nhận tắt xác thực 2 bước.
              </Text>
              <Input
                value={password}
                onChangeText={onPasswordChange}
                secureTextEntry
                autoComplete="current-password"
                accessibilityLabel="Mật khẩu hiện tại"
              />
            </>
          )}
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          <Button className="w-full bg-brand" disabled={isSubmitting} onPress={onSubmit}>
            {isSubmitting ? (
              <ThemedSpinner />
            ) : (
              <Text className="text-brand-foreground">
                {enabling ? 'Xác nhận bật' : 'Xác nhận tắt'}
              </Text>
            )}
          </Button>
        </View>
      </BottomSheetContent>
    </Dialog>
  );
}
