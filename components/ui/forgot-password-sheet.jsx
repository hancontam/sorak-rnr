import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { useKeyboardOverlap } from '@/shared/hooks/useKeyboardOverlap';
import { ArrowRight } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ForgotPasswordSheet({
  open,
  onOpenChange,
  step,
  identifier,
  destination,
  otp,
  onOtpChange,
  onSendEmail,
  onVerifyOtp,
  onResendOtp,
  isSending,
  isVerifying,
  newPassword,
  onNewPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  onResetPassword,
  isResetting,
  error,
}) {
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOverlap(open && step !== 'account');

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
        <DialogTitle className="text-xl font-medium">
          {step === 'account'
            ? 'Quên mật khẩu'
            : step === 'otp'
              ? 'Nhập mã OTP'
              : 'Đặt lại mật khẩu'}
        </DialogTitle>

        {step === 'account' ? (
          <View className="mt-5 gap-3.5">
            <Text className="text-sm text-secondary-foreground">
              Gửi mã OTP tới email đã liên kết với tài khoản cán bộ này để đặt lại mật khẩu.
            </Text>
            <Input value={identifier} editable={false} accessibilityLabel="Mã cán bộ nhận OTP" />
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            <Button
              variant="secondary"
              className="w-full opacity-100"
              disabled={isSending}
              onPress={onSendEmail}>
              {isSending ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <>
                  <Text>Gửi mã xác thực</Text>
                  <Icon as={ArrowRight} size={16} strokeWidth={1} />
                </>
              )}
            </Button>
          </View>
        ) : step === 'otp' ? (
          <View className="mt-5 gap-4">
            <Text className="text-sm text-secondary-foreground">
              Nhập mã xác thực đã gửi đến {destination}
            </Text>
            <OtpCodeInput value={otp} onChange={onOtpChange} />
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            <Button variant="link" className="w-full" disabled={isSending} onPress={onResendOtp}>
              <Text className="font-bold text-[#5faaf9]">Gửi lại mã?</Text>
            </Button>
            <Button
              className="w-full bg-[#8ec5ff] opacity-100 active:bg-[#8ec5ff]/90"
              disabled={isVerifying}
              onPress={onVerifyOtp}>
              {isVerifying ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <Text className="text-foreground">Xác minh</Text>
              )}
            </Button>
          </View>
        ) : (
          <View className="mt-5 gap-4">
            <Text className="text-sm text-secondary-foreground">
              Nhập mật khẩu mới cho {identifier}. Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, số và
              ký tự đặc biệt.
            </Text>
            <View className="gap-2">
              <Text className="text-xs font-medium">Mật khẩu mới</Text>
              <Input
                value={newPassword}
                onChangeText={onNewPasswordChange}
                secureTextEntry
                autoComplete="new-password"
                accessibilityLabel="Mật khẩu mới"
              />
            </View>
            <View className="gap-2">
              <Text className="text-xs font-medium">Nhập lại mật khẩu mới</Text>
              <Input
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                secureTextEntry
                autoComplete="new-password"
                accessibilityLabel="Nhập lại mật khẩu mới"
              />
            </View>
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            <Button
              className="w-full bg-[#8ec5ff]"
              disabled={isResetting}
              onPress={onResetPassword}>
              {isResetting ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <Text className="text-foreground">Đặt lại mật khẩu</Text>
              )}
            </Button>
          </View>
        )}
      </DialogContent>
    </Dialog>
  );
}
