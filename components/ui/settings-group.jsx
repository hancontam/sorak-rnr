import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function SettingsGroup({ title, children }) {
  return (
    <View className="gap-2 border-t border-border pt-3">
      <Text className="text-xs font-semibold text-muted-foreground">{title}</Text>
      {children}
    </View>
  );
}
