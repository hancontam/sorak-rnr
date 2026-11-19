import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { calendarDate, dayTitle, WEEKDAY_LABELS } from '../utils/schedule-date';

const englishWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const englishMonth = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

// Khối ngày ở đầu các màn mở từ một ngày (ghi nhận, đánh giá, chi tiết hoạt động): ô ngày nền xanh
// với thứ, số ngày lớn, tháng; bên cạnh là ngày đầy đủ, nhãn trạng thái và dòng phụ (tên hoạt động).
// tone: 'today' | 'locked' | 'future' | 'past' quyết định nhãn và màu ô ngày.
export function DateHeader({ date, tone = 'past', badges = [], subtitle, children }) {
  const t = useTranslation();
  const locale = useLocale();
  const english = locale === 'en-US';
  const value = calendarDate(date);
  if (!value) return null;
  const weekday = english
    ? englishWeekday.format(value)
    : WEEKDAY_LABELS[(value.getUTCDay() + 6) % 7];
  const month = english
    ? englishMonth.format(value)
    : t('Th{month}', { month: value.getUTCMonth() + 1 });
  const muted = tone === 'locked';

  return (
    <View className="flex-row items-stretch gap-3">
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className={cn(
          'w-16 items-center justify-center py-2',
          muted ? 'bg-muted' : tone === 'today' ? 'bg-primary' : 'bg-secondary'
        )}>
        <Text
          className={cn(
            'text-2xs font-semibold uppercase',
            muted
              ? 'text-muted-foreground'
              : tone === 'today'
                ? 'text-primary-foreground'
                : 'text-secondary-foreground'
          )}>
          {weekday}
        </Text>
        <Text
          className={cn(
            'font-mono text-2xl font-bold leading-8',
            muted
              ? 'text-muted-foreground'
              : tone === 'today'
                ? 'text-primary-foreground'
                : 'text-secondary-foreground'
          )}>
          {value.getUTCDate()}
        </Text>
        <Text
          className={cn(
            'text-2xs',
            muted
              ? 'text-muted-foreground'
              : tone === 'today'
                ? 'text-primary-foreground'
                : 'text-secondary-foreground'
          )}>
          {month}
        </Text>
      </View>
      <View className="min-w-0 flex-1 justify-center gap-1">
        <Text className="text-sm font-semibold">{dayTitle(date, locale)}</Text>
        {badges.length ? (
          <View className="flex-row flex-wrap gap-1.5">
            {badges.map(([label, variant]) => (
              <Badge key={label} variant={variant}>
                <Text>{label}</Text>
              </Badge>
            ))}
          </View>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={2} className="text-xs text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}
