import { AuthScreenHeader, Button, ForgotPasswordSheet, Icon, Input, Text } from '@/components/ui';
import { requestPasswordReset, verifyPasswordResetOtp } from '@/features/auth/api/auth.api';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordScreen() {
  const router = useRouter();
  const { role, username } = useLocalSearchParams();
  const isParent = role === 'PARENT_PH';
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const [isForgotOpen, setIsForgotOpen] = React.useState(false);
  const [forgotStep, setForgotStep] = React.useState('email');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [forgotError, setForgotError] = React.useState('');
  const login = useLogin();
  const sendResetEmail = useMutation({ mutationFn: requestPasswordReset });
  const verifyResetOtp = useMutation({ mutationFn: verifyPasswordResetOtp });

  async function submitLogin() {
    if (!password) {
      setNotice('Vui lòng nhập mật khẩu.');
      return;
    }
    setNotice('');
    try {
      const result = await login.mutateAsync({ username, password, role });
      if (result.kind === 'web-only') {
        setNotice('Tài khoản Ban giám hiệu vui lòng dùng dashboard web.');
      } else if (result.kind === 'requires-2fa') {
        setNotice('Tài khoản cần xác thực 2FA trước khi đăng nhập.');
      } else {
        setNotice('Đăng nhập thành công.');
      }
    } catch (error) {
      setNotice(error.response?.data?.message || error.message || 'Đăng nhập không thành công.');
    }
  }

  function forgotPassword() {
    if (isParent) {
      Alert.alert('Quên mật khẩu', 'Vui lòng liên hệ giáo viên chủ nhiệm để được hỗ trợ.');
    } else {
      Keyboard.dismiss();
      setForgotStep('email');
      setForgotError('');
      setIsForgotOpen(true);
    }
  }

  async function submitResetEmail() {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setForgotError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setForgotError('');
    try {
      await sendResetEmail.mutateAsync(value);
      setEmail(value);
      setForgotStep('otp');
    } catch (error) {
      setForgotError(error.response?.data?.message || error.message || 'Không gửi được mã xác thực.');
    }
  }

  async function submitResetOtp() {
    if (otp.length !== 6) {
      setForgotError('Vui lòng nhập đủ 6 chữ số của mã OTP.');
      return;
    }
    setForgotError('');
    try {
      await verifyResetOtp.mutateAsync({ email, otp });
      setIsForgotOpen(false);
      setNotice('Mã OTP đã được xác thực.');
    } catch (error) {
      setForgotError(error.response?.data?.message || error.message || 'Mã OTP không hợp lệ.');
    }
  }

  async function resendResetOtp() {
    setForgotError('');
    try {
      await sendResetEmail.mutateAsync(email);
    } catch (error) {
      setForgotError(error.response?.data?.message || error.message || 'Không gửi lại được mã.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AuthScreenHeader
          title={isParent ? 'Phụ huynh' : 'Đăng nhập'}
          onBack={() => router.back()}
        />
        <View className="gap-5 px-6 pt-6">
          <Text className="text-sm">
            {isParent ? 'Chào mừng phụ huynh trở lại!' : `Chào mừng trở lại, ${username}!`}
          </Text>
          <View className="gap-3">
            <View className="gap-2">
              <Text className="text-[11px] font-medium">Mật khẩu</Text>
              <View>
                <Input
                  autoFocus
                  autoComplete="current-password"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (notice) setNotice('');
                  }}
                  onSubmitEditing={submitLogin}
                  returnKeyType="done"
                  className="pr-11"
                  accessibilityLabel="Mật khẩu"
                />
                <Pressable
                  className="absolute right-0 top-0 h-10 w-11 items-center justify-center"
                  onPress={() => setIsPasswordVisible((visible) => !visible)}
                  accessibilityRole="button"
                  accessibilityLabel={isPasswordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                  <Icon as={isPasswordVisible ? Eye : EyeOff} size={20} strokeWidth={1} />
                </Pressable>
              </View>
              {notice ? <Text className="text-xs text-muted-foreground">{notice}</Text> : null}
            </View>
            <Button
              className="w-full bg-[#8ec5ff] opacity-100 active:bg-[#8ec5ff]/90"
              disabled={login.isPending}
              accessibilityState={{ busy: login.isPending }}
              accessibilityLabel={login.isPending ? 'Đang đăng nhập' : 'Đăng nhập'}
              onPress={submitLogin}>
              {login.isPending ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <Text className="text-foreground">Đăng nhập</Text>
              )}
            </Button>
          </View>
          <Button variant="link" className="w-full" onPress={forgotPassword}>
            <Text className="font-bold text-[#5faaf9]">Quên mật khẩu?</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
      <ForgotPasswordSheet
        open={isForgotOpen}
        onOpenChange={setIsForgotOpen}
        step={forgotStep}
        email={email}
        onEmailChange={(value) => { setEmail(value); setForgotError(''); }}
        otp={otp}
        onOtpChange={(value) => { setOtp(value); setForgotError(''); }}
        onSendEmail={submitResetEmail}
        onVerifyOtp={submitResetOtp}
        onResendOtp={resendResetOtp}
        isSending={sendResetEmail.isPending}
        isVerifying={verifyResetOtp.isPending}
        error={forgotError}
      />
    </SafeAreaView>
  );
}
