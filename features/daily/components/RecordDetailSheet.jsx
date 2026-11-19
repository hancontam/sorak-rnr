import { Check, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { MeasureField } from '@/components/shared/MeasureField';
import { TimeField } from '@/components/shared/TimeField';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { decimal, pickupOptions } from '../utils/daily-records';
import { schoolClock } from '../utils/schedule-date';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// Phần chi tiết của một bé, mở từ hàng gọn: ghi chú (điểm danh/đánh giá), nút −/+ số đo và ghi chú
// (sức khỏe), chọn người đón + giờ + dặn dò (đón trẻ). Dùng chung một sheet cho cả màn.
export function RecordDetailSheet({
  kind,
  row,
  editable,
  onChange,
  onClose,
  onPickup,
  onCreateAuthorization,
}) {
  const t = useTranslation();
  const open = Boolean(row);
  const student = row?.student;
  const value = row?.value || {};
  const canWrite = Boolean(row) && editable && (kind !== 'pickup' || student.isPresent);
  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
      title={student?.name || student?.code}
      description={student?.code}
      closeLabel={t('Đóng')}
      scrollable>
      {row ? (
        kind === 'pickup' ? (
          <PickupDetail
            row={row}
            canWrite={canWrite}
            onChange={onChange}
            onPickup={onPickup}
            onCreateAuthorization={onCreateAuthorization}
            t={t}
          />
        ) : (
          <>
            {kind === 'health' ? (
              <HealthDetail value={value} canWrite={canWrite} onChange={onChange} t={t} />
            ) : null}
            <View className="gap-1.5">
              <Text className="text-xs font-medium">{t('Ghi chú')}</Text>
              <Input
                accessibilityLabel={t('Ghi chú')}
                value={value.note}
                onChangeText={(note) => onChange({ note })}
                editable={canWrite}
                multiline
                maxLength={500}
                className="min-h-20 py-2"
                style={{ textAlignVertical: 'top' }}
              />
            </View>
            <Button onPress={onClose}>
              <Text>{t('Xong')}</Text>
            </Button>
          </>
        )
      ) : null}
    </BottomSheet>
  );
}

function HealthDetail({ value, canWrite, onChange, t }) {
  const height = decimal(value.height ?? '');
  const weight = decimal(value.weight ?? '');
  const bmi = height > 0 && weight > 0 ? (weight / (height / 100) ** 2).toFixed(1) : '';
  return (
    <>
      <MeasureField
        label={t('Chiều cao')}
        unit="cm"
        value={value.height ?? ''}
        onChange={(next) => onChange({ height: next })}
        editable={canWrite}
        steps={[0.5, 1]}
      />
      <MeasureField
        label={t('Cân nặng')}
        unit="kg"
        value={value.weight ?? ''}
        onChange={(next) => onChange({ weight: next })}
        editable={canWrite}
        steps={[0.1, 0.5]}
      />
      {bmi ? (
        <Text className="font-mono text-2xs text-muted-foreground">BMI {bmi} kg/m²</Text>
      ) : null}
    </>
  );
}

function PickupDetail({ row, canWrite, onChange, onPickup, onCreateAuthorization, t }) {
  const { student, value } = row;
  const people = pickupOptions(student);
  const selected = people.find((person) => person.key === value.personKey);

  // Chọn người đón thì điền luôn giờ hiện tại nếu chưa có giờ; giáo viên vẫn sửa được bên dưới.
  function choose(personKey) {
    onChange(value.time ? { personKey } : { personKey, time: schoolClock(new Date()) });
  }

  return (
    <>
      <View className="gap-1.5">
        <Text className="text-xs font-medium">{t('Người đón')}</Text>
        {people.length ? (
          <View accessibilityRole="radiogroup" className="border border-border">
            {people.map((person, index) => {
              const active = person.key === value.personKey;
              return (
                <Pressable
                  key={person.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active, disabled: !canWrite }}
                  disabled={!canWrite}
                  onPress={() => choose(person.key)}
                  className={cn(
                    'flex-row items-center gap-3 px-3 py-2.5 active:bg-muted',
                    index > 0 && 'border-t border-border',
                    active && 'bg-secondary'
                  )}>
                  <AccountAvatar
                    user={{ fullName: person.name, avatarUrl: person.avatarUrl || person.photoUrl }}
                    className="size-8"
                  />
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="text-sm font-medium">
                      {person.name}
                    </Text>
                    <Text numberOfLines={1} className="text-2xs text-muted-foreground">
                      {[person.relationship, person.phone].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  {active ? <Icon as={Check} size={16} className="text-primary" /> : null}
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text className="text-xs text-muted-foreground">
            {t('Chưa có người đón hợp lệ cho ngày này.')}
          </Text>
        )}
      </View>
      <TimeField
        label={t('Giờ đón')}
        value={value.time}
        disabled={!canWrite}
        now={() => schoolClock(new Date())}
        onChange={(time) => onChange({ time })}
      />
      <View className="gap-1.5">
        <Text className="text-xs font-medium">{t('Dặn dò phụ huynh')}</Text>
        <Input
          value={value.note}
          onChangeText={(note) => onChange({ note })}
          editable={canWrite}
          maxLength={500}
          accessibilityLabel={t('Dặn dò phụ huynh')}
        />
      </View>
      <Button
        disabled={!canWrite || !row.changed || !selected || !TIME_PATTERN.test(value.time)}
        onPress={onPickup}>
        <Text>
          {student.isDismissed ? t('Cập nhật ghi nhận đón trẻ') : t('Xác nhận đã đón trẻ')}
        </Text>
      </Button>
      {onCreateAuthorization && !student.isDismissed ? (
        <Button variant="outline" onPress={onCreateAuthorization}>
          <Icon as={Plus} size={14} />
          <Text>{t('Tạo ủy quyền')}</Text>
        </Button>
      ) : null}
    </>
  );
}
