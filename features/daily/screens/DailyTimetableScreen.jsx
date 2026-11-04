import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { getParentSchedule, getTimetable } from '@/features/daily/api/daily.api';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function getWeekDates(referenceDate) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  const week = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    week.push(next);
  }
  return week;
}

function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DEFAULT_ACTIVITIES = [
  {
    time: '07:15',
    activity: 'Đón trẻ, chơi',
    description: 'Thực hành giao tiếp: Bé bày tỏ mong muốn với cô giáo bằng câu hoàn chỉnh',
  },
  {
    time: '08:00',
    activity: 'Thể dục sáng',
    description: 'Bài tập thể dục sáng: "Gà trống gáy sáng" kết hợp cờ và nơ hoa',
  },
  {
    time: '08:30',
    activity: 'Học',
    description: 'Thí nghiệm cảm giác: "Chiếc túi kỳ diệu" sờ đoán vật cứng – mềm',
  },
  {
    time: '09:15',
    activity: 'Chơi, hoạt động ở các góc',
    description: 'Trò chơi: "Chọn trang phục phù hợp cho bạn búp bê đi dạo phố"',
  },
  {
    time: '10:15',
    activity: 'Chơi ngoài trời',
    description: 'Bé dạo chơi vườn trường quan sát hoa hồng, hoa cúc và quả chuối',
  },
  {
    time: '11:15',
    activity: 'Ăn trưa & vệ sinh',
    description: 'Rèn luyện kỹ năng tự xúc cơm và rửa tay bằng xà phòng đúng 6 bước',
  },
  {
    time: '12:00',
    activity: 'Ngủ trưa',
    description: 'Nghe nhạc êm dịu, rèn thói quen nằm ngủ đúng tư thế',
  },
  {
    time: '14:00',
    activity: 'Chơi, hoạt động theo ý thích',
    description: 'Luyện thanh vui nhộn: "Bé phát âm các từ quen thuộc qua trò chơi con ong vò vẽ"',
  },
  {
    time: '15:30',
    activity: 'Trả trẻ',
    description: 'Giờ trả trẻ: Bé kể cho cô hoặc bố mẹ nghe điều vui nhất hôm nay ở lớp',
  },
];

