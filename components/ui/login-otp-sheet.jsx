import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { maskEmail } from '@/shared/utils/mask-email';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOverlap(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="items-end justify-end bg-foreground/35 p-0"
        className="mx-0 w-full max-w-full gap-0 rounded-b-none rounded-t-[36px] border-border bg-card px-6 pt-7 shadow-lg shadow-black/20"
        style={{
          marginBottom: keyboardOffset,
          paddingBottom: keyboardOffset > 0 ? 24 : Math.max(insets.bottom, 24),
        }}>
        <DialogTitle className="text-xl font-medium">Xác thực đăng nhập</DialogTitle>
        <View className="mt-5 gap-4">
          <Text className="text-sm text-secondary-foreground">
            Nhập mã OTP đã gửi đến {maskEmail(emailMasked) || 'email của bạn'}.
          </Text>
          <OtpCodeInput value={otp} onChange={onOtpChange} />
          {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
          <Button className="w-full bg-[#8ec5ff]" disabled={isVerifying} onPress={onVerify}>
            {isVerifying ? (
              <ActivityIndicator size="small" color="#09090b" />
            ) : (
              <Text className="text-foreground">Xác minh</Text>
            )}
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}
