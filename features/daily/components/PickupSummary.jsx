import { ChevronRight, ShieldCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

function Count({ value, label }) {
  return (
    <View className="items-end">
      <Text className="font-mono text-base font-semibold">{value}</Text>
      <Text numberOfLines={1} className="text-2xs text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

// Đầu màn Đón trẻ: một thẻ phẳng với số đã đón trên tổng, thanh tiến trình, số chưa đón / vắng và
// lối vào đơn ủy quyền ở dòng cuối kèm số đơn chờ duyệt (cùng kiểu thẻ "Ngày của bé" bên phụ huynh).
export function PickupSummary({
  total,
  dismissed,
  awaiting,
  absent,
  unrecorded,
  busy,
  pendingCount,
  onOpenRequests,
}) {
  const t = useTranslation();
  const hasPending = Number.isInteger(pendingCount) && pendingCount > 0;
  return (
    <Card className="gap-0 py-0">
      <View className="gap-2.5 px-4 py-3">
        <View className="flex-row items-end gap-4">
          <View className="min-w-0 flex-1">
            <Text className="text-2xs text-muted-foreground">{t('Đã đón')}</Text>
            <Text
              className="font-mono text-2xl font-semibold"
              accessibilityLabel={t('Đã đón {pickedUp}/{total} học sinh', {
                pickedUp: dismissed,
                total,
              })}>
              <Text className="font-mono text-2xl font-semibold text-primary">{dismissed}</Text>
              <Text className="font-mono text-base text-muted-foreground">/{total}</Text>
            </Text>
          </View>
          <Count value={awaiting} label={t('Chưa đón')} />
          <Count
            value={absent + unrecorded}
            label={unrecorded ? t('Vắng / chưa điểm danh') : t('Vắng')}
          />
        </View>
        {total ? (
          <Progress value={Math.round((dismissed / total) * 100)} className="h-1.5 bg-muted" />
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onOpenRequests}
        className="flex-row items-center gap-3 border-t border-border px-4 py-3 active:bg-muted">
        <Icon as={ShieldCheck} size={16} className="text-foreground" />
        <Text className="min-w-0 flex-1 text-sm">{t('Yêu cầu ủy quyền')}</Text>
        {hasPending ? (
          <Badge variant="destructive">
            <Text>{t('{count} chờ duyệt', { count: pendingCount })}</Text>
          </Badge>
        ) : Number.isInteger(pendingCount) ? (
          <Text className="text-xs text-muted-foreground">{t('Không có đơn chờ')}</Text>
        ) : null}
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      </Pressable>
    </Card>
  );
}
