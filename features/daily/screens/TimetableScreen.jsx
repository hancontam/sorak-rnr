import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { usePullToRefresh } from '@/components/shared/usePullToRefresh';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { usePickupRequests } from '@/features/pickup/hooks/usePickupRequests';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { ChildDayResults } from '../components/ChildDayResults';
import { DayLockCard } from '../components/DayLockCard';
import { DayOverviewCard } from '../components/DayOverviewCard';
import { EmptyFrames, ScheduleFrame } from '../components/ScheduleFrame';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { ScheduleState } from '../components/ScheduleState';
import { useSchoolToday } from '../hooks/useSchoolToday';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolClock, schoolToday, weekDates } from '../utils/schedule-date';
import {
  childDayResults,
  dayCalendar,
  dayFrames,
  dayOverview,
  timelineItems,
  timetableError,
} from '../utils/timetable-model';

// Giờ trường hiện tại, cập nhật mỗi phút để đánh dấu khung "Đang diễn ra".
function useSchoolClock() {
  const [now, setNow] = useState(() => schoolClock(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(schoolClock(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const PLACEHOLDER_STYLE = { opacity: 0.45 };
const HOLIDAY_STYLE = { opacity: 0.55 };

export default function TimetableScreen() {
  const t = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const today = useSchoolToday();
  const clock = useSchoolClock();
  const [date, setDate] = useState(schoolToday);
  const { query, error, isParent, noClass } = useTimetable(date, { prefetchWeek: true });
  const pickup = usePickupRequests({ date });
  const pendingCount = pickup.query.data?.stats?.pendingCount;
  const data = query.data;
  const pull = usePullToRefresh(query.refetch);
  const noParentClass = isParent && data && (!data.student || !data.classInfo);
  const ready = Boolean(data && !error && !query.isError && !noClass && !noParentClass);
  const frames = ready ? dayFrames(data, date, isParent) : [];
  const items = timelineItems(frames);
  const activityCount = frames.reduce((sum, frame) => sum + frame.activities.length, 0);
  const now = date === today ? clock : '';
  // Đang hiện lịch của ngày trước trong cùng tuần trong lúc tải ngày mới: slot đúng nhưng số liệu
  // trong ngày (điểm danh, sức khỏe, đón trẻ) chưa phải của ngày này nên ẩn card và làm mờ lịch.
  const placeholder = query.isPlaceholderData;
  // Ngày nghỉ/cuối tuần chỉ phụ thuộc lịch năm học và slot của tuần nên vẫn đúng với lịch tạm.
  const calendar = ready ? dayCalendar(data, date, isParent) : null;
  const lock = calendar?.lock;
  const dayLocks = ready
    ? Object.fromEntries(
        weekDates(date)
          .map((day) => [day, dayCalendar(data, day, isParent).lock?.kind])
          .filter(([, kind]) => kind)
      )
    : undefined;

  if (error || noClass)
    return (
      <View className="flex-1 bg-background p-4">
        <ScheduleState
          error={error}
          title="Chưa được phân công lớp"
          description="Nhà trường sẽ cập nhật lớp phụ trách. Bạn vẫn có thể mở hồ sơ và cài đặt tài khoản."
        />
      </View>
    );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 px-4 pb-8 pt-3"
        refreshing={pull.refreshing}
        onRefresh={pull.onRefresh}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <ScheduleCalendar date={date} today={today} onChange={setDate} dayLocks={dayLocks} />
            {lock ? <DayLockCard lock={lock} isParent={isParent} /> : null}
            {ready && placeholder && !lock ? (
              <View className="flex-row items-center gap-2 px-1 py-2">
                <ActivityIndicator size="small" />
                <Text className="text-xs text-muted-foreground">
                  {t('Đang tải số liệu trong ngày…')}
                </Text>
              </View>
            ) : null}
            {ready && !placeholder && !lock ? (
              <DayOverviewCard
                overview={dayOverview(data, date, isParent)}
                isParent={isParent}
                isToday={date === today}
                pendingCount={pendingCount}
                onOpenRecords={
                  isParent
                    ? undefined
                    : (kind) =>
                        router.push({
                          pathname: '/(teacher)/daily-records',
                          params: { kind, date },
                        })
                }
                onOpenPickupRequests={
                  pickup.allowed
                    ? () =>
                        router.push({
                          pathname: isParent
                            ? '/(parent)/pickup-requests'
                            : '/(teacher)/pickup-requests',
                          params: { date },
                        })
                    : undefined
                }
              />
            ) : null}
            <View className="flex-row flex-wrap items-center gap-2 pt-1">
              <Text className="text-sm font-semibold">{dayTitle(date, locale)}</Text>
              {date === today ? (
                <Badge variant="secondary">
                  <Text>{t('Hôm nay')}</Text>
                </Badge>
              ) : date > today ? (
                <Badge variant="outline">
                  <Text>{t('Lịch sắp tới')}</Text>
                </Badge>
              ) : null}
              {calendar?.events.map((name) => (
                <Badge key={name} variant="outline">
                  <Text>{name}</Text>
                </Badge>
              ))}
              {ready && activityCount ? (
                <Text className="ml-auto font-mono text-2xs text-muted-foreground">
                  {t('{count} hoạt động', { count: activityCount })}
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          // Cuối tuần không có lịch: card ngày nghỉ đã nói rõ, không thêm khối trống.
          lock?.kind === 'weekend' ? null : (
            <ScheduleState
              loading={query.isPending}
              error={query.isError ? timetableError(query.error) : ''}
              onRetry={query.isError ? query.refetch : undefined}
              title={noParentClass ? 'Chưa có lớp học của con' : 'Chưa có lịch cho ngày này'}
              description="Bạn có thể chọn ngày khác hoặc kéo xuống để tải lại."
            />
          )
        }
        renderItem={({ item }) => (
          // Lịch tạm của ngày trước: làm mờ và chưa cho chạm tới khi có dữ liệu ngày mới.
          // Ngày nghỉ: slot đã sắp làm xám, vẫn mở được để xem nội dung (không đánh giá).
          <View
            style={
              placeholder ? PLACEHOLDER_STYLE : lock?.kind === 'holiday' ? HOLIDAY_STYLE : undefined
            }
            pointerEvents={placeholder ? 'none' : 'auto'}>
            {item.type === 'empty' ? (
              <EmptyFrames
                frames={item.frames}
                isParent={isParent}
                now={now}
                defaultOpen={items.length === 1}
              />
            ) : (
              <ScheduleFrame
                frame={item.frame}
                isParent={isParent}
                now={now}
                onOpenActivity={(slotId) =>
                  router.push({
                    pathname: isParent
                      ? '/(parent)/schedule-activity'
                      : '/(teacher)/schedule-activity',
                    params: { date, slotId },
                  })
                }
              />
            )}
          </View>
        )}
        ListFooterComponent={
          ready && isParent ? <ChildDayResults results={childDayResults(data, date)} /> : null
        }
      />
    </View>
  );
}
