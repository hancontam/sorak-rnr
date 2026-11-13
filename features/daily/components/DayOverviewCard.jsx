import {
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  UserCheck,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

function Row({ icon, title, meta, right, onPress, label, first }) {
  const content = (
    <View
      className={cn(
        'min-h-14 flex-row items-center gap-3 px-4 py-2.5',
        !first && 'border-t border-border'
      )}>
      <View className="size-8 items-center justify-center rounded-lg bg-muted">
        <Icon as={icon} size={16} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-xs font-semibold">{title}</Text>
        {meta ? (
          <Text numberOfLines={2} className="text-2xs text-muted-foreground">
            {meta}
          </Text>
        ) : null}
      </View>
      {right}
      {onPress ? <Icon as={ChevronRight} size={16} className="text-muted-foreground" /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="active:bg-muted/60">
      {content}
    </Pressable>
  );
}

const Mono = ({ children }) => (
  <Text className="font-mono text-xs font-medium text-muted-foreground">{children}</Text>
);

const Pending = ({ label }) => (
  <Badge variant="outline">
    <Text>{label}</Text>
  </Badge>
);

// Tình hình trong ngày (GV: cả lớp, PH: của bé) và lối vào ủy quyền đón trẻ trong một Card.
export function DayOverviewCard({
  overview,
  isParent,
  isToday,
  pendingCount,
  onOpenRecords,
  onOpenPickupRequests,
}) {
  const t = useTranslation();
  const { attendance, health, pickup } = overview;
  const total = overview.total ?? null;
  const present = attendance.present ?? null;
  const noInfo = t('Chưa có thông tin');
  const ratio = (value, of) => (value !== null && of !== null ? `${value}/${of}` : null);
  const open = (kind) => (onOpenRecords ? () => onOpenRecords(kind) : undefined);

  const title = isToday
    ? t(isParent ? 'Hôm nay của bé' : 'Hôm nay ở lớp')
    : t(isParent ? 'Tình hình của con trong ngày' : 'Trạng thái lớp trong ngày');

  let attendanceMeta;
  let attendanceRight = null;
  let healthMeta;
  let healthRight = null;
  let pickupMeta;
  let pickupRight = null;
  if (isParent) {
    attendanceMeta =
      attendance.state === 'done'
        ? t(attendance.label) || attendance.rawLabel || t('Đã ghi nhận')
        : t('Chưa ghi nhận');
    // Dòng phụ đã nêu trạng thái; bên phải chỉ nhắc khi chưa ghi để tránh lặp chữ.
    attendanceRight = attendance.state === 'done' ? null : <Pending label={t('Chưa ghi')} />;
    healthMeta = t(health.state === 'done' ? 'Đã có số đo' : 'Chưa ghi nhận');
    healthRight = health.state === 'done' ? null : <Pending label={t('Chưa ghi')} />;
    pickupMeta =
      pickup.state === 'done' ? t('Đã đón {time}', { time: pickup.time }) : t('Chưa ghi nhận');
  } else {
    attendanceMeta =
      attendance.state === 'done'
        ? present !== null && attendance.absent !== null
          ? t('{present} có mặt · {absent} vắng', { present, absent: attendance.absent })
          : noInfo
        : attendance.state === 'todo'
          ? t('Chưa ghi nhận')
          : noInfo;
    attendanceRight =
      attendance.state === 'todo' ? (
        <Pending label={t('Chưa ghi')} />
      ) : (
        ratio(present, total) && <Mono>{ratio(present, total)}</Mono>
      );
    healthMeta =
      health.state === 'done'
        ? health.count !== null
          ? t('{count} đã đo', { count: health.count })
          : noInfo
        : health.state === 'todo'
          ? t('Chưa ghi nhận')
          : noInfo;
    healthRight =
      health.state === 'todo' ? (
        <Pending label={t('Chưa ghi')} />
      ) : (
        ratio(health.count, present) && <Mono>{ratio(health.count, present)}</Mono>
      );
    pickupMeta = pickup.count !== null ? t('{count} đã đón', { count: pickup.count }) : noInfo;
    pickupRight = ratio(pickup.count, present) && <Mono>{ratio(pickup.count, present)}</Mono>;
  }

  const showProgress = !isParent && attendance.state === 'done' && present !== null && total;
  const hasPending = Number.isInteger(pendingCount) && pendingCount > 0;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <View className="gap-2.5 px-4 pb-3 pt-4">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-semibold">{title}</Text>
          {!isParent && total !== null ? (
            <Text className="font-mono text-2xs text-muted-foreground">
              {t('{count} trẻ', { count: total })}
            </Text>
          ) : null}
        </View>
        {showProgress ? (
          <View className="gap-1.5">
            <Progress
              value={Math.round((present / total) * 100)}
              className="h-1.5 bg-muted"
              accessibilityLabel={t('{present} có mặt · {absent} vắng', {
                present,
                absent: attendance.absent ?? 0,
              })}
            />
          </View>
        ) : null}
      </View>
      <Row
        first
        icon={ClipboardCheck}
        title={t('Điểm danh')}
        meta={attendanceMeta}
        right={attendanceRight}
        onPress={open('attendance')}
        label={`${t('Điểm danh')}. ${attendanceMeta}`}
      />
      <Row
        icon={HeartPulse}
        title={t('Sức khỏe')}
        meta={healthMeta}
        right={healthRight}
        onPress={open('health')}
        label={`${t('Sức khỏe')}. ${healthMeta}`}
      />
      <Row
        icon={UserCheck}
        title={t('Đón trẻ')}
        meta={pickupMeta}
        right={pickupRight}
        onPress={open('pickup')}
        label={`${t('Đón trẻ')}. ${pickupMeta}`}
      />
      {onOpenPickupRequests ? (
        <Row
          icon={ShieldCheck}
          title={t('Ủy quyền đón trẻ')}
          meta={t(isParent ? 'Gửi và theo dõi đơn ủy quyền' : 'Duyệt và tạo đơn ủy quyền')}
          right={
            hasPending ? (
              <Badge variant="destructive">
                <Text>{t('{count} chờ duyệt', { count: pendingCount })}</Text>
              </Badge>
            ) : null
          }
          onPress={onOpenPickupRequests}
          label={
            hasPending
              ? `${t('Ủy quyền đón trẻ')}. ${t('{count} chờ duyệt', { count: pendingCount })}`
              : t('Ủy quyền đón trẻ')
          }
        />
      ) : null}
    </Card>
  );
}
