import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

export function SettingsOptionRow({
  label,
  description,
  selected = false,
  onPress,
  disabled = false,
}) {
  return (
    <Pressable
      className="min-h-[50px] flex-row items-center justify-between border-b border-border py-2"
      onPress={onPress}
      disabled={!onPress || disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !onPress || disabled }}>
      <View className="flex-1 pr-4">
        <Text className={`text-sm ${selected ? 'text-brand-link' : 'text-foreground'}`}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      <View
        className={`size-4 items-center justify-center rounded-full border ${selected ? 'border-brand-link' : 'border-border'}`}>
        {selected ? <View className="size-2 rounded-full bg-brand-link" /> : null}
      </View>
    </Pressable>
  );
}
