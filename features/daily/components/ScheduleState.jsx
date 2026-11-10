import { CalendarDays, CircleAlert } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function ScheduleState({ loading, error, title, description, onRetry }) {
  if (loading)
    return (
      <View className="items-center gap-3 py-10">
        <ActivityIndicator />
        <Text className="text-xs text-muted-foreground">Đang tải thời khóa biểu…</Text>
      </View>
    );
  if (error)
    return (
      <View className="gap-3 py-2">
        <Alert variant="destructive" icon={CircleAlert}>
          <AlertTitle className="text-sm">Chưa tải được lịch</AlertTitle>
          <AlertDescription className="text-xs leading-5">{error}</AlertDescription>
        </Alert>
        {onRetry ? (
          <Button variant="outline" size="sm" onPress={onRetry}>
            <Text className="text-xs">Thử lại</Text>
          </Button>
        ) : null}
      </View>
    );
  return (
    <View className="items-center gap-2 rounded-2xl border border-dashed border-border p-5">
      <Icon as={CalendarDays} size={24} className="text-muted-foreground" />
      <Text className="text-center text-sm font-semibold">{title}</Text>
      {description ? (
        <Text className="text-center text-xs leading-5 text-muted-foreground">{description}</Text>
      ) : null}
    </View>
  );
}
