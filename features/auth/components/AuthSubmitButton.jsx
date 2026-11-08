import { useColorScheme } from 'nativewind';
import { ActivityIndicator } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

export function AuthSubmitButton({ label, icon, labelStyle, pending, disabled, onPress }) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const unavailable = disabled && !pending;
  const labelColor = unavailable ? 'text-muted-foreground' : 'text-primary-foreground';

  return (
    <Button
      size="sm"
      variant={unavailable ? 'secondary' : 'default'}
      className="h-auto min-h-9 rounded-lg py-2 opacity-100"
      disabled={pending || disabled}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ busy: pending, disabled: pending || disabled }}>
      {pending ? (
        <ActivityIndicator size="small" color={theme.primaryForeground} />
      ) : (
        <>
          <Text className={`text-xs font-semibold ${labelColor}`} style={labelStyle}>
            {label}
          </Text>
          {icon ? <Icon as={icon} size={14} className={labelColor} /> : null}
        </>
      )}
    </Button>
  );
}
