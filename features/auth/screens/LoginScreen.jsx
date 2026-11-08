import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  GraduationCap,
  School,
  UsersRound,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';

import { AuthSubmitButton } from '../components/AuthSubmitButton';
import { LoginError } from '../components/LoginError';
import { LoginOtpForm } from '../components/LoginOtpForm';
import { RoleSheet } from '../components/RoleSheet';
import { TurnstileChallenge } from '../components/TurnstileChallenge';
import { useAuthTypography } from '../hooks/useAuthTypography';
import { useLogin } from '../hooks/useLogin';
import { AUTH_ROLES, isMobileRole, roleLabel } from '../utils/auth-roles';

export default function LoginScreen() {
  const { role } = useLocalSearchParams();
  if (Platform.OS === 'web' || !isMobileRole(role)) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-background p-4">
        <View className="mx-auto w-full max-w-md gap-4">
          <Text role="heading" className="text-lg font-semibold">
            Chọn loại tài khoản
          </Text>
          <Text className="text-sm text-muted-foreground">
            Quay lại màn hình đầu để tiếp tục trên ứng dụng di động.
          </Text>
          <Link href="/" replace asChild>
            <Button variant="outline" size="sm">
              <Text className="text-xs">Quay lại</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }
  return <LoginFlow key={role} role={role} />;
}

