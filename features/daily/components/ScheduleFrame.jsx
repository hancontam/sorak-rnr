import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { isCurrentFrame, routineTitle } from '../utils/timetable-model';

function TimeColumn({ start, end, current }) {
  return (
    <View className="min-w-11 items-end gap-0.5 pt-3.5">
      <Text
        numberOfLines={1}
        className={cn('font-mono text-xs', current ? 'font-semibold' : 'font-medium')}>
        {start || '—'}
      </Text>
      {end ? (
        <Text numberOfLines={1} className="font-mono text-2xs text-muted-foreground">
          {end}
        </Text>
      ) : null}
    </View>
  );
}

function NowBadge() {
  const t = useTranslation();
  return (
    <Badge>
      <Text>{t('Đang diễn ra')}</Text>
    </Badge>
  );
}

// Một khung sinh hoạt có hoạt động: cột giờ mono và thẻ hoạt động mở chi tiết.
export function ScheduleFrame({ frame, isParent, now, onOpenActivity }) {
  const t = useTranslation();
  const current = isCurrentFrame(frame, now);
  return (
    <View className="flex-row items-start gap-3">
      <TimeColumn start={frame.start} end={frame.end} current={current} />
      <View className="min-w-0 flex-1 gap-2">
        {frame.activities.map((activity) => (
          <Pressable
            key={activity.id}
            className="active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={t('Xem hoạt động {title}', {
              title: activity.title || t('Hoạt động chưa có tên'),
            })}
            onPress={() => onOpenActivity(activity.id)}>
            <Card className={cn('gap-1.5 px-4 py-3.5', current && 'border-foreground')}>
              <View className="flex-row items-center gap-2">
                <Text numberOfLines={1} className="min-w-0 flex-1 text-2xs text-muted-foreground">
                  {routineTitle(frame, isParent, t)}
                </Text>
                {current ? (
                  <NowBadge />
                ) : activity.status ? (
                  <Badge variant="secondary">
                    <Text>{t(activity.status)}</Text>
                  </Badge>
                ) : null}
                <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
              </View>
              <Text className="text-sm font-semibold leading-5" numberOfLines={3}>
                {activity.title || t('Hoạt động chưa có tên')}
              </Text>
              {activity.objective ? (
                <Text className="text-xs leading-5 text-muted-foreground" numberOfLines={2}>
                  {activity.objective}
                </Text>
              ) : null}
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Các khung chưa xếp hoạt động liên tiếp: gom một dòng, mở ra để xem đủ khung (không mở chi tiết).
export function EmptyFrames({ frames, isParent, now, defaultOpen }) {
  const t = useTranslation();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const first = frames[0];
  const last = frames[frames.length - 1];
  const range = [first.start, last.end].filter(Boolean).join('–');
  const hasCurrent = frames.some((frame) => isCurrentFrame(frame, now));
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <View className="flex-row items-start gap-3">
        <TimeColumn start={first.start} current={hasCurrent} />
        <View className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-dashed border-border">
          <CollapsibleTrigger asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              className="min-h-12 flex-row items-center gap-2 px-4 py-3 active:bg-muted/60">
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-xs font-medium">
                  {frames.length === 1
                    ? routineTitle(first, isParent, t)
                    : t('{count} khung chưa xếp hoạt động', { count: frames.length })}
                </Text>
                <Text className="font-mono text-2xs text-muted-foreground">
                  {frames.length === 1 ? t('Chưa xếp hoạt động') : range}
                </Text>
              </View>
              {hasCurrent && !open ? <NowBadge /> : null}
              {frames.length > 1 ? (
                <Icon
                  as={open ? ChevronUp : ChevronDown}
                  size={16}
                  className="text-muted-foreground"
                />
              ) : null}
            </Pressable>
          </CollapsibleTrigger>
          {frames.length > 1 ? (
            <CollapsibleContent>
              {frames.map((frame) => (
                <View
                  key={frame.key}
                  className="min-h-10 flex-row items-center gap-3 border-t border-dashed border-border px-4 py-2">
                  <Text
                    numberOfLines={1}
                    className="min-w-20 font-mono text-2xs text-muted-foreground">
                    {[frame.start, frame.end].filter(Boolean).join('–') || '—'}
                  </Text>
                  <Text numberOfLines={2} className="min-w-0 flex-1 text-xs text-muted-foreground">
                    {routineTitle(frame, isParent, t)}
                  </Text>
                  {isCurrentFrame(frame, now) ? <NowBadge /> : null}
                </View>
              ))}
            </CollapsibleContent>
          ) : null}
        </View>
      </View>
    </Collapsible>
  );
}
