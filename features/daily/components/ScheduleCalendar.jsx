import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';

import { MonthCalendar, monthIdOf } from '@/components/shared/MonthCalendar';
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

// Tiêu đề tháng mở/thu lịch tháng ngay dưới (không dùng sheet), hai nút chuyển tuần, nút Hôm nay và
// dải tuần dạng segmented; vuốt ngang dải tuần để sang tuần trước/sau.
// dayLocks: { 'YYYY-MM-DD': 'holiday' | 'weekend' | 'makeup' } của tuần đang xem; ngày nghỉ có băng
// đỏ "Nghỉ", Thứ Bảy dạy bù có băng xanh "Học bù" ở đáy ô; ngày nghỉ và cuối tuần không lịch số xám.
export function ScheduleCalendar({ date, today, onChange, dayLocks = {} }) {
  const t = useTranslation();
  const locale = useLocale();
  const english = locale === 'en-US';
  const [open, setOpen] = useState(false);
  const [monthId, setMonthId] = useState(monthIdOf(date));
  const direction = useRef(0);
  const days = weekDates(date);
  const monthTitle = english
    ? monthYearFormatter.format(calendarDate(date))
    : t('Tháng {month}/{year}', { month: Number(date.slice(5, 7)), year: date.slice(0, 4) });

  function toggleMonth() {
    if (!open) setMonthId(monthIdOf(date));
    setOpen(!open);
  }

  function pick(id) {
    direction.current = id > date ? 1 : id < date ? -1 : 0;
    setOpen(false);
    onChange(id);
  }

  function shiftWeek(step) {
    direction.current = step;
    onChange(shiftDays(date, step * 7));
  }

  // Chỉ nhận vuốt ngang rõ ràng; vuốt dọc vẫn cuộn danh sách.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd((event) => {
      if (Math.abs(event.translationX) < 48) return;
      shiftWeek(event.translationX < 0 ? 1 : -1);
    });
  const entering =
    direction.current > 0
      ? SlideInRight.duration(180)
      : direction.current < 0
        ? SlideInLeft.duration(180)
        : FadeIn.duration(120);

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={t('Chọn ngày trên lịch tháng, đang xem {date}', {
            date: dayTitle(date, locale),
          })}
          hitSlop={6}
          onPress={toggleMonth}
          className="min-w-0 flex-1 flex-row items-center gap-1 rounded-lg py-1 active:opacity-70">
          <Text numberOfLines={1} className="shrink text-lg font-semibold tracking-tight">
            {monthTitle}
          </Text>
          <Icon as={open ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
        </Pressable>
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={t('Tuần trước')}
          onPress={() => shiftWeek(-1)}>
          <Icon as={ChevronLeft} size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-3"
          disabled={date === today}
          accessibilityLabel={t('Về hôm nay, {date}', { date: dayTitle(today, locale) })}
          onPress={() => pick(today)}>
          <Text>{t('Hôm nay')}</Text>
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          accessibilityLabel={t('Tuần sau')}
          onPress={() => shiftWeek(1)}>
          <Icon as={ChevronRight} size={16} />
        </Button>
      </View>
      {open ? (
        // View thường, không animation layout/fade: trên Android kiến trúc mới, view đang chạy layout
        // animation của Reanimated nhận chạm lệch nên ô ngày của lịch tháng không bấm được.
        <View className="border border-border bg-card p-3">
          <MonthCalendar
            monthId={monthId}
            onMonthChange={setMonthId}
            ranges={[{ startId: date, endId: date }]}
            onDayPress={pick}
          />
        </View>
      ) : (
        <GestureDetector gesture={swipe}>
          <Animated.View
            key={days[0]}
            entering={entering}
            accessibilityRole="radiogroup"
            className="flex-row rounded-2xl border border-border/60 bg-muted p-1 dark:bg-card">
            {days.map((day, index) => {
              const selected = day === date;
              const lock = dayLocks[day];
              return (
                <Pressable
                  key={day}
                  accessibilityRole="radio"
                  accessibilityLabel={
                    lock === 'holiday' || lock === 'makeup'
                      ? `${dayTitle(day, locale)}, ${t(lock === 'holiday' ? 'Ngày nghỉ' : 'Học bù')}`
                      : dayTitle(day, locale)
                  }
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
                  <Text
                    className={cn(
                      'font-mono text-sm',
                      (lock === 'holiday' || lock === 'weekend') && 'text-muted-foreground',
                      selected && 'font-semibold'
                    )}>
                    {Number(day.slice(8))}
                  </Text>
                  <View
                    className={cn(
                      'size-1 rounded-full',
                      day === today ? 'bg-foreground' : 'bg-transparent'
                    )}
                  />
                  {lock === 'holiday' || lock === 'makeup' ? (
                    // Băng ngang ở đáy ô (đè chỗ chấm hôm nay); lớp bọc cắt theo bo góc của ô.
                    <View
                      pointerEvents="none"
                      className="absolute inset-0 overflow-hidden rounded-xl">
                      <View
                        className={cn(
                          'absolute bottom-0 left-0 right-0 items-center',
                          lock === 'holiday' ? 'bg-destructive' : 'bg-brand'
                        )}>
                        <Text className="text-[9px] font-semibold leading-3 text-white">
                          {t(lock === 'holiday' ? 'Nghỉ' : 'Học bù')}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}
