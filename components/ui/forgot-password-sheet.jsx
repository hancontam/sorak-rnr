import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ArrowRight } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ForgotPasswordSheet({
  open,
  onOpenChange,
  step,
  email,
  onEmailChange,
  otp,
  onOtpChange,
  onSendEmail,
  onVerifyOtp,
  onResendOtp,
  isSending,
  isVerifying,
  error,
}) {
  const insets = useSafeAreaInsets();
  const otpInput = React.useRef(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="items-end justify-end bg-foreground/35 p-0"
        className="mx-0 w-full max-w-full gap-0 rounded-b-none rounded-t-[36px] border-border bg-card px-6 pt-7 shadow-lg shadow-black/20"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
        <DialogTitle className="text-xl font-medium">
          {step === 'email' ? 'Quên mật khẩu' : 'Nhập mã OTP'}
        </DialogTitle>

        {step === 'email' ? (
          <View className="mt-5 gap-3.5">
            <Text className="text-sm text-secondary-foreground">
              Nhập email và chúng tôi sẽ gửi bạn một mã OTP để đặt lại mật khẩu.
            </Text>
            <Input
              value={email}
              onChangeText={onEmailChange}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="Email nhận mã OTP"
            />
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
        ) : (
          <View className="mt-5 gap-4">
            <Text className="text-sm text-secondary-foreground">
              Nhập mã xác thực đã gửi đến {email}
            </Text>
            <Pressable
              className="relative flex-row items-center justify-center gap-2"
              onPress={() => otpInput.current?.focus()}
              accessibilityRole="button"
              accessibilityLabel="Nhập mã OTP gồm 6 chữ số">
              {Array.from({ length: 6 }, (_, index) => (
                <React.Fragment key={index}>
                  {index === 3 ? <View className="h-px w-7 bg-foreground" /> : null}
                  <View
                    className={`h-11 flex-1 items-center justify-center rounded-md border bg-background ${
                      index === otp.length ? 'border-[#8ec5ff]' : 'border-border'
                    }`}>
                    <Text className="text-base">{otp[index] || ''}</Text>
                  </View>
                </React.Fragment>
              ))}
              <TextInput
                ref={otpInput}
                className="absolute inset-0 opacity-0"
                value={otp}
                onChangeText={(value) => onOtpChange(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={6}
                caretHidden
                accessibilityLabel="Mã OTP"
              />
            </Pressable>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
