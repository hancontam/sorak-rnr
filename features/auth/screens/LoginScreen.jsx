import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  LogIn,
  UsersRound,
} from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Keyboard, Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AuthSubmitButton } from '../components/AuthSubmitButton';
import { LoginError } from '../components/LoginError';
import { LoginOtpForm } from '../components/LoginOtpForm';
import { RoleSheet } from '../components/RoleSheet';
import { useLogin } from '../hooks/useLogin';
import { useAuthStore } from '../store/auth.store';
import { AUTH_ROLES, isMobileRole, roleLabel } from '../utils/auth-roles';
import { PasswordRecoveryScreen } from './PasswordRecoveryScreen';

export default function LoginScreen({ adding = false }) {
  const t = useTranslation();
  const params = useLocalSearchParams();
  const role = adding ? AUTH_ROLES.parent : params.role;
  const accountId = typeof params.accountId === 'string' ? params.accountId : undefined;
  if (Platform.OS === 'web' || !isMobileRole(role)) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-background p-4">
        <View className="mx-auto w-full max-w-md gap-4">
          <Text role="heading" className="text-lg font-semibold">
            {t('Chọn loại tài khoản')}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {t('Quay lại màn hình đầu để tiếp tục trên ứng dụng di động.')}
          </Text>
          <Link href="/" replace asChild>
            <Button variant="outline" size="sm">
              <Text className="text-xs">{t('Quay lại')}</Text>
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <LoginFlow
      key={`${role}:${accountId || ''}`}
      role={role}
      adding={adding}
      accountId={accountId}
    />
  );
}

