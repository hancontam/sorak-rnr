import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { View } from 'react-native';

export function AuthScreenHeader({ title, onBack }) {
  return (
    <>
      <View className="h-[52px] flex-row items-center gap-2 px-6">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onPress={onBack}
          accessibilityLabel="Quay lại">
          <Icon as={ChevronLeft} size={32} strokeWidth={2} className="text-muted-foreground" />
        </Button>
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
      </View>
      <View className="h-px bg-border" />
    </>
  );
}
