import { CircleAlert, FileSearch } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function ReportState({ loading, error, title = 'Chưa có dữ liệu', description, onRetry }) {
  if (loading)
    return (
      <View className="items-center gap-3 py-12">
        <ActivityIndicator />
        <Text className="text-xs text-muted-foreground">Đang tải dữ liệu…</Text>
      </View>
    );
  if (error)
    return (
      <View className="gap-3">
        <Alert icon={CircleAlert} variant="destructive">
          <AlertTitle className="text-sm">Chưa tải được báo cáo</AlertTitle>
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
    <View className="items-center gap-2 rounded-2xl border border-dashed border-border p-6">
      <Icon as={FileSearch} size={24} className="text-muted-foreground" />
      <Text className="text-center text-sm font-semibold">{title}</Text>
      {description ? (
        <Text className="text-center text-xs leading-5 text-muted-foreground">{description}</Text>
      ) : null}
    </View>
  );
}