function LoginFlow({ role, adding, accountId }) {
  const t = useTranslation();
  const router = useRouter();
  const parent = role === AUTH_ROLES.parent;
  const accountLabel = parent ? t('Mã học sinh') : t('Mã cán bộ');
  const [username, setUsername] = useState(
    () =>
      useAuthStore.getState().linkedAccounts.find((account) => account.id === accountId)
        ?.username || ''
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const closeRecovery = useCallback(() => setRecovering(false), []);
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
  } = useLogin(role, {
    adding,
    accountId,
    onAuthenticated: adding ? () => router.replace('/(parent)/(tabs)/child-profile') : undefined,
  });
  const canSubmit = username.trim().length >= 3 && password.length >= 6;

  // Đăng nhập trực tiếp: backend bỏ qua Turnstile cho app mobile (X-Client-Platform), không mở WebView.
  function submitCredentials() {
    if (!canSubmit || isPending) return;
    Keyboard.dismiss();
    clearError();
    const secret = password;
    setShowPassword(false);
    setPassword('');
    void submitLogin({ username: username.trim(), password: secret, remember });
  }

  function openRecovery() {
    if (parent || isPending || needsOtp) return;
    Keyboard.dismiss();
    setPassword('');
    setShowPassword(false);
    clearError();
    setRecovering(true);
  }

  if (recovering) {
    return (
      <PasswordRecoveryScreen
        initialIdentifier={username.trim()}
        onBack={closeRecovery}
        onComplete={(identifier) => {
          setUsername(identifier);
          setRecovering(false);
          toast.success(t('Đã đặt lại mật khẩu'), {
            description: t('Đăng nhập bằng mật khẩu mới để tiếp tục.'),
          });
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="mx-auto w-full max-w-md gap-4 px-4 pb-6 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            hitSlop={4}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace(adding ? '/(parent)/(tabs)/child-profile' : '/')
            }
            accessibilityLabel={t('Quay lại')}>
            <Icon as={ArrowLeft} size={18} />
          </Button>
          {adding || accountId ? (
            <Text className="text-sm font-semibold">
              {t(adding ? 'Thêm tài khoản' : 'Đăng nhập lại')}
            </Text>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 px-3"
            hitSlop={4}
            disabled={adding || Boolean(accountId) || isPending || needsOtp}
            accessibilityLabel={t('Đổi vai trò đăng nhập, đang chọn {role}', {
              role: t(roleLabel(role)),
            })}
            onPress={() => {
              Keyboard.dismiss();
              setRoleSheetOpen(true);
            }}>
            <Icon as={parent ? UsersRound : GraduationCap} size={14} className="text-brand-link" />
            <Text className="text-xs font-semibold">{t(roleLabel(role))}</Text>
            <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
          </Button>
        </View>
        {/* Tiêu đề theo vai trò như Figma (Phụ huynh / Nhà trường), thay khung thương hiệu cũ. */}
        <View className="gap-1 pt-2">
          <Text role="heading" className="text-xl font-semibold tracking-tight">
            {t(parent ? 'Phụ huynh' : 'Nhà trường')}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {t(parent ? 'Nhập mã học sinh của con.' : 'Nhập tài khoản được cấp.')}
          </Text>
        </View>
        {needsOtp ? (
          <LoginOtpForm
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
            <View className="gap-4">
              <View className="gap-1.5">
                <Label nativeID="account-label">{accountLabel}</Label>
                <Input
                  aria-labelledby="account-label"
                  accessibilityLabel={accountLabel}
                  placeholder={parent ? t('Nhập mã học sinh') : t('Nhập mã cán bộ')}
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
                <View className="flex-row flex-wrap items-center justify-between gap-x-2">
                  <Label nativeID="password-label">{t('Mật khẩu')}</Label>
                  {!parent ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto px-0 py-0"
                      hitSlop={8}
                      disabled={isPending}
                      onPress={openRecovery}>
                      <Text className="text-xs font-medium">{t('Quên mật khẩu?')}</Text>
                    </Button>
                  ) : null}
                </View>
                <View className="justify-center">
                  <Input
                    ref={passwordField}
                    className="pr-11"
                    aria-labelledby="password-label"
                    accessibilityLabel={t('Mật khẩu')}
                    placeholder={t('Nhập mật khẩu')}
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
                    onSubmitEditing={submitCredentials}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 size-8"
                    hitSlop={6}
                    onPress={() => setShowPassword((value) => !value)}
                    accessibilityLabel={showPassword ? t('Ẩn mật khẩu') : t('Hiện mật khẩu')}
                    disabled={isPending}>
                    <Icon
                      as={showPassword ? EyeOff : Eye}
                      size={16}
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
                  disabled={adding || Boolean(accountId) || isPending}
                  hitSlop={8}
                  accessibilityLabel={t('Ghi nhớ phiên đăng nhập')}
                  aria-labelledby="remember-label"
                />
                <View className="flex-1 gap-0.5">
                  <Label
                    nativeID="remember-label"
                    disabled={adding || Boolean(accountId) || isPending}
                    onPress={() => !adding && !accountId && setRemember((value) => !value)}>
                    {t('Ghi nhớ phiên đăng nhập')}
                  </Label>
                </View>
              </View>
              <LoginError message={error} />
              <AuthSubmitButton
                label={t('Đăng nhập')}
                icon={LogIn}
                pending={isPending}
                disabled={!canSubmit}
                onPress={submitCredentials}
              />
            </View>
            {/* Giáo viên tìm lại mật khẩu qua link "Quên mật khẩu?" ở ô mật khẩu; phụ huynh liên hệ GVCN. */}
            {parent ? (
              <Text className="text-center text-xs leading-5 text-muted-foreground">
                {t('Quên mật khẩu? Phụ huynh vui lòng liên hệ giáo viên chủ nhiệm để được hỗ trợ.')}
              </Text>
            ) : null}
          </>
        )}
      </KeyboardAwareScrollView>
      <RoleSheet
        visible={roleSheetOpen}
        selectedRole={role}
        onClose={() => setRoleSheetOpen(false)}
        onSelect={(nextRole) => {
          setRoleSheetOpen(false);
          if (nextRole !== role) router.setParams({ role: nextRole });
        }}
      />
    </SafeAreaView>
  );
}
