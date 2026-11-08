import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export const unstable_settings = { initialRouteName: 'index' };

export default function SettingsLayout() {
  const router = useRouter();

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
              accessibilityLabel="Về tài khoản"
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/session');
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
