import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { maskEmail } from '@/shared/utils/mask-email';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOverlap(Boolean(step));
  const enabling = step === 'enable';

  return (
    <Dialog open={Boolean(step)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="items-end justify-end bg-foreground/35 p-0"
        className="mx-0 w-full max-w-full gap-0 rounded-b-none rounded-t-[36px] border-border bg-card px-6 pt-7 shadow-lg shadow-black/20"
        style={{
          marginBottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? 24 : Math.max(insets.bottom, 24),
        }}>
        <DialogTitle className="text-xl font-medium">
          {enabling ? 'Bật xác thực 2 bước' : 'Tắt xác thực 2 bước'}
        </DialogTitle>
        <View className="mt-5 gap-4">
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
      </DialogContent>
    </Dialog>
  );
}
