import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { usePickupRequests } from '@/features/pickup/hooks/usePickupRequests';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { ChildDayResults } from '../components/ChildDayResults';
import { DayOverviewCard } from '../components/DayOverviewCard';
import { EmptyFrames, ScheduleFrame } from '../components/ScheduleFrame';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { ScheduleState } from '../components/ScheduleState';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolClock, schoolToday } from '../utils/schedule-date';
import {
  childDayResults,
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

export default function TimetableScreen() {
  const t = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const today = schoolToday();
  const clock = useSchoolClock();
  const [date, setDate] = useState(schoolToday);
  const { query, error, isParent, noClass } = useTimetable(date);
  const pickup = usePickupRequests({ date });
  const pendingCount = pickup.query.data?.stats?.pendingCount;
  const data = query.data;
  const noParentClass = isParent && data && (!data.student || !data.classInfo);
  const ready = Boolean(data && !error && !query.isError && !noClass && !noParentClass);
  const frames = ready ? dayFrames(data, date, isParent) : [];
  const items = timelineItems(frames);
  const activityCount = frames.reduce((sum, frame) => sum + frame.activities.length, 0);
  const now = date === today ? clock : '';

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
        key={date}
        data={items}
        keyExtractor={(item) => item.key}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 px-4 pb-8 pt-3"
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <ScheduleCalendar date={date} today={today} onChange={setDate} />
            {ready ? (
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
              {ready && activityCount ? (
                <Text className="ml-auto font-mono text-2xs text-muted-foreground">
                  {t('{count} hoạt động', { count: activityCount })}
                </Text>
              ) : null}
            </View>
          </View>
        }
        ListEmptyComponent={
          <ScheduleState
            loading={query.isPending}
            error={query.isError ? timetableError(query.error) : ''}
            onRetry={query.isError ? query.refetch : undefined}
            title={noParentClass ? 'Chưa có lớp học của con' : 'Chưa có lịch cho ngày này'}
            description="Bạn có thể chọn ngày khác hoặc kéo xuống để tải lại."
          />
        }
        renderItem={({ item }) =>
          item.type === 'empty' ? (
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
          )
        }
        ListFooterComponent={
          ready && isParent ? <ChildDayResults results={childDayResults(data, date)} /> : null
        }
      />
    </View>
  );
}
