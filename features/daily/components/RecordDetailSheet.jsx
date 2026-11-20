import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { MeasureField } from '@/components/shared/MeasureField';
import { BottomSheet, BottomSheetInput } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { decimal, pickupOptions } from '../utils/daily-records';

// Phần chi tiết của một bé, mở từ hàng gọn: ghi chú (điểm danh/đánh giá), nút −/+ số đo và ghi chú
// (sức khỏe), chọn người đón để ghi nhận đón trẻ. Dùng chung một sheet cho cả màn.
export function RecordDetailSheet({ kind, row, editable, onChange, onClose, onPickup }) {
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
          <PickupDetail key={row.id} row={row} canWrite={canWrite} onPickup={onPickup} t={t} />
        ) : (
          <>
            {kind === 'health' ? (
              <HealthDetail value={value} canWrite={canWrite} onChange={onChange} t={t} />
            ) : null}
            <View className="gap-1.5">
              <Text className="text-xs font-medium">{t('Ghi chú')}</Text>
              <BottomSheetInput
                accessibilityLabel={t('Ghi chú')}
                placeholder={t('Nhập ghi chú (không bắt buộc)')}
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

function PickupDetail({ row, canWrite, onPickup, t }) {
  const { student, value } = row;
  const people = pickupOptions(student);
  const [selected, setSelected] = useState(value.personKey || '');
  const unchanged = student.isDismissed && selected === value.personKey;

  // Chọn người đón rồi bấm xác nhận một lần trong sheet mới ghi nhận (giờ hiện tại, hoặc giữ giờ cũ
  // khi đổi người đã đón), tránh bấm nhầm. Đơn ủy quyền tạo trong mục Yêu cầu ủy quyền.
  return (
    <>
      <View className="gap-1.5">
        <Text className="text-xs font-medium">{t('Người đón')}</Text>
        {people.length ? (
          <View accessibilityRole="radiogroup" className="border border-border">
            {people.map((person, index) => {
              const active = person.key === selected;
              return (
                <Pressable
                  key={person.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active, disabled: !canWrite }}
                  disabled={!canWrite}
                  onPress={() => setSelected(person.key)}
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
      {people.length ? (
        <Button disabled={!canWrite || !selected || unchanged} onPress={() => onPickup(selected)}>
          <Text>{student.isDismissed ? t('Cập nhật') : t('Xác nhận')}</Text>
        </Button>
      ) : null}
    </>
  );
}
