import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePickupRequests } from '@/features/pickup/hooks/usePickupRequests';

import { ChildDayResults } from '../components/ChildDayResults';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { ScheduleFrame } from '../components/ScheduleFrame';
import { ScheduleState } from '../components/ScheduleState';
import { ScheduleSummary } from '../components/ScheduleSummary';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolToday } from '../utils/schedule-date';
import { childDayResults, dayFrames, daySummary, timetableError } from '../utils/timetable-model';

export default function TimetableScreen() {
  const router = useRouter();
  const today = schoolToday();
  const [date, setDate] = useState(schoolToday);
  const { query, error, isParent, noClass } = useTimetable(date);
  const pickup = usePickupRequests({ date });
  const pendingCount = pickup.query.data?.stats?.pendingCount;
  const data = query.data;
  const noParentClass = isParent && data && (!data.student || !data.classInfo);
  const ready = Boolean(data && !error && !query.isError && !noClass && !noParentClass);
  const frames = ready ? dayFrames(data, date, isParent) : [];

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
        data={frames}
        keyExtractor={(frame) => frame.key}
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        refreshing={query.isRefetching}
        onRefresh={query.refetch}
        ListHeaderComponent={
          <View className="gap-4 pb-1">
            <ScheduleCalendar date={date} today={today} onChange={setDate} />
            {ready ? (
              <ScheduleSummary
                summary={daySummary(data, date, isParent)}
                className={data.classInfo.name}
                isParent={isParent}
                onOpenRecords={
                  isParent
                    ? undefined
                    : (kind) =>
                        router.push({
                          pathname: '/(teacher)/daily-records',
                          params: { kind, date },
                        })
                }
              />
            ) : null}
            {pickup.allowed ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: isParent ? '/(parent)/pickup-requests' : '/(teacher)/pickup-requests',
                    params: { date },
                  })
                }>
                <Text>Ủy quyền đón trẻ</Text>
                {Number.isInteger(pendingCount) && pendingCount > 0 ? (
                  <Badge variant="secondary">
                    <Text>{pendingCount} chờ duyệt</Text>
                  </Badge>
                ) : null}
              </Button>
            ) : null}
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text className="text-sm font-semibold">{dayTitle(date)}</Text>
              {date > today ? (
                <Badge variant="secondary">
                  <Text className="text-[10px]">Lịch sắp tới</Text>
                </Badge>
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
        renderItem={({ item }) => (
          <ScheduleFrame
            frame={item}
            onOpenActivity={(slotId) =>
              router.push({
                pathname: isParent ? '/(parent)/schedule-activity' : '/(teacher)/schedule-activity',
                params: { date, slotId },
              })
            }
          />
        )}
        ListFooterComponent={
          ready && isParent ? <ChildDayResults results={childDayResults(data, date)} /> : null
        }
      />
    </View>
  );
}
