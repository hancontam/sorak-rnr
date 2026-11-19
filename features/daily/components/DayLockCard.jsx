import { CalendarOff, ChevronRight } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { shortDate } from '../utils/schedule-date';

// Thay card tình hình trong ngày khi ngày đó là ngày nghỉ (lịch năm học) hoặc cuối tuần không có lịch.
// Ngày nghỉ có ngày dạy bù: báo lịch dời sang Thứ Bảy và cho mở ngày đó.
export function DayLockCard({ lock, onOpenMakeup }) {
  const t = useTranslation();
  const locale = useLocale();
  const holiday = lock.kind === 'holiday';
  return (
    <Card className="flex-row items-start gap-3 px-4 py-4">
      <View className="size-8 items-center justify-center rounded-lg bg-muted">
        <Icon as={CalendarOff} size={16} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-sm font-semibold">
            {holiday ? lock.name || t('Ngày nghỉ') : t('Nghỉ cuối tuần')}
          </Text>
          <Badge variant={holiday ? 'destructive' : 'outline'}>
            <Text>{t('Ngày nghỉ')}</Text>
          </Badge>
        </View>
        {lock.makeupDate ? (
          <Text className="text-2xs font-medium leading-4">
            {t('Lịch dạy được bù vào Thứ Bảy {date}.', {
              date: shortDate(lock.makeupDate, locale),
            })}
          </Text>
        ) : null}
        {lock.makeupDate && onOpenMakeup ? (
          <Button size="sm" variant="outline" className="mt-1 self-start" onPress={onOpenMakeup}>
            <Text>{t('Xem ngày học bù')}</Text>
            <Icon as={ChevronRight} size={14} />
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
