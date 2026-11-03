import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function SettingsOptionRow({ label, description, selected = false }) {
  return (
    <View className="min-h-[50px] flex-row items-center justify-between border-b border-border py-2">
      <View className="flex-1 pr-4">
        <Text className={`text-sm ${selected ? 'text-[#5faaf9]' : 'text-foreground'}`}>
          {label}
        </Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      <View
        className={`size-4 items-center justify-center rounded-full border ${selected ? 'border-[#5faaf9]' : 'border-border'}`}>
        {selected ? <View className="size-2 rounded-full bg-[#5faaf9]" /> : null}
      </View>
    </View>
  );
}
