import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function SettingsMenuRow({ label, icon, onPress, destructive = false, showChevron = true }) {
  return (
    <Pressable
      className={`h-10 flex-row items-center gap-3 rounded-md px-4 ${destructive ? 'bg-red-50 dark:bg-red-950/30' : 'bg-secondary'}`}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}>
      {icon ? (
        <Icon
          as={icon}
          size={16}
          strokeWidth={1}
          className={destructive ? 'text-red-500 dark:text-red-400' : 'text-foreground'}
        />
      ) : null}
      <Text
        className={`flex-1 text-sm font-medium ${destructive ? 'text-red-500 dark:text-red-400' : 'text-foreground'}`}>
        {label}
      </Text>
      {showChevron && onPress ? (
        <Icon as={ChevronRight} size={14} strokeWidth={1} />
      ) : (
        <View className="w-3.5" />
      )}
    </Pressable>
  );
}
