import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { SessionGate } from '@/features/auth/components/SessionGate';
import { useSessionBootstrap } from '@/features/auth/hooks/useSessionBootstrap';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { useRestoreThemePreference } from '@/features/settings/hooks/useThemePreference';
import { NAV_THEME } from '@/lib/theme';
import { createQueryClient } from '@/shared/api/query-client';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const { colorScheme } = useColorScheme();
  useRestoreThemePreference();

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

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AuthStack />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthStack() {
  const { status, error, retry, signOut } = useSessionBootstrap();
  const role = useAuthStore((state) => state.user?.role);

  return (
    <SessionGate status={status} error={error} onRetry={retry} onSignOut={signOut}>
      <Stack>
        <Stack.Protected guard={status === 'signed-out'}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ title: 'Đăng nhập', headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in' && role === AUTH_ROLES.teacher}>
          <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in' && role === AUTH_ROLES.parent}>
          <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={status === 'signed-in'}>
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </SessionGate>
  );
}
