import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import { getParentSchedule, getTimetable } from '@/features/daily/api/daily.api';
import { getTeacherDayActivities } from '@/features/daily/lib/daily-timetable';
import { getParentDayActivities } from '@/features/daily/lib/parent-timetable';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  HeartPulse,
  UserCheck,
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

export default function DailyTimetableScreen({ isParent = false, classId }) {
  const router = useRouter();
  const accountId = useAuthStore((state) => state.user?.id);
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [expandedKey, setExpandedKey] = React.useState(null);

  const currentWeek = React.useMemo(() => getWeekDates(selectedDate), [selectedDate]);
  const selectedDateStr = React.useMemo(() => formatDateISO(selectedDate), [selectedDate]);

  const teacherQuery = useQuery({
    queryKey: ['daily-timetable-teacher', classId, selectedDateStr],
    queryFn: () => getTimetable(classId, { date: selectedDateStr }),
    enabled: !isParent,
  });

  const parentQuery = useQuery({
    queryKey: ['daily-timetable-parent', accountId, selectedDateStr],
    queryFn: () => getParentSchedule({ date: selectedDateStr }),
    enabled: isParent,
  });

  const teacherTimetable = teacherQuery.data;
  const parentSchedule = parentQuery.data;
  const activeQuery = isParent ? parentQuery : teacherQuery;
  const isLoading = activeQuery.isLoading;

  // Extract live activities from backend
  const activities = React.useMemo(() => {
    if (isParent) {
      return getParentDayActivities(parentSchedule, selectedDateStr);
    }

    return teacherTimetable ? getTeacherDayActivities(teacherTimetable.slots, selectedDateStr) : [];
  }, [isParent, parentSchedule, teacherTimetable, selectedDateStr]);

  const monthLabel = `Tháng ${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`;
  const weekLabel = `Tuần ${currentWeek[0].getDate()}–${currentWeek[6].getDate()}`;

  const dayOfWeekNames = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ];
  const fullDayLabel = `${dayOfWeekNames[selectedDate.getDay()]}, ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`;

  const isRecorded = teacherTimetable?.stats?.isRecorded;
  const isDismissed = teacherTimetable?.stats?.isDismissalRecorded;
  const ownAttendance = parentSchedule?.attendance?.records?.find(
    (item) => item.isoDate === selectedDateStr
  );
  const dayStatus = isParent
    ? ownAttendance?.statusLabel || 'Chưa điểm danh'
    : isDismissed
      ? 'Đã đón'
      : isRecorded
        ? 'Đã điểm danh'
        : 'Đang diễn ra';

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
      <View className="mb-3 flex-row justify-between">
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
                  isSelected ? 'border-primary bg-primary' : 'border-border bg-background'
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

      {/* Quick Action Bar for Teachers */}
      {!isParent ? (
        <View className="mb-3 flex-row gap-2">
          <Pressable
            onPress={() => router.push('/daily/attendance')}
            accessibilityRole="button"
            accessibilityLabel="Mở màn hình Điểm danh"
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2.5 active:bg-accent/20">
            <Icon as={UserCheck} size={15} className="text-primary" />
            <Text className="text-xs font-semibold text-foreground">Điểm danh</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/daily/pickup')}
            accessibilityRole="button"
            accessibilityLabel="Mở màn hình Đón trẻ"
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2.5 active:bg-accent/20">
            <Icon as={Clock} size={15} className="text-primary" />
            <Text className="text-xs font-semibold text-foreground">Đón trẻ</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/daily/health')}
            accessibilityRole="button"
            accessibilityLabel="Mở màn hình Đo sức khỏe"
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2 py-2.5 active:bg-accent/20">
            <Icon as={HeartPulse} size={15} className="text-primary" />
            <Text className="text-xs font-semibold text-foreground">Sức khỏe</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Selected Day & Status Badge */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">{fullDayLabel}</Text>
        <Badge variant="secondary" className="px-2 py-0.5">
          <Text className="text-xs font-medium text-secondary-foreground">{dayStatus}</Text>
        </Badge>
      </View>

      {/* Timeline Viewport */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <ThemedSpinner size="large" />
          <Text className="mt-2 text-xs text-muted-foreground">Đang tải lịch sinh hoạt...</Text>
        </View>
      ) : activeQuery.isError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text-center text-sm text-destructive">
            {activeQuery.error?.response?.data?.message || activeQuery.error.message}
          </Text>
          <Button variant="outline" onPress={() => activeQuery.refetch()}>
            <Text>Thử lại</Text>
          </Button>
        </View>
      ) : activities.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6 py-12">
          <Icon as={CalendarDays} size={40} className="mb-3 text-muted-foreground/40" />
          <Text className="text-center text-sm font-medium text-foreground">
            Chưa có lịch sinh hoạt cho {fullDayLabel.toLowerCase()}
          </Text>
          <Text className="mt-1 text-center text-xs text-muted-foreground">
            Vui lòng chọn ngày khác trong tuần hoặc liên hệ nhà trường.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          className="flex-1">
          <View className="gap-3">
            {activities.map((item, idx) => (
              <View key={item.id || idx} className="flex-row items-start gap-3">
                <View className="w-16 pt-2">
                  <Text className="text-xs font-medium text-muted-foreground">{item.time}</Text>
                </View>
                <Pressable
                  className="flex-1"
                  disabled={isParent ? item.isPlaceholder : !item.activityId}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isParent
                      ? `Xem nội dung ${item.activity}`
                      : `Xem nội dung và đánh giá ${item.activity}`
                  }
                  onPress={() =>
                    isParent
                      ? setExpandedKey((key) =>
                          key === `${selectedDateStr}:${item.id}`
                            ? null
                            : `${selectedDateStr}:${item.id}`
                        )
                      : router.push({
                          pathname: '/daily/activity-assessment',
                          params: { slotId: String(item.id), date: selectedDateStr },
                        })
                  }>
                  <Card className="gap-2 p-3">
                    <Text
                      className="text-sm font-semibold text-foreground"
                      numberOfLines={
                        isParent && expandedKey === `${selectedDateStr}:${item.id}` ? undefined : 3
                      }>
                      {item.activity}
                    </Text>
                    {item.statusLabel ? (
                      <Badge variant="outline" className="self-start">
                        <Text className="text-[10px]">{item.statusLabel}</Text>
                      </Badge>
                    ) : null}
                    {item.description ? (
                      <Text
                        className="text-[13px] leading-5 text-muted-foreground"
                        numberOfLines={
                          isParent && expandedKey === `${selectedDateStr}:${item.id}`
                            ? undefined
                            : 3
                        }>
                        {item.description}
                      </Text>
                    ) : null}
                    {isParent && item.note ? (
                      <Text className="text-xs leading-5 text-muted-foreground">
                        {item.evaluatorName ? `${item.evaluatorName}: ` : ''}
                        {item.note}
                      </Text>
                    ) : null}
                    {isParent && expandedKey === `${selectedDateStr}:${item.id}` ? (
                      <>
                        {item.preparation ? (
                          <Text className="text-xs leading-5 text-muted-foreground">
                            Chuẩn bị: {item.preparation}
                          </Text>
                        ) : null}
                        {item.procedure ? (
                          <Text className="text-xs leading-5 text-muted-foreground">
                            Tổ chức hoạt động: {item.procedure}
                          </Text>
                        ) : null}
                      </>
                    ) : null}
                  </Card>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
