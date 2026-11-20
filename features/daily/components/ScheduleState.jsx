import { CalendarDays, CircleAlert } from 'lucide-react-native';
import { View } from 'react-native';

import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function ScheduleState({
  loading,
  error,
  title,
  description,
  onRetry,
  loadingLabel,
  skeleton = 'list',
}) {
  const t = useTranslation();
  if (loading)
    return (
      <LoadingSkeleton variant={skeleton} label={loadingLabel || t('Đang tải thời khóa biểu…')} />
    );
  if (error)
    return (
      <View className="gap-3">
        <Alert variant="destructive" icon={CircleAlert}>
          <AlertTitle>{t('Chưa tải được dữ liệu')}</AlertTitle>
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
        {onRetry ? (
          <Button variant="outline" size="sm" onPress={onRetry}>
            <Text>{t('Thử lại')}</Text>
          </Button>
        ) : null}
      </View>
    );
  return (
    <View className="items-center gap-2 rounded-2xl border border-dashed border-border px-5 py-8">
      <View className="mb-1 size-10 items-center justify-center rounded-xl bg-muted">
        <Icon as={CalendarDays} size={20} className="text-muted-foreground" />
      </View>
      <Text className="text-center text-sm font-semibold">{t(title)}</Text>
      {description ? (
        <Text className="text-center text-xs leading-5 text-muted-foreground">
          {t(description)}
        </Text>
      ) : null}
    </View>
  );
}
