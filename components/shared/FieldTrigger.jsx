import { ChevronDown } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Ô chọn trông như Input nhưng mở sheet thay vì bàn phím (ngày, giờ, danh sách).
export function FieldTrigger({
  label,
  icon,
  leading,
  value,
  placeholder,
  mono = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}) {
  return (
    <View className="gap-1.5">
      {label ? <Text className="text-xs font-medium">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || [label, value || placeholder].filter(Boolean).join(', ')
        }
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        className={cn(
          'h-10 flex-row items-center gap-2 rounded-lg border border-input bg-background px-3 active:bg-accent dark:bg-input/30',
          disabled && 'opacity-50'
        )}>
        {leading ?? (icon ? <Icon as={icon} size={16} className="text-muted-foreground" /> : null)}
        <Text
          numberOfLines={1}
          className={cn(
            'min-w-0 flex-1 text-xs',
            value ? (mono ? 'font-mono' : '') : 'text-muted-foreground'
          )}>
          {value || placeholder}
        </Text>
        <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
      </Pressable>
    </View>
  );
}
