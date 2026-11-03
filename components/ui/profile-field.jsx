import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function ProfileField({ label, value }) {
  return (
    <View className="gap-2">
      <Text className="text-xs font-medium">{label}</Text>
      <Input value={value || ''} editable={false} accessibilityLabel={label} />
    </View>
  );
}
