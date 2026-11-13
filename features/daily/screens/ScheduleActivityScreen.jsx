import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { ChildDayResults } from '../components/ChildDayResults';
import { ScheduleState } from '../components/ScheduleState';
import { useTimetable } from '../hooks/useTimetable';
import { dayTitle, schoolToday } from '../utils/schedule-date';
import {
  childDayResults,
  dayActivities,
  dayFrames,
  routineTitle,
  timetableError,
} from '../utils/timetable-model';

export default function ScheduleActivityScreen() {
  const t = useTranslation();
  const router = useRouter();
  const locale = useLocale();
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
            <Text className="text-xs text-muted-foreground">{dayTitle(date, locale)}</Text>
            <Text className="text-lg font-semibold leading-6 tracking-tight">
              {activity.title || t('Hoạt động chưa có tên')}
            </Text>
            <View className="flex-row flex-wrap items-center gap-2">
              {frame ? (
                <Badge variant="secondary">
                  <Text>{routineTitle(frame, isParent, t)}</Text>
                </Badge>
              ) : null}
              {frame?.start ? (
                <Badge variant="code">
                  <Text>{[frame.start, frame.end].filter(Boolean).join('–')}</Text>
                </Badge>
              ) : null}
              {activity.status ? (
                <Badge variant="outline">
                  <Text>{t(activity.status)}</Text>
                </Badge>
              ) : null}
            </View>
          </View>
          <Card className="gap-0 py-0">
            {[
              [t('Mục tiêu giáo dục'), activity.goal],
              [t('Mục đích, yêu cầu'), activity.objective],
              [t('Chuẩn bị'), activity.preparation],
              [t('Tiến trình hoạt động'), activity.procedure],
              ...(!isParent ? [[t('Tiêu chí đánh giá'), activity.criteria]] : []),
            ].map(([label, value], index) => (
              <View
                key={label}
                className={cn('gap-1.5 px-4 py-3.5', index > 0 && 'border-t border-border')}>
                <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </Text>
                <Text className={cn('text-xs leading-5', !value && 'text-muted-foreground')}>
                  {value || t('Chưa có nội dung được cung cấp.')}
                </Text>
              </View>
            ))}
          </Card>
          {isParent ? (
            <ChildDayResults
              results={childDayResults(data, date, activity.routineKey)}
              forActivity
            />
          ) : null}
          {!isParent && activity.activityId ? (
            <Button
              onPress={() =>
                router.push({
                  pathname: '/(teacher)/daily-records',
                  params: { kind: 'assessment', date, slotId },
                })
              }>
              <Text>
                {date > schoolToday() ? t('Xem đánh giá học sinh') : t('Đánh giá học sinh')}
              </Text>
            </Button>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
