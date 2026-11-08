import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { BackHandler, Keyboard, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import { AuthSubmitButton } from '../components/AuthSubmitButton';
import { LoginError } from '../components/LoginError';
import { OtpCodeInput } from '../components/OtpCodeInput';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

// Cùng quy tắc với validator resetPasswordSchema của API.
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/])/;

export function PasswordRecoveryScreen({ initialIdentifier, typography, onBack, onComplete }) {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const recovery = usePasswordRecovery();
  const { challenge, otpVerified, otpNeedsResend, secondsLeft, error, isPending, clearError } =
    recovery;
  const code = identifier.trim();
  const canSend = code.length >= 2 && secondsLeft === 0;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isPending) onBack();
      return true;
    });
    return () => subscription.remove();
  }, [isPending, onBack]);

  async function sendCode() {
    if (isPending || !canSend) return;
    Keyboard.dismiss();
    if (await recovery.sendCode(challenge?.identifier ?? code)) setOtp('');
  }

  async function submit() {
    if (isPending || otpNeedsResend || (!otpVerified && otp.length !== 6)) return;
    if (password.length < 8 || !PASSWORD_RULE.test(password)) {
      setPasswordError('Dùng ít nhất 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt.');
      return;
    }
    Keyboard.dismiss();
    const recoveredIdentifier = await recovery.savePassword(otp, password);
    if (recoveredIdentifier) onComplete(recoveredIdentifier);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const resendLabel = secondsLeft > 0 ? `Gửi lại sau ${minutes}:${seconds}` : 'Gửi lại mã';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="mx-auto w-full max-w-md gap-4 px-4 pb-6 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="icon"
            className="size-8 rounded-lg"
            hitSlop={6}
            accessibilityLabel="Quay lại đăng nhập"
            disabled={isPending}
            onPress={onBack}>
            <Icon as={ArrowLeft} size={16} />
          </Button>
          <Badge variant="secondary">
            <Text className="text-[11px]" style={typography.mono}>
              Bước {challenge ? '02' : '01'} / 02
            </Text>
          </Badge>
        </View>
        <Card className="gap-3.5 rounded-2xl py-4">
          <CardHeader className="gap-1 px-4">
            {!challenge ? (
              <Badge className="self-start" variant="brand">
                <Text className="text-[11px]" style={typography.semiBold}>
                  Giáo viên
                </Text>
              </Badge>
            ) : null}
            <CardTitle className="text-sm leading-5" style={typography.semiBold}>
              {challenge ? 'Nhập mã xác thực OTP' : 'Tìm lại mật khẩu'}
            </CardTitle>
            <CardDescription className="text-xs leading-[19px]" style={typography.regular}>
              {challenge
                ? `Mã 6 số đã được gửi đến ${challenge.emailMasked || 'email liên kết với tài khoản'}.`
                : 'Nhập mã cán bộ để nhận OTP qua email đã liên kết với tài khoản.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-3.5 px-4">
            {challenge ? (
              <>
                {otpVerified ? (
                  <Text
                    accessibilityLiveRegion="polite"
                    className="text-xs"
                    style={typography.medium}>
                    Đã xác minh mã OTP.
                  </Text>
                ) : (
                  <>
                    <OtpCodeInput
                      otp={otp}
                      pending={isPending || otpNeedsResend}
                      typography={typography}
                      onChange={(value) => {
                        setOtp(value);
                        clearError();
                      }}
                    />
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto self-end px-0 py-1"
                      disabled={isPending || !canSend}
                      onPress={sendCode}>
                      <Text className="text-xs" style={typography.medium}>
                        {resendLabel}
                      </Text>
                    </Button>
                  </>
                )}
                <View className="gap-1.5">
                  <Label
                    nativeID="recovery-password-label"
                    className="text-xs leading-4"
                    style={typography.medium}>
                    Mật khẩu mới
                  </Label>
                  <View className="min-h-[34px] flex-row items-center rounded-lg border border-input bg-background dark:bg-input/30">
                    <Input
                      className="h-auto min-h-8 w-auto flex-1 rounded-none border-0 bg-transparent py-1.5 pr-1 text-xs leading-4 shadow-none dark:bg-transparent sm:h-auto"
                      style={typography.regular}
                      aria-labelledby="recovery-password-label"
                      accessibilityLabel="Mật khẩu mới"
                      placeholder="Nhập mật khẩu mới"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setPasswordError('');
                        clearError();
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      secureTextEntry={!visible}
                      editable={!isPending}
                      maxLength={100}
                      returnKeyType="done"
                      onSubmitEditing={submit}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-0.5 size-8 shrink-0"
                      hitSlop={5}
                      disabled={isPending}
                      accessibilityLabel={visible ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                      onPress={() => setVisible((value) => !value)}>
                      <Icon
                        as={visible ? EyeOff : Eye}
                        size={14}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </View>
                  <Text
                    className="text-[11px] leading-4 text-muted-foreground"
                    style={typography.regular}>
                    Ít nhất 8 ký tự, có chữ hoa, chữ số và ký tự đặc biệt.
                  </Text>
                </View>
                <LoginError message={passwordError || error} typography={typography} />
                <AuthSubmitButton
                  label="Đặt lại mật khẩu"
                  labelStyle={typography.semiBold}
                  pending={isPending}
                  disabled={!password || otpNeedsResend || (!otpVerified && otp.length !== 6)}
                  onPress={submit}
                />
              </>
            ) : (
              <>
                <View className="gap-1.5">
                  <Label
                    nativeID="recovery-account-label"
                    className="text-xs leading-4"
                    style={typography.medium}>
                    Mã cán bộ
                  </Label>
                  <Input
                    className="h-auto min-h-[34px] rounded-lg py-1.5 text-xs leading-4 sm:h-auto"
                    style={typography.regular}
                    aria-labelledby="recovery-account-label"
                    accessibilityLabel="Mã cán bộ"
                    placeholder="Nhập mã cán bộ"
                    value={identifier}
                    onChangeText={(value) => {
                      setIdentifier(value);
                      clearError();
                    }}
                    editable={!isPending}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={150}
                    returnKeyType="send"
                    onSubmitEditing={sendCode}
                  />
                </View>
                <LoginError message={error} typography={typography} />
                <AuthSubmitButton
                  label={secondsLeft > 0 ? resendLabel : 'Gửi mã xác thực OTP'}
                  labelStyle={typography.semiBold}
                  icon={ArrowRight}
                  pending={isPending}
                  disabled={!canSend}
                  onPress={sendCode}
                />
              </>
            )}
          </CardContent>
        </Card>
        {!challenge ? (
          <Accordion
            type="single"
            collapsible
            defaultValue="help"
            className="rounded-2xl border border-border bg-card px-4">
            <AccordionItem value="help" className="border-b-0">
              <AccordionTrigger className="py-3">
                <Text className="text-xs" style={typography.semiBold}>
                  Không nhận được mã OTP?
                </Text>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <Text
                  className="text-xs leading-[19px] text-muted-foreground"
                  style={typography.regular}>
                  Kiểm tra hộp thư đến và thư rác. Nếu chưa liên kết email, hãy liên hệ Ban giám
                  hiệu.
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
