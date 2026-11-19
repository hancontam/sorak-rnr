import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { IllustrationCard } from '@/components/shared/IllustrationCard';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

const PICKUP_ART = require('@/assets/images/illustration-pickup.webp');

function Stat({ value, label, tone }) {
  return (
    <View
      className={cn(
        'min-w-0 flex-1 gap-0.5 border px-3 py-2',
        tone === 'done'
          ? 'border-primary/30 bg-secondary'
          : tone === 'wait'
            ? 'border-warning/40 bg-warning/10'
            : 'border-border bg-muted/40'
      )}>
      <Text
        className={cn(
          'font-mono text-xl font-bold',
          tone === 'done'
            ? 'text-primary'
            : tone === 'wait'
              ? 'text-warning'
              : 'text-muted-foreground'
        )}>
        {value}
      </Text>
      <Text numberOfLines={1} className="text-2xs text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

// Đầu màn Đón trẻ: minh họa, ba ô số (đã đón / chưa đón / vắng, chưa điểm danh), thanh tiến trình
// và lối vào đơn ủy quyền. Số liệu tính từ danh sách đón trẻ của ngày đang xem.
export function PickupSummary({
  total,
  dismissed,
  awaiting,
  absent,
  unrecorded,
  busy,
  onOpenRequests,
}) {
  const t = useTranslation();
  return (
    <View className="gap-3">
      <IllustrationCard
        source={PICKUP_ART}
        eyebrow={t('Đón trẻ')}
        title={t('Đã đón {pickedUp}/{total} bé', { pickedUp: dismissed, total })}
      />
      {total ? (
        <Progress
          value={Math.round((dismissed / total) * 100)}
          className="h-1.5 bg-muted"
          accessibilityLabel={t('Đã đón {pickedUp}/{total} học sinh', {
            pickedUp: dismissed,
            total,
          })}
        />
      ) : null}
      <View className="flex-row gap-2">
        <Stat value={dismissed} label={t('Đã đón')} tone="done" />
        <Stat value={awaiting} label={t('Chưa đón')} tone="wait" />
        <Stat
          value={absent + unrecorded}
          label={unrecorded ? t('Vắng / chưa điểm danh') : t('Vắng')}
          tone="off"
        />
      </View>
      <Button size="sm" variant="outline" disabled={busy} onPress={onOpenRequests}>
        <Icon as={ShieldCheck} size={14} />
        <Text>{t('Yêu cầu ủy quyền')}</Text>
      </Button>
    </View>
  );
}
