import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { MonthCalendar, monthIdOf } from '@/components/shared/MonthCalendar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import {
  calendarDate,
  dayTitle,
  shiftDays,
  WEEKDAY_LABELS,
  weekDates,
} from '../utils/schedule-date';

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });

// Tiêu đề tháng mở lịch tháng (sheet), hai nút chuyển tuần, nút Hôm nay và dải tuần dạng segmented.
export function ScheduleCalendar({ date, today, onChange }) {
  const t = useTranslation();
  const locale = useLocale();
  const english = locale === 'en-US';
  const [open, setOpen] = useState(false);
  const [monthId, setMonthId] = useState(monthIdOf(date));
  const days = weekDates(date);
  const monthTitle = english
    ? monthYearFormatter.format(calendarDate(date))
    : t('Tháng {month}/{year}', { month: Number(date.slice(5, 7)), year: date.slice(0, 4) });

  function showMonth() {
    setMonthId(monthIdOf(date));
    setOpen(true);
  }

  function pick(id) {
    setOpen(false);
    onChange(id);
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Chọn ngày trên lịch tháng, đang xem {date}', {
            date: dayTitle(date, locale),
          })}
          hitSlop={6}
          onPress={showMonth}
          className="min-w-0 flex-1 flex-row items-center gap-1 rounded-lg py-1 active:opacity-70">
          <Text numberOfLines={1} className="shrink text-lg font-semibold tracking-tight">
            {monthTitle}
          </Text>
          <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
        </Pressable>
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={t('Tuần trước')}
          onPress={() => onChange(shiftDays(date, -7))}>
          <Icon as={ChevronLeft} size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-3"
          disabled={date === today}
          accessibilityLabel={t('Về hôm nay, {date}', { date: dayTitle(today, locale) })}
          onPress={() => onChange(today)}>
          <Text>{t('Hôm nay')}</Text>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={t('Tuần sau')}
          onPress={() => onChange(shiftDays(date, 7))}>
          <Icon as={ChevronRight} size={16} />
        </Button>
      </View>
      <View
        accessibilityRole="radiogroup"
        className="flex-row rounded-2xl border border-border/60 bg-muted p-1 dark:bg-card">
        {days.map((day, index) => {
          const selected = day === date;
          return (
            <Pressable
              key={day}
              accessibilityRole="radio"
              accessibilityLabel={dayTitle(day, locale)}
              accessibilityState={{ selected }}
              onPress={() => onChange(day)}
              className={cn(
                'min-w-0 flex-1 items-center gap-0.5 rounded-xl py-2 shadow-none shadow-black/5 active:opacity-70',
                selected && 'bg-background shadow-sm dark:bg-muted'
              )}>
              <Text
                className={cn(
                  'text-2xs text-muted-foreground',
                  selected && 'font-semibold text-foreground'
                )}>
                {english ? weekdayFormatter.format(calendarDate(day)) : WEEKDAY_LABELS[index]}
              </Text>
              <Text className={cn('font-mono text-sm', selected && 'font-semibold')}>
                {Number(day.slice(8))}
              </Text>
              <View
                className={cn(
                  'size-1 rounded-full',
                  day === today ? 'bg-foreground' : 'bg-transparent'
                )}
              />
            </Pressable>
          );
        })}
      </View>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={t('Chọn ngày')}
        description={dayTitle(date, locale)}
        closeLabel={t('Đóng')}
        enableContentPanningGesture={false}>
        <MonthCalendar
          monthId={monthId}
          onMonthChange={setMonthId}
          ranges={[{ startId: date, endId: date }]}
          onDayPress={pick}
        />
        <Button variant="outline" disabled={date === today} onPress={() => pick(today)}>
          <Text>{t('Về hôm nay')}</Text>
        </Button>
      </BottomSheet>
    </View>
  );
}
