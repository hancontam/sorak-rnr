import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import { usePullToRefresh } from '@/components/shared/usePullToRefresh';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { usePickupRequests } from '@/features/pickup/hooks/usePickupRequests';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { ChildDayResults } from '../components/ChildDayResults';
import { ChildDaySummary } from '../components/ChildDaySummary';
import { DayLockCard } from '../components/DayLockCard';
import { DayStatusBar } from '../components/DayStatusBar';
import { EmptyFrames, ScheduleFrame } from '../components/ScheduleFrame';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { ScheduleState } from '../components/ScheduleState';
import { useSchoolToday } from '../hooks/useSchoolToday';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolClock, schoolToday, shortDate, weekDates } from '../utils/schedule-date';
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
  const pickup = usePickupRequests({ date, enabled: isParent });
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
          .map((day) => {
            const info = dayCalendar(data, day, isParent);
            return [day, info.lock?.kind || (info.makeup ? 'makeup' : undefined)];
          })
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
              {calendar?.makeupOf ? (
                <Badge variant="brand">
                  <Text>{t('Bù cho {date}', { date: shortDate(calendar.makeupOf, locale) })}</Text>
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
            {lock ? (
              <DayLockCard
                lock={lock}
                onOpenMakeup={lock.makeupDate ? () => setDate(lock.makeupDate) : undefined}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          // Cuối tuần không có lịch: card ngày nghỉ đã nói rõ, không thêm khối trống.
          lock?.kind === 'weekend' ? null : (
            <ScheduleState
              loading={query.isPending}
              skeleton="timetable"
              error={query.isError ? timetableError(query.error) : ''}
              onRetry={query.isError ? query.refetch : undefined}
              title={noParentClass ? 'Chưa có lớp học của con' : 'Chưa có lịch cho ngày này'}
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
          ready && isParent ? (
            // Phụ huynh: lịch đi ngay sau dải ngày; ngày của bé và kết quả hoạt động nằm dưới lịch.
            <View className="gap-3 pt-3">
              {!placeholder && !lock ? (
                <View className="gap-2.5">
                  <Text className="text-sm font-semibold">{t('Ngày của bé')}</Text>
                  <ChildDaySummary
                    overview={dayOverview(data, date, true)}
                    pendingCount={pendingCount}
                    onOpenPickupRequests={
                      pickup.allowed
                        ? () =>
                            router.push({ pathname: '/(parent)/pickup-requests', params: { date } })
                        : undefined
                    }
                  />
                </View>
              ) : null}
              <ChildDayResults results={childDayResults(data, date)} />
            </View>
          ) : null
        }
      />
      {ready && !lock && !isParent ? (
        placeholder ? (
          <View
            accessible
            accessibilityLabel={t('Đang tải số liệu trong ngày…')}
            className="flex-row gap-3 border-t border-border bg-background px-4 py-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-8 flex-1" />
            ))}
          </View>
        ) : (
          <DayStatusBar
            overview={dayOverview(data, date, false)}
            onOpenRecords={(kind) =>
              router.push({ pathname: '/(teacher)/daily-records', params: { kind, date } })
            }
          />
        )
      ) : null}
    </View>
  );
}
