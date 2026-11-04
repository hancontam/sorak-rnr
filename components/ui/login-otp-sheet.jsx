import { Button } from '@/components/ui/button';
import { BottomSheetContent, Dialog } from '@/components/ui/dialog';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { maskEmail } from '@/shared/utils/mask-email';
import { View } from 'react-native';

export function LoginOtpSheet({
  open,
  onOpenChange,
  emailMasked,
  otp,
  onOtpChange,
  onVerify,
  isVerifying,
  error,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent open={open} title="Xác thực đăng nhập">
        <View className="mt-5 gap-4">
          <Text className="text-sm text-secondary-foreground">
            Nhập mã OTP đã gửi đến {maskEmail(emailMasked) || 'email của bạn'}.
          </Text>
          <OtpCodeInput value={otp} onChange={onOtpChange} />
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          <Button className="w-full bg-brand" disabled={isVerifying} onPress={onVerify}>
            {isVerifying ? (
              <ThemedSpinner />
            ) : (
              <Text className="text-brand-foreground">Xác minh</Text>
            )}
          </Button>
        </View>
      </BottomSheetContent>
    </Dialog>
  );
}
