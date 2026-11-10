import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Text } from '@/components/ui/text';

import {
  dayTitle,
  selectMonth,
  shiftDays,
  WEEKDAY_LABELS,
  weekDates,
  weekLabel,
} from '../utils/schedule-date';

export function ScheduleCalendar({ date, today, onChange }) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [year, setYear] = useState(Number(date.slice(0, 4)));
  const days = weekDates(date);
  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-center justify-between gap-y-2">
        <Popover
          open={monthOpen}
          onOpenChange={(open) => {
            if (open) setYear(Number(date.slice(0, 4)));
            setMonthOpen(open);
          }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 rounded-xl px-2"
              accessibilityLabel="Chọn tháng và năm">
              <Text className="text-xs font-semibold">
                Tháng {Number(date.slice(5, 7))}/{date.slice(0, 4)}
              </Text>
              <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 gap-3 rounded-xl p-3">
            <View className="flex-row items-center justify-between">
              <CalendarArrow
                label="Năm trước"
                icon={ChevronLeft}
                onPress={() => setYear(year - 1)}
                disabled={year <= 1900}
              />
              <Text className="text-sm font-semibold">{year}</Text>
              <CalendarArrow
                label="Năm sau"
                icon={ChevronRight}
                onPress={() => setYear(year + 1)}
                disabled={year >= 9998}
              />
            </View>
            <View className="flex-row flex-wrap">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => {
                const selected =
                  year === Number(date.slice(0, 4)) && month === Number(date.slice(5, 7));
                return (
                  <View key={month} className="w-1/3 p-1">
                    <Button
                      variant={selected ? 'default' : 'ghost'}
                      size="sm"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        onChange(selectMonth(date, year, month));
                        setMonthOpen(false);
                      }}>
                      <Text className="text-xs">Tháng {month}</Text>
                    </Button>
                  </View>
                );
              })}
            </View>
          </PopoverContent>
        </Popover>
        <View className="flex-row items-center">
          <CalendarArrow
            label="Tuần trước"
            icon={ChevronLeft}
            onPress={() => onChange(shiftDays(date, -7))}
          />
          <Text className="text-[11px] font-medium">{weekLabel(days)}</Text>
          <CalendarArrow
            label="Tuần sau"
            icon={ChevronRight}
            onPress={() => onChange(shiftDays(date, 7))}
          />
        </View>
        <Button
          variant="outline"
          size="sm"
          className="h-9 min-w-9 rounded-xl px-2"
          accessibilityLabel={`Về hôm nay, ${dayTitle(today)}`}
          onPress={() => onChange(today)}>
          <Text className="text-xs font-semibold">{Number(today.slice(8))}</Text>
        </Button>
      </View>
      <View className="flex-row gap-1.5">
        {days.map((day, index) => (
          <View key={day} className="min-w-0 flex-1 gap-1.5">
            <Text className="text-center text-[11px] text-muted-foreground">
              {WEEKDAY_LABELS[index]}
            </Text>
            <Button
              variant={day === date ? 'default' : 'outline'}
              size="sm"
              accessibilityLabel={dayTitle(day)}
              accessibilityState={{ selected: day === date }}
              className="h-10 rounded-xl px-0"
              onPress={() => onChange(day)}>
              <Text className="text-xs font-semibold">{Number(day.slice(8))}</Text>
            </Button>
            <View className="h-1 items-center">
              {day === today ? <View className="size-1 rounded-full bg-brand" /> : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function CalendarArrow({ label, icon, onPress, disabled }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      hitSlop={4}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}>
      <Icon as={icon} size={16} />
    </Button>
  );
}
