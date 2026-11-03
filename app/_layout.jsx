import '@/global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRestoreSession } from '@/features/auth/hooks/useSession';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRestoreThemePreference } from '@/features/settings/hooks/useThemePreference';
import { usePreferencesStore } from '@/features/settings/store/preferences.store';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
export default function RootLayout() {
  useRestoreSession();
  useRestoreThemePreference();
  const user = useAuthStore((state) => state.user);
  const isRestoring = useAuthStore((state) => state.isRestoring);
  const isThemeReady = usePreferencesStore((state) => state.isThemeReady);
  const { colorScheme } = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    JetBrainsMono_400Regular: require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
  });

  React.useEffect(() => {
    if ((fontsLoaded || fontError) && isThemeReady) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, isThemeReady]);

  if ((!fontsLoaded && !fontError) || !isThemeReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!user}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth" />
            </Stack.Protected>
            <Stack.Protected guard={!!user || isRestoring}>
              <Stack.Screen name="home" />
              <Stack.Screen
                name="settings"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack.Protected>
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
