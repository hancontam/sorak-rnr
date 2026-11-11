import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { routineTitle } from '../utils/timetable-model';

export function ScheduleFrame({ frame, isParent, onOpenActivity }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-start gap-3">
      <View className="w-11 gap-1 pt-3">
        <Text className="text-xs text-muted-foreground">{frame.start || '—'}</Text>
        {frame.end ? <Text className="text-[10px] text-muted-foreground">{frame.end}</Text> : null}
      </View>
      <View className="min-w-0 flex-1 gap-2">
        {frame.activities.length ? (
          frame.activities.map((activity) => (
            <Pressable
              key={activity.id}
              className="active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={t('Xem hoạt động {title}', {
                title: activity.title || t('Hoạt động chưa có tên'),
              })}
              onPress={() => onOpenActivity(activity.id)}>
              <Card className="gap-2 rounded-2xl p-3.5">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-[10px] text-muted-foreground">
                    {routineTitle(frame, isParent, t)}
                  </Text>
                  <Icon as={ChevronRight} size={14} className="text-muted-foreground" />
                </View>
                <Text className="text-sm font-semibold leading-5" numberOfLines={3}>
                  {activity.title || t('Hoạt động chưa có tên')}
                </Text>
                {activity.objective ? (
                  <Text className="text-xs leading-5 text-muted-foreground" numberOfLines={3}>
                    {activity.objective}
                  </Text>
                ) : null}
                {activity.status ? (
                  <Badge variant="secondary" className="self-start">
                    <Text className="text-[10px]">{t(activity.status)}</Text>
                  </Badge>
                ) : null}
              </Card>
            </Pressable>
          ))
        ) : (
          <Card className="gap-1.5 rounded-2xl border-dashed bg-muted/20 p-3.5 shadow-none">
            <Text className="text-xs font-medium">{routineTitle(frame, isParent, t)}</Text>
            <Text className="text-[11px] text-muted-foreground">{t('Chưa xếp hoạt động')}</Text>
          </Card>
        )}
      </View>
    </View>
  );
}
