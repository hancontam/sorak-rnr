import { Button } from '@/components/ui/button';
import { BottomSheetContent, Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { OtpCodeInput } from '@/components/ui/otp-code-input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { ArrowRight } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export function ForgotPasswordSheet({
  open,
  onOpenChange,
  step,
  identifier,
  onIdentifierChange,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent
        open={open}
        title={step === 'account' ? 'Quên mật khẩu' : step === 'otp' ? 'Nhập mã OTP' : 'Đặt lại mật khẩu'}>
        {step === 'account' ? (
          <View className="mt-5 gap-3.5">
            <Text className="text-sm text-secondary-foreground">
              Gửi mã OTP tới email đã liên kết với tài khoản cán bộ này để đặt lại mật khẩu.
            </Text>
            <Input
              value={identifier}
              onChangeText={onIdentifierChange}
              autoCorrect={false}
              autoCapitalize="none"
              editable={!isSending}
              accessibilityLabel="Mã cán bộ nhận OTP"
            />
            {error ? <Text className="text-xs text-destructive">{error}</Text> : null}
            <Button
              variant="secondary"
              className="w-full opacity-100"
              disabled={isSending}
              onPress={onSendEmail}>
              {isSending ? (
                <ThemedSpinner />
              ) : (
                <>
                  <Text>Gửi mã xác thực</Text>
                  <Icon as={ArrowRight} size={16} strokeWidth={2} />
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
              <Text className="text-brand-link font-bold">Gửi lại mã?</Text>
            </Button>
            <Button
              className="bg-brand active:bg-brand/90 w-full opacity-100"
              disabled={isVerifying}
              onPress={onVerifyOtp}>
              {isVerifying ? (
                <ThemedSpinner />
              ) : (
                <Text className="text-brand-foreground">Xác minh</Text>
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
            <Button className="bg-brand w-full" disabled={isResetting} onPress={onResetPassword}>
              {isResetting ? (
                <ThemedSpinner />
              ) : (
                <Text className="text-brand-foreground">Đặt lại mật khẩu</Text>
              )}
            </Button>
          </View>
        )}
      </BottomSheetContent>
    </Dialog>
  );
}
