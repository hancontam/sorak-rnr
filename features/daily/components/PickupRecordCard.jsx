import { Check } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { isAbsent, pickupOptions } from '../utils/daily-records';
import { schoolClock } from '../utils/schedule-date';
import { StudentHeader } from './StudentHeader';

// Ô trạng thái bên phải mỗi hàng: cùng kích thước cho nút "Đón" (viền xanh) và trạng thái
// "Đã đón" (nền xanh nhạt + dấu tích) hay "Vắng" (chữ xám), để cột phải thẳng hàng.
function StatusBox({ tone, label }) {
  return (
    <View
      className={cn(
        'h-7 min-w-[76px] flex-row items-center justify-center gap-1 border px-2',
        tone === 'action' && 'border-primary bg-card',
        tone === 'done' && 'border-transparent bg-secondary',
        tone === 'off' && 'border-transparent bg-muted'
      )}>
      {tone === 'done' ? <Icon as={Check} size={12} className="text-primary" /> : null}
      <Text
        numberOfLines={1}
        className={cn(
          'text-xs font-medium',
          tone === 'off' ? 'text-muted-foreground' : 'text-primary'
        )}>
        {label}
      </Text>
    </View>
  );
}

// Hàng gọn của một bé trong Đón trẻ: trạng thái và người/giờ đã đón; chọn người đón, giờ, dặn dò
// nằm trong sheet chi tiết (onOpenDetail) để danh sách hiện được nhiều bé.
export function PickupRecordCard({ row, first, editable, locked, onOpenDetail }) {
  const t = useTranslation();
  const { student, value } = row;
  const canOpen = student.isPresent && !locked;
  const canWrite = editable && student.isPresent;
  const status = student.isDismissed
    ? 'Đã đón'
    : student.isPresent
      ? 'Chưa đón'
      : isAbsent(student)
        ? 'Vắng'
        : 'Chưa điểm danh';
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
            <StatusBox tone="action" label={t('Đón')} />
          ) : (
            <StatusBox tone={student.isDismissed ? 'done' : 'off'} label={t(status)} />
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
