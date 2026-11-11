import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function SettingsRow({ icon, label, detail, onPress, destructive = false }) {
  const content = (
    <>
      <Icon
        as={icon}
        size={16}
        className={destructive ? 'text-destructive' : 'text-muted-foreground'}
      />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text
          className={
            destructive ? 'text-xs font-semibold text-destructive' : 'text-xs font-semibold'
          }>
          {label}
        </Text>
        {detail ? (
          <Text className="text-[11px] leading-4 text-muted-foreground">{detail}</Text>
        ) : null}
      </View>
      {onPress && !destructive ? (
        <Icon as={ChevronRight} size={14} className="text-muted-foreground" />
      ) : null}
    </>
  );

  if (!onPress)
    return <View className="min-h-11 flex-row items-center gap-3 px-3 py-2">{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-3 rounded-lg px-3 py-2 active:bg-muted">
      {content}
    </Pressable>
  );
}
