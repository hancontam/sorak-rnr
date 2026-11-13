import { Calendar } from '@marceloterreiro/flash-calendar';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { FieldTrigger } from '@/components/shared/FieldTrigger';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

const DATE_ID = /^(\d{4})-(\d{2})-(\d{2})$/;
const VI_WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function parts(id) {
  const match = DATE_ID.exec(id || '');
  return match ? match.slice(1).map(Number) : null;
}

function monthIdOf(id) {
  const p = parts(id);
  return p ? `${p[0]}-${String(p[1]).padStart(2, '0')}-01` : null;
}

function shiftMonth(monthId, delta) {
  const [y, m] = parts(monthId);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

export function formatDateId(id, locale) {
  const p = parts(id);
  if (!p) return '';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(p[0], p[1] - 1, p[2])));
}

// Chọn khoảng ngày bằng lịch tháng trong bottom sheet; giá trị vẫn là chuỗi YYYY-MM-DD như form cũ.
export function DateRangeField({ label, startId, endId, minDateId, todayId, disabled, onChange }) {
  const t = useTranslation();
  const locale = useLocale();
  const english = locale?.startsWith('en');
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ startId, endId });
  const [monthId, setMonthId] = useState(monthIdOf(startId || todayId) || monthIdOf(minDateId));

  function show() {
    setRange({ startId, endId });
    setMonthId(monthIdOf(startId || todayId) || monthIdOf(minDateId));
    setOpen(true);
  }

  function press(id) {
    setRange((current) =>
      // Khoảng một ngày coi như mới có ngày đầu: chạm ngày sau đó sẽ kéo dài thành khoảng.
      !current.startId ||
      (current.endId && current.endId !== current.startId) ||
      id < current.startId
        ? { startId: id, endId: undefined }
        : { startId: current.startId, endId: id }
    );
  }

  function confirm() {
    if (!range.startId) return;
    onChange({ startId: range.startId, endId: range.endId || range.startId });
    setOpen(false);
  }

  const summary =
    startId && endId
      ? startId === endId
        ? formatDateId(startId, locale)
        : `${formatDateId(startId, locale)} – ${formatDateId(endId, locale)}`
      : '';
  const draft = range.startId
    ? range.endId && range.endId !== range.startId
      ? `${formatDateId(range.startId, locale)} – ${formatDateId(range.endId, locale)}`
      : formatDateId(range.startId, locale)
    : t('Chọn ngày bắt đầu');

  const calendarTheme = useMemo(
    () => ({
      rowMonth: { container: { height: 0, overflow: 'hidden' } },
      itemWeekName: {
        content: {
          fontFamily: FONT_FAMILY.sans.medium,
          fontSize: 11,
          color: theme.mutedForeground,
        },
      },
      itemDayContainer: { activeDayFiller: { backgroundColor: theme.muted } },
      itemDay: {
        base: () => ({
          content: { fontFamily: FONT_FAMILY.mono.regular, fontSize: 13, color: theme.foreground },
        }),
        idle: ({ isPressed, isDifferentMonth }) => ({
          container: { backgroundColor: isPressed ? theme.muted : 'transparent' },
          content: { color: isDifferentMonth ? theme.mutedForeground : theme.foreground },
        }),
        today: ({ isPressed }) => ({
          container: {
            borderWidth: 1,
            borderColor: theme.foreground,
            backgroundColor: isPressed ? theme.muted : 'transparent',
          },
          content: { fontFamily: FONT_FAMILY.mono.semibold, color: theme.foreground },
        }),
        active: ({ isStartOfRange, isEndOfRange }) => {
          const edge = isStartOfRange || isEndOfRange;
          return {
            container: {
              backgroundColor: edge ? theme.primary : theme.muted,
              borderTopLeftRadius: isStartOfRange ? 10 : 0,
              borderBottomLeftRadius: isStartOfRange ? 10 : 0,
              borderTopRightRadius: isEndOfRange ? 10 : 0,
              borderBottomRightRadius: isEndOfRange ? 10 : 0,
            },
            content: {
              fontFamily: edge ? FONT_FAMILY.mono.semibold : FONT_FAMILY.mono.regular,
              color: edge ? theme.primaryForeground : theme.foreground,
            },
          };
        },
        disabled: () => ({ content: { color: theme.mutedForeground, opacity: 0.4 } }),
      },
    }),
    [theme]
  );

  // Flash Calendar yêu cầu hàm định dạng ổn định giữa các lần render.
  const weekDayFormat = useCallback(
    (date) =>
      english
        ? new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(date)
        : VI_WEEKDAYS[date.getDay()],
    [english]
  );
  const [year, month] = parts(monthId) || [];
  const monthTitle = english
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(Date.UTC(year, month - 1, 1))
      )
    : t('Tháng {month}/{year}', { month, year });

  return (
    <>
      <FieldTrigger
        label={label}
        icon={CalendarDays}
        value={summary}
        placeholder={t('Chọn ngày')}
        mono
        disabled={disabled}
        onPress={show}
      />
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={label}
        description={draft}
        closeLabel={t('Đóng')}
        enableContentPanningGesture={false}>
        <View className="flex-row items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            accessibilityLabel={t('Tháng trước')}
            disabled={Boolean(minDateId) && shiftMonth(monthId, -1) < monthIdOf(minDateId)}
            onPress={() => setMonthId(shiftMonth(monthId, -1))}>
            <Icon as={ChevronLeft} size={18} />
          </Button>
          <Text className="text-sm font-semibold">{monthTitle}</Text>
          <Button
            variant="ghost"
            size="icon-sm"
            accessibilityLabel={t('Tháng sau')}
            onPress={() => setMonthId(shiftMonth(monthId, 1))}>
            <Icon as={ChevronRight} size={18} />
          </Button>
        </View>
        <Calendar
          calendarMonthId={monthId}
          calendarMinDateId={minDateId}
          calendarActiveDateRanges={[range]}
          calendarFirstDayOfWeek="monday"
          calendarFormatLocale={locale}
          calendarMonthHeaderHeight={0}
          calendarDayHeight={40}
          calendarRowVerticalSpacing={4}
          calendarRowHorizontalSpacing={0}
          getCalendarWeekDayFormat={weekDayFormat}
          onCalendarDayPress={press}
          theme={calendarTheme}
        />
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onPress={() => setRange({ startId: undefined, endId: undefined })}>
            <Text>{t('Chọn lại')}</Text>
          </Button>
          <Button className="flex-1" disabled={!range.startId} onPress={confirm}>
            <Text>{t('Xong')}</Text>
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}
