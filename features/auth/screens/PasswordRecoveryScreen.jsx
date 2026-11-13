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
import { OtpCodeInput } from '@/components/shared/OtpCodeInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AuthSubmitButton } from '../components/AuthSubmitButton';
import { LoginError } from '../components/LoginError';

import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

// Cùng quy tắc với validator resetPasswordSchema của API.
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/])/;

export function PasswordRecoveryScreen({ initialIdentifier, onBack, onComplete }) {
  const t = useTranslation();
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
      setPasswordError(t('Dùng ít nhất 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt.'));
      return;
    }
    Keyboard.dismiss();
    const recoveredIdentifier = await recovery.savePassword(otp, password);
    if (recoveredIdentifier) onComplete(recoveredIdentifier);
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const resendLabel =
    secondsLeft > 0 ? t('Gửi lại sau {minutes}:{seconds}', { minutes, seconds }) : t('Gửi lại mã');

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
            className="size-10 rounded-xl"
            hitSlop={4}
            accessibilityLabel={t('Quay lại đăng nhập')}
            disabled={isPending}
            onPress={onBack}>
            <Icon as={ArrowLeft} size={18} />
          </Button>
          <Badge variant="code">
            <Text>{t('Bước {step} / 02', { step: challenge ? '02' : '01' })}</Text>
          </Badge>
        </View>
        <Card>
          <CardHeader className="gap-1">
            {!challenge ? (
              <Badge className="self-start" variant="brand">
                <Text>{t('Giáo viên')}</Text>
              </Badge>
            ) : null}
            <CardTitle>{challenge ? t('Nhập mã xác thực OTP') : t('Tìm lại mật khẩu')}</CardTitle>
            <CardDescription className="leading-5">
              {challenge
                ? t('Mã 6 số đã được gửi đến {email}.', {
                    email: challenge.emailMasked || t('email liên kết với tài khoản'),
                  })
                : t('Nhập mã cán bộ để nhận OTP qua email đã liên kết với tài khoản.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="gap-4">
            {challenge ? (
              <>
                {otpVerified ? (
                  <Text accessibilityLiveRegion="polite" className="text-xs font-medium">
                    {t('Đã xác minh mã OTP.')}
                  </Text>
                ) : (
                  <>
                    <OtpCodeInput
                      otp={otp}
                      pending={isPending || otpNeedsResend}
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
                      <Text className="text-xs font-medium">{resendLabel}</Text>
                    </Button>
                  </>
                )}
                <View className="gap-1.5">
                  <Label nativeID="recovery-password-label">{t('Mật khẩu mới')}</Label>
                  <View className="justify-center">
                    <Input
                      className="pr-11"
                      aria-labelledby="recovery-password-label"
                      accessibilityLabel={t('Mật khẩu mới')}
                      placeholder={t('Nhập mật khẩu mới')}
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
                      className="absolute right-1 size-8"
                      hitSlop={6}
                      disabled={isPending}
                      accessibilityLabel={visible ? t('Ẩn mật khẩu mới') : t('Hiện mật khẩu mới')}
                      onPress={() => setVisible((value) => !value)}>
                      <Icon
                        as={visible ? EyeOff : Eye}
                        size={16}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </View>
                  <Text className="text-2xs leading-4 text-muted-foreground">
                    {t('Ít nhất 8 ký tự, có chữ hoa, chữ số và ký tự đặc biệt.')}
                  </Text>
                </View>
                <LoginError message={passwordError || error} />
                <AuthSubmitButton
                  label={t('Đặt lại mật khẩu')}
                  pending={isPending}
                  disabled={!password || otpNeedsResend || (!otpVerified && otp.length !== 6)}
                  onPress={submit}
                />
              </>
            ) : (
              <>
                <View className="gap-1.5">
                  <Label nativeID="recovery-account-label">{t('Mã cán bộ')}</Label>
                  <Input
                    aria-labelledby="recovery-account-label"
                    accessibilityLabel={t('Mã cán bộ')}
                    placeholder={t('Nhập mã cán bộ')}
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
                <LoginError message={error} />
                <AuthSubmitButton
                  label={secondsLeft > 0 ? resendLabel : t('Gửi mã xác thực OTP')}
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
                <Text className="text-xs font-semibold">{t('Không nhận được mã OTP?')}</Text>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <Text className="text-xs leading-5 text-muted-foreground">
                  {t(
                    'Kiểm tra hộp thư đến và thư rác. Nếu chưa liên kết email, hãy liên hệ Ban giám hiệu.'
                  )}
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
