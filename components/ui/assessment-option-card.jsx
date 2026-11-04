import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

// Thẻ chọn nội dung trong tab đánh giá (Figma: Assessment Option, cao 70, icon 24 bên trái).
export function AssessmentOptionCard({ icon, title, description, onPress }) {
  return (
    <Pressable
      className="h-[70px] w-full flex-row items-start rounded-xl border border-border bg-card pl-4 pr-4 pt-4 active:bg-muted"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}>
      <View className="w-10 pt-1">
        <Icon as={icon} size={24} strokeWidth={2} className="text-foreground" />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-sm font-medium text-foreground">{title}</Text>
        <Text className="text-xs leading-[1.4] text-muted-foreground">{description}</Text>
      </View>
    </Pressable>
  );
}
