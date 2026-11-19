import { ClipboardCheck, HeartPulse, ShieldCheck, UserCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

function Tile({ icon, label, value, done, alert, onPress, accessibilityLabel }) {
  const content = (
    <>
      <View className="flex-row items-center gap-1">
        <Icon
          as={icon}
          size={14}
          className={done ? 'text-primary' : alert ? 'text-destructive' : 'text-muted-foreground'}
        />
        <Text
          numberOfLines={1}
          className={cn(
            'font-mono text-xs font-semibold',
            done ? 'text-primary' : alert ? 'text-destructive' : 'text-foreground'
          )}>
          {value}
        </Text>
      </View>
      <Text numberOfLines={1} className="text-2xs text-muted-foreground">
        {label}
      </Text>
    </>
  );
  const className = 'min-w-0 flex-1 items-center justify-center gap-0.5 px-1 py-2';
  if (!onPress)
    return (
      <View accessible accessibilityLabel={accessibilityLabel} className={className}>
        {content}
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(className, 'active:bg-muted')}>
      {content}
    </Pressable>
  );
}

// Tình hình trong ngày dạng thanh 4 ô gọn ở đáy màn Thời khóa biểu (GV: cả lớp, PH: của bé),
// để dải ngày đi thẳng tới lịch. Bấm ô để mở ghi nhận hoặc đơn ủy quyền của ngày đang chọn.
export function DayStatusBar({
  overview,
  isParent,
  pendingCount,
  onOpenRecords,
  onOpenPickupRequests,
}) {
  const t = useTranslation();
  const { attendance, health, pickup } = overview;
  const total = overview.total ?? null;
  const present = attendance.present ?? null;
  const notYet = t('Chưa ghi');
  const ratio = (value, of) =>
    value !== null && value !== undefined && of !== null ? `${value}/${of}` : '—';
  const open = (kind) => (onOpenRecords ? () => onOpenRecords(kind) : undefined);
  const hasPending = Number.isInteger(pendingCount) && pendingCount > 0;

  const tiles = isParent
    ? [
        {
          key: 'attendance',
          icon: ClipboardCheck,
          label: t('Điểm danh'),
          value:
            attendance.state === 'done'
              ? t(attendance.label) || attendance.rawLabel || t('Đã ghi')
              : notYet,
          done: attendance.state === 'done',
        },
        {
          key: 'health',
          icon: HeartPulse,
          label: t('Sức khỏe'),
          value: health.state === 'done' ? t('Đã đo') : notYet,
          done: health.state === 'done',
        },
        {
          key: 'pickup',
          icon: UserCheck,
          label: t('Đón trẻ'),
          value: pickup.state === 'done' ? pickup.time : notYet,
          done: pickup.state === 'done',
        },
      ]
    : [
        {
          key: 'attendance',
          icon: ClipboardCheck,
          label: t('Điểm danh'),
          value: attendance.state === 'todo' ? notYet : ratio(present, total),
          done: attendance.state === 'done',
          onPress: open('attendance'),
        },
        {
          key: 'health',
          icon: HeartPulse,
          label: t('Sức khỏe'),
          value: health.state === 'todo' ? notYet : ratio(health.count, present),
          done: health.state === 'done',
          onPress: open('health'),
        },
        {
          key: 'pickup',
          icon: UserCheck,
          label: t('Đón trẻ'),
          value: ratio(pickup.count, present),
          done: pickup.count !== null && present !== null && pickup.count >= present && present > 0,
          onPress: open('pickup'),
        },
      ];
  if (onOpenPickupRequests)
    tiles.push({
      key: 'requests',
      icon: ShieldCheck,
      label: t('Ủy quyền'),
      value: hasPending ? t('{count} chờ', { count: pendingCount }) : t('Xem đơn'),
      alert: hasPending,
      onPress: onOpenPickupRequests,
    });

  return (
    <View className="flex-row border-t border-border bg-background">
      {tiles.map(({ key, ...tile }, index) => (
        <View key={key} className={cn('flex-1 flex-row', index > 0 && 'border-l border-border')}>
          <Tile {...tile} accessibilityLabel={`${tile.label}. ${tile.value}`} />
        </View>
      ))}
    </View>
  );
}