function LoginFlow({ role }) {
  const router = useRouter();
  const typography = useAuthTypography();
  const parent = role === AUTH_ROLES.parent;
  const accountLabel = parent ? 'Mã học sinh' : 'Mã cán bộ';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const challengeOpen = useRef(false);
  const passwordField = useRef(null);
  const {
    submitLogin,
    submitOtp,
    returnToCredentials,
    clearError,
    isPending,
    error,
    needsOtp,
    emailMasked,
    challengeUrl,
  } = useLogin(role);
  const canSubmit = username.trim().length >= 3 && password.length >= 6;

  function openChallenge() {
    if (!canSubmit || isPending || challengeOpen.current) return;
    Keyboard.dismiss();
    clearError();
    challengeOpen.current = true;
    setShowChallenge(true);
  }

  function closeChallenge() {
    challengeOpen.current = false;
    setShowChallenge(false);
  }

  function handleVerified(captchaToken) {
    if (!challengeOpen.current) return;
    closeChallenge();
    setShowPassword(false);
    setPassword('');
    void submitLogin({ username: username.trim(), password, captchaToken, remember });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="mx-auto w-full max-w-md gap-4 px-4 pb-6 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          <Link href="/" dismissTo asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              hitSlop={6}
              accessibilityLabel="Quay lại màn hình đầu">
              <Icon as={ArrowLeft} size={16} />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-lg px-2.5"
            hitSlop={8}
            disabled={isPending || needsOtp}
            accessibilityLabel={`Đổi vai trò đăng nhập, đang chọn ${roleLabel(role)}`}
            onPress={() => {
              Keyboard.dismiss();
              setRoleSheetOpen(true);
            }}>
            <Icon as={parent ? UsersRound : GraduationCap} size={14} className="text-brand-link" />
            <Text className="text-xs" style={typography.semiBold}>
              {roleLabel(role)}
            </Text>
            <Text className="text-[10px] text-muted-foreground" style={typography.mono}>
              Đổi vai trò
            </Text>
            <Icon as={ChevronDown} size={13} className="text-muted-foreground" />
          </Button>
        </View>
        <RoleBanner role={role} typography={typography} />
        {needsOtp ? (
          <LoginOtpForm
            typography={typography}
            emailMasked={emailMasked}
            pending={isPending}
            error={error}
            onEdit={clearError}
            onSubmit={(otp) => {
              Keyboard.dismiss();
              void submitOtp(otp);
            }}
            onBack={returnToCredentials}
          />
        ) : (
          <>
            <Card className="gap-3.5 rounded-2xl py-4">
              <CardHeader className="gap-0.5 px-4">
                <CardTitle className="text-sm leading-5" style={typography.semiBold}>
                  Đăng nhập tài khoản
                </CardTitle>
                <CardDescription className="text-xs leading-[19px]" style={typography.regular}>
                  Nhập thông tin tài khoản để xác minh bảo mật qua WebView.
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-3.5 px-4">
                <View className="gap-1.5">
                  <Label
                    nativeID="account-label"
                    className="text-xs leading-4"
                    style={typography.medium}>
                    {accountLabel}
                  </Label>
                  <Input
                    className="h-auto min-h-[34px] rounded-lg py-1.5 text-xs leading-4 sm:h-auto"
                    style={typography.regular}
                    aria-labelledby="account-label"
                    accessibilityLabel={accountLabel}
                    placeholder={parent ? 'Nhập mã học sinh' : 'Nhập mã cán bộ'}
                    value={username}
                    onChangeText={(value) => {
                      setUsername(value);
                      clearError();
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    editable={!isPending}
                    maxLength={100}
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => passwordField.current?.focus()}
                  />
                </View>
                <View className="gap-1.5">
                  <Label
                    nativeID="password-label"
                    className="text-xs leading-4"
                    style={typography.medium}>
                    Mật khẩu
                  </Label>
                  <View className="min-h-[34px] flex-row items-center overflow-hidden rounded-lg border border-input bg-background shadow-sm shadow-black/5 dark:bg-input/30">
                    <Input
                      ref={passwordField}
                      className="h-auto min-h-8 w-auto flex-1 rounded-none border-0 bg-transparent py-1.5 pr-1 text-xs leading-4 shadow-none dark:bg-transparent sm:h-auto"
                      style={typography.regular}
                      aria-labelledby="password-label"
                      accessibilityLabel="Mật khẩu"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearError();
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="current-password"
                      secureTextEntry={!showPassword}
                      editable={!isPending}
                      maxLength={100}
                      returnKeyType="go"
                      onSubmitEditing={openChallenge}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-0.5 size-8 shrink-0"
                      hitSlop={5}
                      onPress={() => setShowPassword((value) => !value)}
                      accessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      disabled={isPending}>
                      <Icon
                        as={showPassword ? EyeOff : Eye}
                        size={14}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </View>
                </View>
                <View className="flex-row items-start gap-2.5 pt-0.5">
                  <Checkbox
                    className="mt-0.5"
                    checked={remember}
                    onCheckedChange={setRemember}
                    disabled={isPending}
                    hitSlop={8}
                    accessibilityLabel="Ghi nhớ phiên đăng nhập"
                    aria-labelledby="remember-label"
                  />
                  <View className="flex-1 gap-0.5">
                    <Label
                      nativeID="remember-label"
                      className="text-xs leading-4"
                      style={typography.medium}
                      disabled={isPending}
                      onPress={() => setRemember((value) => !value)}>
                      Ghi nhớ phiên đăng nhập
                    </Label>
                    <Text
                      className="text-[11px] leading-4 text-muted-foreground"
                      style={typography.regular}>
                      Giữ phiên trên thiết bị này khi mở lại ứng dụng.
                    </Text>
                  </View>
                </View>
                <LoginError message={error} typography={typography} />
                <AuthSubmitButton
                  label="Đăng nhập (WebView)"
                  labelStyle={typography.semiBold}
                  icon={ExternalLink}
                  pending={isPending}
                  disabled={!canSubmit}
                  onPress={openChallenge}
                />
              </CardContent>
            </Card>
            {parent ? (
              <Alert icon={School}>
                <AlertTitle className="text-xs" style={typography.semiBold}>
                  Quên mật khẩu?
                </AlertTitle>
                <AlertDescription className="text-[11px] leading-[15px]" style={typography.regular}>
                  Phụ huynh vui lòng liên hệ giáo viên chủ nhiệm để được hỗ trợ.
                </AlertDescription>
              </Alert>
            ) : null}
          </>
        )}
      </ScrollView>
      <RoleSheet
        visible={roleSheetOpen}
        typography={typography}
        selectedRole={role}
        onClose={() => setRoleSheetOpen(false)}
        onSelect={(nextRole) => {
          setRoleSheetOpen(false);
          if (nextRole !== role) router.setParams({ role: nextRole });
        }}
      />
      {showChallenge ? (
        <TurnstileChallenge
          url={challengeUrl}
          role={role}
          account={username.trim()}
          typography={typography}
          onVerified={handleVerified}
          onClose={closeChallenge}
        />
      ) : null}
    </SafeAreaView>
  );
}

function RoleBanner({ role, typography }) {
  return (
    <View className="flex-row items-center gap-2.5 rounded-2xl border border-border bg-muted/50 p-3">
      <View className="size-8 items-center justify-center rounded-lg border border-dashed border-input bg-background">
        <Text className="text-xs" style={typography.monoSemiBold}>
          S×H
        </Text>
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-xs leading-4" style={typography.semiBold}>
          Sorak × Mầm Non Hòn Tre
        </Text>
        <Text className="text-[11px] leading-4 text-muted-foreground" style={typography.regular}>
          Cổng đăng nhập dành cho {roleLabel(role)}
        </Text>
      </View>
    </View>
  );
}
