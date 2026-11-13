import { CircleCheck, Sun } from 'lucide-react-native';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { useActivityJournal } from '../hooks/useActivityJournal';

const SLOT_STATUS = {
  upcoming: 'Sắp diễn ra',
  in_progress: 'Đang diễn ra',
  completed: 'Đã qua khung giờ',
};

export default function ActivityJournalScreen() {
  const t = useTranslation();
  const { query, studentId } = useActivityJournal();
  const { studentName, entries = [] } = query.data ?? {};
  const done = entries.filter((item) => item.isDone).length;
  const ready = Boolean(studentId && query.isSuccess && entries.length);

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-xl px-4 py-4"
      data={query.isError || !studentId ? [] : entries}
      keyExtractor={(item) => String(item.id)}
      refreshing={query.isRefetching}
      onRefresh={studentId ? () => query.refetch() : undefined}
      ListHeaderComponent={
        <Card className="mb-4 gap-2.5 px-4 py-3.5">
          <View className="flex-row items-center justify-between gap-2">
            <Badge variant="secondary">
              <Text>{t('Hôm nay')}</Text>
            </Badge>
            {ready ? (
              <Text className="font-mono text-xs font-medium text-muted-foreground">
                {done}/{entries.length}
              </Text>
            ) : null}
          </View>
          <Text className="text-xs leading-5 text-muted-foreground">
            {studentName
              ? t('Hoạt động của {name} tại lớp hôm nay.', { name: studentName })
              : t('Xem các hoạt động tại lớp hôm nay.')}
          </Text>
          {ready ? (
            <Progress
              value={Math.round((done / entries.length) * 100)}
              className="h-1.5 bg-muted"
            />
          ) : null}
        </Card>
      }
      ListEmptyComponent={
        studentId && query.isPending ? (
          <ActivityIndicator className="py-10" accessibilityLabel={t('Đang tải nhật ký')} />
        ) : (
          <View className="items-center gap-3 rounded-2xl border border-dashed border-border px-5 py-8">
            <Text className="text-center text-sm text-muted-foreground">
              {t(
                !studentId
                  ? 'Tài khoản chưa có hồ sơ trẻ.'
                  : query.isError
                    ? 'Chưa tải được nhật ký hoạt động.'
                    : 'Chưa có hoạt động hôm nay.'
              )}
            </Text>
            {query.isError ? (
              <Button size="sm" variant="outline" onPress={() => query.refetch()}>
                <Text>{t('Thử lại')}</Text>
              </Button>
            ) : null}
          </View>
        )
      }
      renderItem={({ item, index }) => (
        <JournalEntry item={item} last={index === entries.length - 1} />
      )}
    />
  );
}

function JournalEntry({ item, last }) {
  const t = useTranslation();
  const slotStatus = Object.hasOwn(SLOT_STATUS, item.status) ? SLOT_STATUS[item.status] : '';
  const status = item.badge || (item.isDone ? 'Hoàn thành' : slotStatus);
  const current = item.status === 'in_progress';
  const [start, end] = item.time.split(/\s*[-–—]\s*/);

  return (
    <View className="flex-row items-stretch gap-3">
      <View className="w-11 items-end gap-0.5 pt-3.5">
        <Text className={cn('font-mono text-xs', current ? 'font-semibold' : 'font-medium')}>
          {start || '—'}
        </Text>
        {end ? <Text className="font-mono text-2xs text-muted-foreground">{end}</Text> : null}
      </View>
      <View className="w-5 items-center pt-3.5">
        <View
          className={cn(
            'size-5 items-center justify-center rounded-full border bg-background',
            item.isDone || current ? 'border-foreground' : 'border-border'
          )}>
          <Icon
            as={item.isDone ? CircleCheck : Sun}
            size={12}
            className={item.isDone || current ? 'text-foreground' : 'text-muted-foreground'}
          />
        </View>
        {!last ? <View className="mt-1 w-px flex-1 bg-border" /> : null}
      </View>
      <Card className={cn('mb-3 min-w-0 flex-1 gap-2 px-4 py-3.5', current && 'border-foreground')}>
        <View className="flex-row items-start gap-2">
          <Text className="min-w-0 flex-1 text-sm font-semibold leading-5">{item.title}</Text>
          {status ? (
            <Badge variant={current ? 'default' : item.isDone ? 'secondary' : 'outline'}>
              <Text>{t(status)}</Text>
            </Badge>
          ) : null}
        </View>
        {item.description ? (
          <Text className="text-xs leading-5 text-muted-foreground">{item.description}</Text>
        ) : null}
        {item.objective ? (
          <View className="gap-1 rounded-xl bg-muted px-3 py-2.5">
            <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('Mục tiêu bài học')}
            </Text>
            <Text className="text-xs leading-5">{item.objective}</Text>
          </View>
        ) : null}
        {item.notes ? (
          <View className="gap-1">
            <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('Ghi chú')}
            </Text>
            <Text className="text-xs leading-5">{item.notes}</Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
