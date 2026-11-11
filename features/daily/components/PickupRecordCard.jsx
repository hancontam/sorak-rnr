import { RotateCcw } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { isAbsent, pickupOptions } from '../utils/daily-records';
import { schoolClock } from '../utils/schedule-date';

export function PickupRecordCard({
  row,
  editable,
  onChange,
  onPickup,
  onUndoPickup,
  onCreateAuthorization,
}) {
  const t = useTranslation();
  const { student, value } = row;
  const people = pickupOptions(student);
  const selected = people.find((person) => person.key === value.personKey);
  const canWrite = editable && student.isPresent;
  const status = student.isDismissed
    ? 'Đã đón'
    : student.isPresent
      ? 'Chưa đón'
      : isAbsent(student)
        ? 'Vắng'
        : 'Chưa điểm danh';
  const personLabel = (person) => [person.name, person.relationship].filter(Boolean).join(' · ');

  return (
    <Card className="gap-3 p-4 shadow-none">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-semibold">{student.name || student.code}</Text>
          <Text className="text-xs text-muted-foreground">{student.code}</Text>
        </View>
        <Badge variant={student.isDismissed ? 'brand' : 'secondary'}>
          <Text className="text-[11px]">{t(status)}</Text>
        </Badge>
      </View>
      {student.isDismissed ? (
        <Text className="text-xs">
          {[student.pickupPersonName, student.pickupRelationship, schoolClock(student.checkOutTime)]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
      {!student.isPresent ? (
        <Text className="text-xs text-muted-foreground">
          {isAbsent(student)
            ? t('Học sinh vắng trong ngày này, không ghi nhận đón trẻ.')
            : t('Chưa có điểm danh Có mặt. Hoàn tất điểm danh rồi quay lại ghi nhận đón trẻ.')}
        </Text>
      ) : null}
      <View className="gap-1.5">
        <Text className="text-xs">{t('Người đón')}</Text>
        <Select
          disabled={!canWrite || !people.length}
          value={selected ? { value: selected.key, label: personLabel(selected) } : undefined}
          onValueChange={(option) => onChange({ personKey: option?.value || '' })}>
          <SelectTrigger
            size="sm"
            accessibilityLabel={t('Người đón {name}', { name: student.name })}>
            <SelectValue placeholder={t('Chọn người thân hoặc người được ủy quyền')} />
          </SelectTrigger>
          <SelectContent>
            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
              {people.map((person) => (
                <SelectItem key={person.key} value={person.key} label={personLabel(person)} />
              ))}
            </ScrollView>
          </SelectContent>
        </Select>
        {selected?.phone ? (
          <Text className="text-xs text-muted-foreground">{selected.phone}</Text>
        ) : null}
        {!people.length ? (
          <Text className="text-xs text-muted-foreground">
            {t('Chưa có người đón hợp lệ cho ngày này.')}
          </Text>
        ) : null}
      </View>
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-xs">{t('Giờ đón (HH:mm)')}</Text>
          <Button
            size="sm"
            variant="ghost"
            disabled={!canWrite}
            onPress={() => onChange({ time: schoolClock(new Date()) })}>
            <Text className="text-xs">{t('Giờ hiện tại')}</Text>
          </Button>
        </View>
        <Input
          value={value.time}
          onChangeText={(time) => onChange({ time })}
          editable={canWrite}
          maxLength={5}
          placeholder="HH:mm"
          accessibilityLabel={t('Giờ đón')}
          className="text-sm"
        />
      </View>
      <View className="gap-1.5">
        <Text className="text-xs">{t('Dặn dò phụ huynh')}</Text>
        <Input
          value={value.note}
          onChangeText={(note) => onChange({ note })}
          editable={canWrite}
          maxLength={500}
          accessibilityLabel={t('Dặn dò phụ huynh')}
          className="text-sm"
        />
      </View>
      <Button
        size="sm"
        disabled={
          !canWrite || !row.changed || !selected || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
        }
        onPress={onPickup}>
        <Text>
          {student.isDismissed ? t('Cập nhật ghi nhận đón trẻ') : t('Xác nhận đã đón trẻ')}
        </Text>
      </Button>
      {student.isDismissed && student.isPresent ? (
        <Button
          size="sm"
          variant="outline"
          disabled={!canWrite}
          accessibilityLabel={t('Hủy ghi nhận đón trẻ của {name}', {
            name: student.name || student.code,
          })}
          onPress={onUndoPickup}>
          <Icon as={RotateCcw} size={14} className="text-destructive" />
          <Text className="text-destructive">{t('Hủy ghi nhận đón trẻ')}</Text>
        </Button>
      ) : null}
      {row.changed ? (
        <Text className="text-xs text-muted-foreground">
          {t('Thay đổi chưa lưu. Trạng thái Đã đón chỉ cập nhật sau khi máy chủ xác nhận.')}
        </Text>
      ) : null}
      {editable ? (
        <Button size="sm" variant="outline" onPress={onCreateAuthorization}>
          <Text>{t('Tạo ủy quyền cho học sinh này')}</Text>
        </Button>
      ) : null}
    </Card>
  );
}
