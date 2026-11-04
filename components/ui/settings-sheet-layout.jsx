import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SettingsSheetLayout({ title, onBack, children }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-transparent">
      <Pressable
        style={{ height: insets.top + 24 }}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Đóng cài đặt"
      />
      <View className="flex-1 rounded-t-[36px] bg-card px-6 pt-6">
        {title ? (
          <View className="mb-4 h-10 flex-row items-center">
            <Pressable
              className="size-8 items-center justify-center"
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Quay lại">
              <Icon as={ChevronLeft} size={24} strokeWidth={2} />
            </Pressable>
            <Text className="flex-1 text-center text-lg font-semibold">{title}</Text>
            <View className="size-8" />
          </View>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
