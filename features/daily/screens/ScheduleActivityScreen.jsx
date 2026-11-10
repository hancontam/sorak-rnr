import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { ChildDayResults } from '../components/ChildDayResults';
import { ScheduleState } from '../components/ScheduleState';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolToday } from '../utils/schedule-date';
import {
  childDayResults,
  dayActivities,
  dayFrames,
  timetableError,
} from '../utils/timetable-model';

export default function ScheduleActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : '';
  const slotId = typeof params.slotId === 'string' ? params.slotId : '';
  const { query, error, noClass, isParent } = useTimetable(date);
  const data = query.data;
  const activity =
    data && (!isParent || (data.student && data.classInfo))
      ? dayActivities(data, date, isParent).find((slot) => slot.id === slotId)
      : null;
  const frame = activity
    ? dayFrames(data, date, isParent).find((item) =>
        item.activities.some((slot) => slot.id === activity.id)
      )
    : null;
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-xl gap-4 p-4 pb-10">
      {error || noClass || query.isPending || query.isError || !activity ? (
        <ScheduleState
          loading={!error && !noClass && query.isPending}
          error={error || (query.isError ? timetableError(query.error) : '')}
          onRetry={query.isError ? query.refetch : undefined}
          title={noClass ? 'Chưa được phân công lớp' : 'Không tìm thấy hoạt động trong ngày này'}
          description="Hãy quay lại thời khóa biểu và tải lại để xem lịch hiện tại."
        />
      ) : (
        <>
          <View className="gap-2">
            <Text className="text-xs text-muted-foreground">{dayTitle(date)}</Text>
            <Text className="text-xs text-muted-foreground">
              {frame?.title}
              {frame?.start ? ` · ${frame.start}` : ''}
              {frame?.end ? `–${frame.end}` : ''}
            </Text>
            <Text className="text-lg font-semibold leading-6">{activity.title}</Text>
            {activity.status ? (
              <Badge variant="secondary" className="self-start">
                <Text className="text-[11px]">{activity.status}</Text>
              </Badge>
            ) : null}
          </View>
          {[
            ['Mục tiêu giáo dục', activity.goal],
            ['Mục đích, yêu cầu', activity.objective],
            ['Chuẩn bị', activity.preparation],
            ['Tiến trình hoạt động', activity.procedure],
            ...(!isParent ? [['Tiêu chí đánh giá', activity.criteria]] : []),
          ].map(([label, value]) => (
            <Card key={label} className="gap-2 p-4 shadow-none">
              <Text className="text-sm font-semibold">{label}</Text>
              <Text className="text-xs leading-5 text-muted-foreground">
                {value || 'Chưa có nội dung được cung cấp.'}
              </Text>
            </Card>
          ))}
          {isParent ? (
            <ChildDayResults
              results={childDayResults(data, date, activity.routineKey)}
              forActivity
            />
          ) : null}
          {!isParent && activity.activityId ? (
            <Button
              size="sm"
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/daily-records',
                  params: { kind: 'assessment', date, slotId },
                })
              }>
              <Text>{date > schoolToday() ? 'Xem đánh giá học sinh' : 'Đánh giá học sinh'}</Text>
            </Button>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
