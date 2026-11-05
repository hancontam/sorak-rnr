import { Stack } from 'expo-router';
import { ThemeProvider, useTheme } from 'expo-router/react-navigation';
import { useMemo } from 'react';

export default function SettingsLayout() {
  const theme = useTheme();
  // NativeStack paints its native container with theme.colors.background as well
  // as each scene's contentStyle. Both must be clear to reveal Home's backdrop.
  const overlayTheme = useMemo(
    () => ({
      ...theme,
      colors: { ...theme.colors, background: 'transparent' },
    }),
    [theme]
  );
  return (
    <ThemeProvider value={overlayTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </ThemeProvider>
  );
}
