import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BottomSheetModalProvider } from '@/components/ui/bottom-sheet';
import { Toaster } from '@/components/ui/sonner';

import { SessionGate } from '@/features/auth/components/SessionGate';
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import PushNotifications from '@/features/notification/components/PushNotifications';
import { useRestoreThemePreference } from '@/features/settings/hooks/useThemePreference';
import { FONT_ASSETS } from '@/lib/fonts';
import { NAV_THEME } from '@/lib/theme';
import { createQueryClient } from '@/shared/api/query-client';
import { useLocale, useRestoreLanguage, useTranslation } from '@/shared/i18n/useLanguage';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
// Giữ splash đến khi Inter/JetBrains Mono sẵn sàng để màn đầu không nháy font hệ thống.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const fontsReady = fontsLoaded || Boolean(fontError);
  const { colorScheme } = useColorScheme();
  const locale = useLocale();
  useRestoreThemePreference();
  useRestoreLanguage();

  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    // Web đã có listener focus của TanStack Query; native dùng AppState.
    if (Platform.OS === 'web') return;

    if (AppState.currentState) {
      focusManager.setFocused(AppState.currentState === 'active');
    }

    const subscription = AppState.addEventListener('change', (state) => {
      focusManager.setFocused(state === 'active');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Lỗi nạp font không chặn app; Text rơi về font hệ thống.
    if (fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <BottomSheetModalProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <AuthStack />
            <PushNotifications />
            <Toaster />
            <PortalHost />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AuthStack() {
  const t = useTranslation();
  const { status, error, retry, signOut } = useSessionBootstrap();
  const role = useAuthStore((state) => state.user?.role);
  const accountId = useAuthStore((state) => state.user?.id);

  return (
    <SessionGate status={status} error={error} onRetry={retry} onSignOut={signOut}>
      <Stack key={accountId ?? 'signed-out'}>
        <Stack.Protected guard={status === 'signed-out'}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: t('Đăng nhập'), headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in' && role === AUTH_ROLES.teacher}>
          <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in' && role === AUTH_ROLES.parent}>
          <Stack.Screen name="(parent)" options={{ headerShown: false }} />
          <Stack.Screen name="add-account" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-out' || role === AUTH_ROLES.parent}>
          <Stack.Screen
            name="accounts"
            options={{ title: t('Chuyển tài khoản'), headerTitleAlign: 'center' }}
          />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in'}>
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </SessionGate>
  );
}
