import { ClipboardCheck, HeartPulse, UserCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

function Tile({ icon, label, value, done, onPress, accessibilityLabel }) {
  // Chủ thể là thao tác: icon + tên ở trên, trạng thái (tỉ lệ / Chưa ghi) nhỏ hơn ở dưới.
  const content = (
    <>
      <View className="flex-row items-center gap-1">
        {/* Icon cùng màu tên thao tác; chỉ dòng trạng thái bên dưới mang màu. */}
        <Icon as={icon} size={14} className="text-foreground" />
        <Text numberOfLines={1} className="text-xs font-medium">
          {label}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        className={cn(
          'font-mono text-2xs',
          done ? 'font-semibold text-primary' : 'text-muted-foreground'
        )}>
        {value}
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

// Tình hình cả lớp trong ngày dạng thanh 3 ô gọn ở đáy màn Thời khóa biểu (chỉ giáo viên): điểm
// danh, sức khỏe, đón trẻ. Đơn ủy quyền nằm trong màn Đón trẻ.
export function DayStatusBar({ overview, onOpenRecords }) {
  const t = useTranslation();
  const { attendance, health, pickup } = overview;
  const total = overview.total ?? null;
  const present = attendance.present ?? null;
  const notYet = t('Chưa ghi');
  const ratio = (value, of) =>
    value !== null && value !== undefined && of !== null ? `${value}/${of}` : '—';
  const open = (kind) => (onOpenRecords ? () => onOpenRecords(kind) : undefined);

  const tiles = [
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
