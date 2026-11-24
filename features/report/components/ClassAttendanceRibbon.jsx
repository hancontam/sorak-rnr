import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Bốn số chuyên cần của lớp lấy từ máy chủ; thiếu trường nào thì hiện "—", không tự tính lại.
export function attendanceMetrics(stats, t) {
  const whole = (value) => (Number.isInteger(value) && value >= 0 ? value : null);
  const rate = typeof stats?.presentRate === 'number' ? `${stats.presentRate}%` : '—';
  const present = whole(stats?.presentCount);
  const slots = whole(stats?.totalRecordedSlots);
  return [
    { key: 'rate', label: t('Đi học đủ buổi'), value: rate },
    {
      key: 'present',
      label: t('Có mặt'),
      value: present === null ? '—' : String(present),
      total: slots === null ? '' : `/${slots}`,
    },
    { key: 'excused', label: t('Nghỉ phép'), value: String(whole(stats?.excusedCount) ?? '—') },
    {
      key: 'unexcused',
      label: t('Không phép'),
      value: String(whole(stats?.unexcusedCount) ?? '—'),
    },
  ];
}

// Dải thống kê chuyên cần lớp ở Tổng quan lớp, bấm để mở màn chi tiết như "Xem chi tiết" của web.
export function ClassAttendanceRibbon({ periodLabel, stats, loading, error, onPress }) {
  const t = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Xem chi tiết chuyên cần lớp')}
      onPress={onPress}
      className="gap-2.5 border border-border bg-card px-4 py-3 active:bg-muted/60">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-semibold">{t('Chuyên cần lớp')}</Text>
        <Text className="min-w-0 flex-1 text-2xs text-muted-foreground">{periodLabel}</Text>
        <Text className="text-2xs font-medium text-primary">{t('Xem chi tiết')}</Text>
        <Icon as={ChevronRight} size={14} className="text-primary" />
      </View>
      {loading ? (
        <Skeleton className="h-9 w-full" />
      ) : error ? (
        <Text className="text-xs text-destructive">{t(error)}</Text>
      ) : (
        <View className="flex-row">
          {attendanceMetrics(stats, t).map((metric, index) => (
            <View
              key={metric.key}
              className={
                index > 0 ? 'min-w-0 flex-1 border-l border-border pl-2.5' : 'min-w-0 flex-1'
              }>
              <Text numberOfLines={1} className="text-2xs text-muted-foreground">
                {metric.label}
              </Text>
              <Text numberOfLines={1} className="font-mono text-sm font-semibold">
                {metric.value}
                {metric.total ? (
                  <Text className="font-mono text-2xs font-normal text-muted-foreground">
                    {metric.total}
                  </Text>
                ) : null}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
