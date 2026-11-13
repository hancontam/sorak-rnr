import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Một dòng cài đặt dạng ô bo nền muted. `right` thay chevron khi cần Switch/Radio/Badge.
export function SettingsRow({
  icon,
  label,
  value,
  detail,
  onPress,
  right,
  destructive = false,
  disabled = false,
  accessibilityLabel,
}) {
  const content = (
    <>
      {icon ? (
        <Icon
          as={icon}
          size={16}
          className={destructive ? 'text-destructive' : 'text-muted-foreground'}
        />
      ) : null}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className={cn('text-xs font-medium', destructive && 'text-destructive')}>
          {label}
        </Text>
        {detail ? <Text className="text-2xs text-muted-foreground">{detail}</Text> : null}
      </View>
      {value ? <Text className="text-xs text-muted-foreground">{value}</Text> : null}
      {right ??
        (onPress && !destructive ? (
          <Icon as={ChevronRight} size={16} className="text-muted-foreground/70" />
        ) : null)}
    </>
  );
  const className = cn(
    'min-h-11 flex-row items-center gap-3 rounded-lg px-3 py-2.5',
    destructive ? 'bg-destructive/10' : 'bg-muted/70 dark:bg-muted/60',
    disabled && 'opacity-50'
  );

  if (!onPress) return <View className={className}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      className={cn(className, destructive ? 'active:bg-destructive/15' : 'active:bg-muted')}>
      {content}
    </Pressable>
  );
}

// Nhóm có nhãn chữ hoa nhỏ phía trên như mẫu Cài đặt.
export function SettingsSection({ title, children, footer }) {
  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="gap-2">{children}</View>
      {footer ? (
        <Text className="px-1 text-2xs leading-4 text-muted-foreground">{footer}</Text>
      ) : null}
    </View>
  );
}
