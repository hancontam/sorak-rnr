import { ChevronRight, HeartPulse, House, School, ShieldCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

function Row({ icon, label, value, muted, first }) {
  return (
    <View
      className={cn('flex-row items-center gap-3 px-4 py-2.5', !first && 'border-t border-border')}>
      <View className="size-8 items-center justify-center bg-secondary">
        <Icon as={icon} size={16} className="text-primary" />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-2xs text-muted-foreground">{label}</Text>
        <Text
          numberOfLines={2}
          className={cn('text-sm', muted ? 'text-muted-foreground' : 'font-medium')}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// Ngày của bé cho phụ huynh: đến lớp, sức khỏe, về nhà kể như câu ngắn theo thứ tự trong ngày,
// khác thanh số liệu cả lớp của giáo viên. Đơn ủy quyền là lối vào riêng ở cuối thẻ.
export function ChildDaySummary({ overview, pendingCount, onOpenPickupRequests }) {
  const t = useTranslation();
  const { attendance, health, pickup } = overview;
  const arrived = attendance.state === 'done';
  const hasPending = Number.isInteger(pendingCount) && pendingCount > 0;
  const measures = [health.height && `${health.height} cm`, health.weight && `${health.weight} kg`]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card className="gap-0 py-0">
      <Row
        first
        icon={School}
        label={t('Đến lớp')}
        value={
          !arrived
            ? t('Chưa điểm danh')
            : attendance.present && attendance.checkIn
              ? t('Có mặt lúc {time}', { time: attendance.checkIn })
              : t(attendance.label) || attendance.rawLabel || t('Đã điểm danh')
        }
        muted={!arrived}
      />
      <Row
        icon={HeartPulse}
        label={t('Sức khỏe')}
        value={health.state === 'done' ? measures || t('Đã đo') : t('Chưa đo')}
        muted={health.state !== 'done'}
      />
      <Row
        icon={House}
        label={t('Về nhà')}
        value={
          pickup.state === 'done'
            ? [t('Đã đón lúc {time}', { time: pickup.time }), pickup.person]
                .filter(Boolean)
                .join(' · ')
            : t('Chưa đón')
        }
        muted={pickup.state !== 'done'}
      />
      {onOpenPickupRequests ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenPickupRequests}
          className="flex-row items-center gap-3 border-t border-border px-4 py-3 active:bg-muted">
          <Icon as={ShieldCheck} size={16} className="text-foreground" />
          <Text className="min-w-0 flex-1 text-sm">{t('Đơn ủy quyền đón trẻ')}</Text>
          {hasPending ? (
            <Badge variant="destructive">
              <Text>{t('{count} chờ duyệt', { count: pendingCount })}</Text>
            </Badge>
          ) : null}
          <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
        </Pressable>
      ) : null}
    </Card>
  );
}
