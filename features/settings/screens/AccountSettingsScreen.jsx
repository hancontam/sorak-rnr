import {
  SettingsGroup,
  SettingsMenuRow,
  SettingsSheetLayout,
  Text,
  TwoFactorSheet,
} from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { useTwoFactor } from '@/features/auth/hooks/useTwoFactor';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { KeyRound, UserRound } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const twoFactor = useTwoFactor();
  const isParent = user?.role === 'PARENT_PH';
  const enabled = Boolean(user?.is_2fa_enabled);
  const canUseEmailTwoFactor = !isParent && Boolean(user?.email);

  return (
    <SettingsSheetLayout title="Quản lý tài khoản" onBack={() => router.back()}>
      <View className="gap-4">
        <SettingsGroup title="VAI TRÒ">
          <SettingsMenuRow label={isParent ? 'Phụ huynh' : 'Giáo viên'} icon={UserRound} />
        </SettingsGroup>
        <SettingsGroup title="BẢO MẬT">
          <SettingsMenuRow label="Đổi mật khẩu" icon={KeyRound} />
          {canUseEmailTwoFactor ? (
            <View className="min-h-[70px] flex-row items-center justify-between rounded bg-card px-4 py-2.5">
              <View className="flex-1 pr-3">
                <Text className="text-sm">Xác thực 2 bước qua Email</Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  Yêu cầu mã OTP ở phiên đăng nhập mới
                </Text>
              </View>
              {twoFactor.isRequesting ? (
                <ActivityIndicator size="small" />
              ) : (
                <Switch
                  checked={enabled}
                  onCheckedChange={enabled ? twoFactor.startDisable : twoFactor.startEnable}
                  disabled={twoFactor.isSubmitting}
                  accessibilityLabel="Xác thực 2 bước qua Email"
                />
              )}
            </View>
          ) : !isParent ? (
            <Text className="px-1 text-xs text-muted-foreground">
              Cần liên kết email để bật xác thực 2 bước.
            </Text>
          ) : null}
          {twoFactor.notice ? (
            <Text className="px-1 text-xs text-muted-foreground">{twoFactor.notice}</Text>
          ) : null}
        </SettingsGroup>
      </View>
      <TwoFactorSheet
        step={twoFactor.step}
        onClose={twoFactor.close}
        email={user?.email}
        otp={twoFactor.otp}
        onOtpChange={(value) => {
          twoFactor.setOtp(value);
          twoFactor.setError('');
        }}
        password={twoFactor.password}
        onPasswordChange={(value) => {
          twoFactor.setPassword(value);
          twoFactor.setError('');
        }}
        error={twoFactor.error}
        onSubmit={twoFactor.submit}
        isSubmitting={twoFactor.isSubmitting}
      />
    </SettingsSheetLayout>
  );
}
