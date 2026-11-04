import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { AlertCircle, Inbox } from 'lucide-react-native';
import { View } from 'react-native';

export function AssessmentLoading({ label = 'Đang tải dữ liệu…' }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16">
      <ThemedSpinner />
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </View>
  );
}

export function AssessmentEmpty({ title, description, icon = Inbox }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 px-6 py-16">
      <Icon as={icon} size={28} strokeWidth={2} className="text-muted-foreground" />
      <Text className="text-center text-sm font-medium text-foreground">{title}</Text>
      {description ? (
        <Text className="text-center text-xs text-muted-foreground">{description}</Text>
      ) : null}
    </View>
  );
}

export function AssessmentError({ message, onRetry, isRetrying }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6 py-16">
      <Icon as={AlertCircle} size={28} strokeWidth={2} className="text-destructive" />
      <Text className="text-center text-sm font-medium text-foreground">
        Không tải được dữ liệu
      </Text>
      <Text className="text-center text-xs text-muted-foreground">{message}</Text>
      {onRetry ? (
        <Button variant="outline" size="sm" onPress={onRetry} disabled={isRetrying}>
          <Text>Thử lại</Text>
        </Button>
      ) : null}
    </View>
  );
}
