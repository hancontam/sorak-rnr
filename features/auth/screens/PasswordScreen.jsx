import {
  AuthScreenHeader,
  Button,
  ForgotPasswordSheet,
  Icon,
  Input,
  LoginOtpSheet,
  Text,
} from '@/components/ui';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useLoginOtp } from '@/features/auth/hooks/useLoginOtp';
import { usePasswordRecovery } from '@/features/auth/hooks/usePasswordRecovery';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordScreen() {
  const router = useRouter();
  const { role, username } = useLocalSearchParams();
  const isParent = role === 'PARENT_PH';
  const [password, setPassword] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const [loginChallenge, setLoginChallenge] = React.useState(null);
  const [loginOtpCode, setLoginOtpCode] = React.useState('');
  const [loginOtpError, setLoginOtpError] = React.useState('');
  const login = useLogin();
  const loginOtp = useLoginOtp();
  const recovery = usePasswordRecovery();

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
        setLoginChallenge(result);
        setLoginOtpCode('');
        setLoginOtpError('');
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
      recovery.start(username);
    }
  }

  async function verifyLoginChallenge() {
    if (loginOtpCode.length !== 6 || !loginChallenge?.tempToken) {
      setLoginOtpError('Vui lòng nhập đủ 6 chữ số của mã OTP.');
      return;
    }
    setLoginOtpError('');
    try {
      const result = await loginOtp.mutateAsync({
        tempToken: loginChallenge.tempToken,
        otp: loginOtpCode,
        role,
      });
      if (result.kind === 'web-only') {
        setLoginChallenge(null);
        setNotice('Tài khoản Ban giám hiệu vui lòng dùng dashboard web.');
      }
    } catch (error) {
      setLoginOtpError(error.response?.data?.message || error.message || 'Mã OTP không hợp lệ.');
    }
  }

  async function submitNewPassword() {
    if (await recovery.submitNewPassword())
      setNotice('Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.');
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
        open={recovery.open}
        onOpenChange={recovery.setOpen}
        step={recovery.step}
        identifier={recovery.identifier}
        destination={recovery.destination}
        otp={recovery.otp}
        onOtpChange={(value) => {
          recovery.setOtp(value);
          recovery.setError('');
        }}
        onSendEmail={recovery.sendEmail}
        onVerifyOtp={recovery.verifyOtp}
        onResendOtp={recovery.resendOtp}
        isSending={recovery.isSending}
        isVerifying={recovery.isVerifying}
        newPassword={recovery.newPassword}
        onNewPasswordChange={(value) => {
          recovery.setNewPassword(value);
          recovery.setError('');
        }}
        confirmPassword={recovery.confirmPassword}
        onConfirmPasswordChange={(value) => {
          recovery.setConfirmPassword(value);
          recovery.setError('');
        }}
        onResetPassword={submitNewPassword}
        isResetting={recovery.isResetting}
        error={recovery.error}
      />
      <LoginOtpSheet
        open={!!loginChallenge}
        onOpenChange={(open) => {
          if (!open) setLoginChallenge(null);
        }}
        emailMasked={loginChallenge?.emailMasked}
        otp={loginOtpCode}
        onOtpChange={(value) => {
          setLoginOtpCode(value);
          setLoginOtpError('');
        }}
        onVerify={verifyLoginChallenge}
        isVerifying={loginOtp.isPending}
        error={loginOtpError}
      />
    </SafeAreaView>
  );
}
