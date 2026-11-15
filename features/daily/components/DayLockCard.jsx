import { CalendarOff } from 'lucide-react-native';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Thay card tình hình trong ngày khi ngày đó là ngày nghỉ (lịch năm học) hoặc cuối tuần không có lịch.
export function DayLockCard({ lock, isParent }) {
  const t = useTranslation();
  const holiday = lock.kind === 'holiday';
  const description = holiday
    ? isParent
      ? 'Trường nghỉ trong ngày này.'
      : 'Không điểm danh, ghi sức khỏe, đón trẻ hay đánh giá trong ngày nghỉ. Lịch đã sắp chỉ để xem lại.'
    : isParent
      ? 'Cuối tuần không có lịch học.'
      : 'Cuối tuần không có lịch học. Ngày có lịch học bù được ghi nhận như ngày thường.';
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
        <Text className="text-2xs leading-4 text-muted-foreground">{t(description)}</Text>
      </View>
    </Card>
  );
}
