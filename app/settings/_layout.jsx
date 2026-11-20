import { Stack, useRouter } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { APP_HEADER, HeaderBackButton } from '@/components/shared/AppHeader';
import { useTranslation } from '@/shared/i18n/useLanguage';

export const unstable_settings = { initialRouteName: 'index' };

export default function SettingsLayout() {
  const t = useTranslation();
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);

  return (
    <Stack screenOptions={APP_HEADER}>
      <Stack.Screen
        name="index"
        options={{
          title: t('Cài đặt'),
          headerBackVisible: false,
          headerLeft: () => (
            <HeaderBackButton
              label={t('Về trang chính')}
              onPress={() => {
                if (router.canGoBack()) router.back();
                else
                  router.replace(
                    role === AUTH_ROLES.parent
                      ? '/(parent)/(tabs)/child-profile'
                      : '/(teacher)/(tabs)/overview'
                  );
              }}
            />
          ),
        }}
      />
      <Stack.Screen name="profile" options={{ title: t('Hồ sơ cá nhân') }} />
      <Stack.Screen name="appearance" options={{ title: t('Giao diện') }} />
      <Stack.Screen name="language" options={{ title: t('Ngôn ngữ') }} />
      <Stack.Screen name="account" options={{ title: t('Quản lý tài khoản') }} />
      <Stack.Screen name="change-password" options={{ title: t('Đổi mật khẩu') }} />
      <Stack.Screen name="two-factor" options={{ title: t('Xác thực hai bước') }} />
      <Stack.Screen name="about" options={{ title: t('Giới thiệu') }} />
      <Stack.Screen name="notifications" options={{ title: t('Thông báo') }} />
      <Stack.Screen name="legal/[doc]" options={{ title: '' }} />
    </Stack>
  );
}