export default function DailyTimetableScreen({ isParent = false, classId }) {
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState(today);

  const currentWeek = React.useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const selectedDateStr = React.useMemo(() => formatDateISO(selectedDate), [selectedDate]);

  const { data: teacherTimetable, isLoading: isLoadingTeacher } = useQuery({
    queryKey: ['daily-timetable-teacher', classId, selectedDateStr],
    queryFn: () => getTimetable(classId, { date: selectedDateStr }),
    enabled: !isParent,
  });

  const { data: parentSchedule, isLoading: isLoadingParent } = useQuery({
    queryKey: ['daily-timetable-parent', selectedDateStr],
    queryFn: () => getParentSchedule({ date: selectedDateStr }),
    enabled: isParent,
  });

  const isLoading = isParent ? isLoadingParent : isLoadingTeacher;

  const activities = React.useMemo(() => {
    if (isParent) {
      if (parentSchedule?.routineSlots && parentSchedule.routineSlots.length > 0) {
        return parentSchedule.routineSlots.map((s) => ({
          time: s.time?.split('–')?.[0]?.trim() || s.time || '08:00',
          activity: s.title,
          description: s.description,
        }));
      }
    } else {
      if (teacherTimetable?.days) {
        const foundDay = teacherTimetable.days.find(
          (d) => d.date === selectedDateStr || d.fullDate === selectedDateStr
        );
        if (foundDay?.activities?.length > 0) {
          return foundDay.activities;
        }
      }
      if (teacherTimetable?.slots?.length > 0) {
        return teacherTimetable.slots.map((s) => ({
          time: s.time || s.startTime || '08:00',
          activity: s.name || s.title || s.activity,
          description: s.description || s.objective || '',
        }));
      }
    }
    return DEFAULT_ACTIVITIES;
  }, [isParent, parentSchedule, teacherTimetable, selectedDateStr]);

  const monthLabel = `Tháng ${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
  const weekLabel = `Tuần ${currentWeek[0].getDate()}–${currentWeek[6].getDate()}`;

  const dayOfWeekNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const fullDayLabel = `${dayOfWeekNames[selectedDate.getDay()]}, ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`;

  const isRecorded = teacherTimetable?.stats?.isRecorded;
  const isDismissed = teacherTimetable?.stats?.isDismissalRecorded;

  return (
    <View className="flex-1">
      {/* Month Picker & Week Navigator */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="h-9 flex-row items-center justify-between rounded-md border border-border bg-background px-3">
          <Text className="text-sm font-medium text-foreground">{monthLabel}</Text>
          <Icon as={ChevronDown} size={14} className="ml-1 text-muted-foreground" />
        </View>

        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 7);
              setSelectedDate(prev);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tuần trước"
            className="size-8 items-center justify-center rounded-md border border-border bg-background active:bg-accent/20">
            <Icon as={ChevronLeft} size={16} className="text-foreground" />
          </Pressable>

          <View className="min-w-[80px] items-center px-1">
            <Text className="text-xs font-medium text-foreground">{weekLabel}</Text>
          </View>

          <Pressable
            onPress={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 7);
              setSelectedDate(next);
            }}
            accessibilityRole="button"
            accessibilityLabel="Tuần tiếp theo"
            className="size-8 items-center justify-center rounded-md border border-border bg-background active:bg-accent/20">
            <Icon as={ChevronRight} size={16} className="text-foreground" />
          </Pressable>
        </View>

        <Button
          variant="outline"
          size="sm"
          onPress={() => setSelectedDate(new Date())}
          className="h-9 px-3">
          <Text className="text-sm font-medium text-foreground">{today.getDate()}</Text>
        </Button>
      </View>

      {/* Weekday Selector (T2–CN) */}
      <View className="mb-4 flex-row justify-between">
        {currentWeek.map((dayDate, index) => {
          const isSelected =
            dayDate.getDate() === selectedDate.getDate() &&
            dayDate.getMonth() === selectedDate.getMonth() &&
            dayDate.getFullYear() === selectedDate.getFullYear();
          const dayNumber = dayDate.getDate();

          return (
            <Pressable
              key={index}
              onPress={() => setSelectedDate(dayDate)}
              className="items-center"
              style={{ width: '13%' }}>
              <Text
                className={`mb-1.5 text-xs ${
                  isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}>
                {WEEKDAYS[index]}
              </Text>
              <View
                className={`h-10 w-full items-center justify-center rounded-md border ${
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-background'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    isSelected ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                  {dayNumber}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Selected Day & Status Badge */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">{fullDayLabel}</Text>
        <Badge variant="secondary" className="px-2 py-0.5">
          <Text className="text-xs font-medium text-secondary-foreground">
            {isDismissed ? 'Đã đón' : isRecorded ? 'Đã điểm danh' : 'Đang diễn ra'}
          </Text>
        </Badge>
      </View>

      {/* Timeline Viewport */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ThemedSpinner size="large" />
          <Text className="mt-2 text-xs text-muted-foreground">Đang tải lịch sinh hoạt...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          className="flex-1">
          <View className="gap-3">
            {activities.map((item, idx) => (
              <View key={idx} className="flex-row items-start gap-3">
                <View className="w-12 pt-2">
                  <Text className="text-xs font-medium text-muted-foreground">{item.time}</Text>
                </View>
                <Card className="flex-1 p-3">
                  <Text className="text-sm font-semibold text-foreground">{item.activity}</Text>
                  {item.description ? (
                    <Text className="mt-1 text-[13px] leading-5 text-muted-foreground">
                      {item.description}
                    </Text>
                  ) : null}
                </Card>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
