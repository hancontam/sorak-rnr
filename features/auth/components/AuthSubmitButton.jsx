import { useColorScheme } from 'nativewind';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

// Nút gửi của các form đăng nhập: cao 40 như Button chuẩn, chỉ có chữ (không icon), hiện vòng chờ
// khi đang gửi.
export function AuthSubmitButton({ label, pending, disabled, onPress }) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <Button
      disabled={pending || disabled}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ busy: pending, disabled: pending || disabled }}>
      {pending ? (
        <ActivityIndicator size="small" color={theme.primaryForeground} />
      ) : (
        <Text>{label}</Text>
      )}
    </Button>
  );
}
