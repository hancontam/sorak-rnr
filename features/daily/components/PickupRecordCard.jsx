import { Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { SelectField } from '@/components/shared/SelectField';
import { TimeField } from '@/components/shared/TimeField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { isAbsent, pickupOptions } from '../utils/daily-records';
import { schoolClock } from '../utils/schedule-date';
import { StudentHeader } from './StudentHeader';

export function PickupRecordCard({ row, editable, onChange, onPickup, onCreateAuthorization }) {
  const t = useTranslation();
  const { student, value } = row;
  const people = pickupOptions(student);
  const selected = people.find((person) => person.key === value.personKey);
  const canWrite = editable && student.isPresent;
  const [status, variant] = student.isDismissed
    ? ['Đã đón', 'default']
    : student.isPresent
      ? ['Chưa đón', 'secondary']
      : isAbsent(student)
        ? ['Vắng', 'outline']
        : ['Chưa điểm danh', 'outline'];
  const personLabel = (person) => [person.name, person.relationship].filter(Boolean).join(' · ');
  const pickedAt = schoolClock(student.checkOutTime);

  return (
    <Card className="gap-3 px-4 py-3.5">
      <StudentHeader
        name={student.name}
        code={student.code}
        avatarUrl={row.avatarUrl}
        right={
          <Badge variant={variant}>
            <Text>{t(status)}</Text>
          </Badge>
        }
      />
      {student.isDismissed ? (
        <View className="flex-row items-center gap-2 rounded-xl bg-muted px-3 py-2">
          {pickedAt ? <Text className="font-mono text-xs font-semibold">{pickedAt}</Text> : null}
          <Text numberOfLines={2} className="min-w-0 flex-1 text-xs text-muted-foreground">
            {[student.pickupPersonName, student.pickupRelationship].filter(Boolean).join(' · ')}
          </Text>
        </View>
      ) : null}
      {!student.isPresent ? (
        <Text className="text-xs text-muted-foreground">
          {isAbsent(student)
            ? t('Học sinh vắng trong ngày này, không ghi nhận đón trẻ.')
            : t('Chưa có điểm danh Có mặt. Hoàn tất điểm danh rồi quay lại ghi nhận đón trẻ.')}
        </Text>
      ) : null}
      {student.isPresent ? (
        <>
          <View className="gap-1.5">
            <SelectField
              label={t('Người đón')}
              placeholder={t('Chọn người thân hoặc người được ủy quyền')}
              disabled={!canWrite || !people.length}
              value={selected?.key}
              options={people.map((person) => ({
                value: person.key,
                label: personLabel(person),
                description: person.phone,
                // Phụ huynh có avatarUrl (dicebear); người được ủy quyền có ảnh chụp lúc tạo đơn.
                leading: (
                  <AccountAvatar
                    user={{ fullName: person.name, avatarUrl: person.avatarUrl || person.photoUrl }}
                    className="size-8"
                  />
                ),
              }))}
              onChange={(personKey) => onChange({ personKey })}
            />
            {selected?.phone ? (
              <Text className="font-mono text-2xs text-muted-foreground">{selected.phone}</Text>
            ) : null}
            {!people.length ? (
              <Text className="text-xs text-muted-foreground">
                {t('Chưa có người đón hợp lệ cho ngày này.')}
              </Text>
            ) : null}
          </View>
          <TimeField
            label={t('Giờ đón')}
            value={value.time}
            disabled={!canWrite}
            now={() => schoolClock(new Date())}
            onChange={(time) => onChange({ time })}
          />
          <View className="gap-1.5">
            <Text className="text-2xs font-medium text-muted-foreground">
              {t('Dặn dò phụ huynh')}
            </Text>
            <Input
              value={value.note}
              onChangeText={(note) => onChange({ note })}
              editable={canWrite}
              maxLength={500}
              accessibilityLabel={t('Dặn dò phụ huynh')}
            />
          </View>
          {row.changed ? (
            <Text className="text-2xs text-muted-foreground">
              {t('Thay đổi chưa lưu. Trạng thái Đã đón chỉ cập nhật sau khi máy chủ xác nhận.')}
            </Text>
          ) : null}
          <Button
            disabled={
              !canWrite ||
              !row.changed ||
              !selected ||
              !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
            }
            onPress={onPickup}>
            <Text>
              {student.isDismissed ? t('Cập nhật ghi nhận đón trẻ') : t('Xác nhận đã đón trẻ')}
            </Text>
          </Button>
        </>
      ) : null}
      {/* Lối tắt tạo ủy quyền cho bé chưa được đón; đã đón thì không cần. */}
      {editable && !student.isDismissed ? (
        <Button size="sm" variant="outline" onPress={onCreateAuthorization}>
          <Icon as={Plus} size={14} />
          <Text>{t('Tạo ủy quyền')}</Text>
        </Button>
      ) : null}
    </Card>
  );
}
