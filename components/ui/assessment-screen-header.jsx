import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Header cho các màn stack của tab đánh giá: nút back 32, tiêu đề, dòng phụ tuỳ chọn.
export function AssessmentScreenHeader({ title, subtitle, onBack, action }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center gap-2 px-6">
        <Pressable
          className="size-8 items-center justify-center rounded-md"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại">
          <Icon as={ChevronLeft} size={24} strokeWidth={2} className="text-foreground" />
        </Pressable>
        <Text className={cn('flex-1 text-lg font-semibold text-foreground')} numberOfLines={1}>
          {title}
        </Text>
        {action ?? null}
      </View>
      {subtitle ? (
        <Text className="px-6 pb-2 text-xs text-muted-foreground">{subtitle}</Text>
      ) : null}
      <View className="h-px bg-border" />
    </View>
  );
}
