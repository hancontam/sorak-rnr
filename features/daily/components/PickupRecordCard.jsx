import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { isAbsent, pickupOptions } from '../utils/daily-records';
import { schoolClock } from '../utils/schedule-date';
import { StudentHeader } from './StudentHeader';

// Hàng gọn của một bé trong Đón trẻ: trạng thái và người/giờ đã đón; chọn người đón, giờ, dặn dò
// nằm trong sheet chi tiết (onOpenDetail) để danh sách hiện được nhiều bé.
export function PickupRecordCard({ row, first, editable, locked, onOpenDetail }) {
  const t = useTranslation();
  const { student, value } = row;
  const canOpen = student.isPresent && !locked;
  const canWrite = editable && student.isPresent;
  const [status, variant] = student.isDismissed
    ? ['Đã đón', 'default']
    : student.isPresent
      ? ['Chưa đón', 'secondary']
      : isAbsent(student)
        ? ['Vắng', 'outline']
        : ['Chưa điểm danh', 'outline'];
  const pickedAt = schoolClock(student.checkOutTime);
  const draftPerson = pickupOptions(student).find((person) => person.key === value.personKey);
  const detail = student.isDismissed
    ? [pickedAt, student.pickupPersonName, student.pickupRelationship].filter(Boolean).join(' · ')
    : row.changed && draftPerson
      ? `${t('Chưa lưu')}: ${[value.time, draftPerson.name].filter(Boolean).join(' · ')}`
      : !student.isPresent
        ? isAbsent(student)
          ? t('Vắng trong ngày, không ghi nhận đón trẻ.')
          : t('Cần điểm danh Có mặt trước khi ghi nhận đón trẻ.')
        : locked
          ? t('Không có ghi nhận đón trẻ trong ngày này.')
          : '';

  const content = (
    <>
      <StudentHeader
        compact
        name={student.name}
        code={student.code}
        avatarUrl={row.avatarUrl}
        right={
          canWrite && !student.isDismissed ? (
            <Button
              size="sm"
              accessibilityLabel={t('Ghi nhận đón {name}', { name: student.name })}
              onPress={onOpenDetail}>
              <Text>{t('Đón')}</Text>
            </Button>
          ) : (
            <View className="flex-row items-center gap-1">
              <Badge variant={variant}>
                <Text>{t(status)}</Text>
              </Badge>
              {canOpen ? (
                <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
              ) : null}
            </View>
          )
        }
      />
      {detail ? (
        <Text numberOfLines={1} className="pl-[42px] text-2xs text-muted-foreground">
          {detail}
        </Text>
      ) : null}
    </>
  );
  const rowClass = cn(
    'gap-1 border-x border-b border-border bg-card px-3 py-2.5',
    first && 'border-t'
  );
  if (!canOpen) return <View className={rowClass}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('Chi tiết đón trẻ của {name}', { name: student.name })}
      onPress={onOpenDetail}
      className={cn(rowClass, 'active:bg-muted')}>
      {content}
    </Pressable>
  );
}
