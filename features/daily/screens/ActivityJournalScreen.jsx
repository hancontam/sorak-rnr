import { CircleCheck, Clock, Sun } from 'lucide-react-native';
import { ActivityIndicator, FlatList, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
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

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-xl px-4 py-4"
      data={query.isError || !studentId ? [] : entries}
      keyExtractor={(item) => String(item.id)}
      refreshing={query.isRefetching}
      onRefresh={studentId ? () => query.refetch() : undefined}
      ListHeaderComponent={
        <View className="gap-2 pb-4">
          <Badge variant="brand" className="self-start">
            <Text className="text-[10px]">{t('Hôm nay')}</Text>
          </Badge>
          <Text className="text-xs text-muted-foreground">
            {studentName
              ? t('Hoạt động của {name} tại lớp hôm nay.', { name: studentName })
              : t('Xem các hoạt động tại lớp hôm nay.')}
          </Text>
        </View>
      }
      ListEmptyComponent={
        studentId && query.isPending ? (
          <ActivityIndicator accessibilityLabel={t('Đang tải nhật ký')} />
        ) : (
          <Card className="gap-3 p-4 shadow-none">
            <Text className="text-sm text-muted-foreground">
              {t(
                !studentId
                  ? 'Tài khoản chưa có hồ sơ trẻ.'
                  : query.isError
                    ? 'Chưa tải được nhật ký hoạt động.'
                    : 'Chưa có hoạt động hôm nay.'
              )}
            </Text>
            {query.isError ? (
              <Button
                size="sm"
                variant="outline"
                className="self-start"
                onPress={() => query.refetch()}>
                <Text>{t('Thử lại')}</Text>
              </Button>
            ) : null}
          </Card>
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
  const accent = item.isDone === true || item.status === 'in_progress';

  return (
    <View className="flex-row items-stretch gap-3">
      <View className="w-7 items-center pt-1">
        <View
          className={`size-7 items-center justify-center rounded-full border bg-background ${accent ? 'border-brand' : 'border-border'}`}>
          <Icon
            as={item.isDone === true ? CircleCheck : Sun}
            size={14}
            className={accent ? 'text-brand' : 'text-muted-foreground'}
          />
        </View>
        {!last ? <View className="w-px flex-1 bg-border" /> : null}
      </View>
      <Card className="mb-3 min-w-0 flex-1 gap-2 p-3 shadow-none">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          {item.time ? (
            <View className="flex-row items-center gap-1.5">
              <Icon as={Clock} size={13} className="text-brand" />
              <Text className="text-[11px] text-brand">{item.time}</Text>
            </View>
          ) : null}
          {status ? (
            <Badge variant={accent ? 'brand' : 'secondary'}>
              <Text className="text-[10px]">{t(status)}</Text>
            </Badge>
          ) : null}
        </View>
        <Text className="text-sm font-semibold">{item.title}</Text>
        {item.description ? (
          <Text className="text-xs leading-5 text-muted-foreground">{item.description}</Text>
        ) : null}
        {item.objective ? (
          <View className="gap-1 rounded-lg bg-muted p-2">
            <Text className="text-xs font-medium">{t('Mục tiêu bài học')}</Text>
            <Text className="text-xs leading-5 text-muted-foreground">{item.objective}</Text>
          </View>
        ) : null}
        {item.notes ? (
          <View className="gap-1">
            <Text className="text-xs font-medium">{t('Ghi chú')}</Text>
            <Text className="text-xs leading-5 text-muted-foreground">{item.notes}</Text>
          </View>
        ) : null}
      </Card>
    </View>
  );
}
