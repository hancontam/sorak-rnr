import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

export const unstable_settings = { initialRouteName: 'index' };

export default function SettingsLayout() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Cài đặt',
          headerBackVisible: false,
          headerLeft: () => (
            <Button
              size="icon"
              variant="ghost"
              accessibilityLabel="Về trang chính"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else
                  router.replace(
                    role === AUTH_ROLES.parent
                      ? '/(parent)/(tabs)/child-profile'
                      : '/(teacher)/(tabs)/overview'
                  );
              }}>
              <Icon as={ChevronLeft} size={20} />
            </Button>
          ),
        }}
      />
      <Stack.Screen name="profile" options={{ title: 'Hồ sơ cá nhân' }} />
      <Stack.Screen name="appearance" options={{ title: 'Giao diện' }} />
      <Stack.Screen name="account" options={{ title: 'Quản lý tài khoản' }} />
      <Stack.Screen name="change-password" options={{ title: 'Đổi mật khẩu' }} />
      <Stack.Screen name="two-factor" options={{ title: 'Xác thực hai bước' }} />
      <Stack.Screen name="about" options={{ title: 'Giới thiệu' }} />
    </Stack>
  );
}
