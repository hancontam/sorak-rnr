import { useEffect, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Camera, ImagePlus } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { calendarDate, schoolToday } from '@/features/daily/utils/schedule-date';
import { useTranslation } from '@/shared/i18n/useLanguage';

const FIELDS = [
  { name: 'pickup_person_name', label: 'Họ tên người đón', maxLength: 120 },
  { name: 'pickup_person_phone', label: 'Số điện thoại', keyboardType: 'phone-pad', maxLength: 20 },
  { name: 'relationship', label: 'Quan hệ với trẻ', maxLength: 80 },
  {
    name: 'pickup_citizen_id',
    label: 'CCCD (không bắt buộc)',
    keyboardType: 'number-pad',
    maxLength: 20,
  },
  { name: 'start_date', label: 'Ngày bắt đầu (YYYY-MM-DD)', maxLength: 10 },
  { name: 'end_date', label: 'Ngày kết thúc (YYYY-MM-DD)', maxLength: 10 },
  { name: 'note', label: 'Ghi chú đón trẻ (không bắt buộc)', maxLength: 500 },
];

export function PickupRequestForm({
  student,
  students = [],
  isParent,
  selectedStudentId = '',
  date,
  photo,
  disabled,
  closingDisabled,
  onSend,
  onClose,
  onDirtyChange,
}) {
  const t = useTranslation();
  const initialDate = calendarDate(date) ? date : schoolToday();
  const [studentId, setStudentId] = useState(selectedStudentId);
  const [values, setValues] = useState(() => ({
    start_date: initialDate,
    end_date: initialDate,
  }));
  const [error, setError] = useState('');
  const selected = students.find((item) => String(item.id) === studentId);
  const dirty =
    studentId !== selectedStudentId ||
    FIELDS.some(
      ({ name }) =>
        (values[name] || '') !== (name === 'start_date' || name === 'end_date' ? initialDate : '')
    ) ||
    Boolean(photo?.asset);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function send() {
    const body = Object.fromEntries(FIELDS.map(({ name }) => [name, (values[name] || '').trim()]));
    if (!isParent && !selected) {
      setError('Chọn học sinh được ủy quyền.');
      return;
    }
    if (photo && !photo.ready) {
      setError('Tải ảnh thành công hoặc bỏ ảnh trước khi gửi.');
      return;
    }
    if (
      !body.pickup_person_name ||
      !body.relationship ||
      !/^\+?\d{8,15}$/.test(body.pickup_person_phone.replace(/[ .-]/g, ''))
    ) {
      setError('Nhập tên, quan hệ và số điện thoại hợp lệ của người đón.');
      return;
    }
    if (
      !calendarDate(body.start_date) ||
      !calendarDate(body.end_date) ||
      (isParent && body.start_date < schoolToday()) ||
      body.end_date < body.start_date
    ) {
      setError(
        isParent
          ? 'Chọn ngày bắt đầu từ hôm nay và ngày kết thúc không sớm hơn ngày bắt đầu.'
          : 'Nhập ngày hợp lệ; ngày kết thúc không sớm hơn ngày bắt đầu.'
      );
      return;
    }
    setError('');
    body.pickup_person_phone = body.pickup_person_phone.replace(/[ .-]/g, '');
    onSend(isParent ? body : { ...body, studentId, photoUrl: photo?.url || null });
  }

  return (
    <Card className="gap-3 p-4 shadow-none">
      <Text className="text-sm font-semibold">{t('Tạo đơn ủy quyền đón trẻ')}</Text>
      {student?.fullName ? (
        <Text className="text-xs">{t('Học sinh {name}', { name: student.fullName })}</Text>
      ) : null}
      {!isParent ? (
        <View className="gap-1.5">
          <Text className="text-xs">{t('Học sinh được ủy quyền')}</Text>
          <Select
            disabled={disabled}
            value={
              selected
                ? { value: studentId, label: `${selected.name} · ${selected.code}` }
                : undefined
            }
            onValueChange={(option) => {
              setStudentId(option?.value || '');
              setError('');
            }}>
            <SelectTrigger size="sm" accessibilityLabel={t('Chọn học sinh')}>
              <SelectValue placeholder={t('Chọn học sinh')} />
            </SelectTrigger>
            <SelectContent>
              <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
                {students.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.id)}
                    label={`${item.name} · ${item.code}`}
                  />
                ))}
              </ScrollView>
            </SelectContent>
          </Select>
          <Text className="text-xs text-muted-foreground">
            {t('Đơn do giáo viên tạo được duyệt ngay. Người đón xuất hiện theo thời hạn hiệu lực.')}
          </Text>
        </View>
      ) : null}
      {FIELDS.map(({ name, label, ...props }) => (
        <View key={name} className="gap-1">
          <Text className="text-xs">{t(label)}</Text>
          <Input
            {...props}
            value={values[name] || ''}
            editable={!disabled}
            accessibilityLabel={t(label)}
            className="text-sm"
            onChangeText={(value) => setValues((current) => ({ ...current, [name]: value }))}
          />
        </View>
      ))}
      {photo ? (
        <View className="gap-2">
          <Text className="text-xs">{t('Ảnh người được ủy quyền (không bắt buộc)')}</Text>
          {photo.asset ? (
            <Image
              source={{ uri: photo.asset.uri }}
              accessibilityLabel={t('Ảnh người được ủy quyền')}
              style={{ width: 80, height: 80, borderRadius: 8 }}
            />
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onPress={() => photo.choose(true)}>
              <Icon as={Camera} size={14} />
              <Text>{t('Chụp ảnh')}</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onPress={() => photo.choose(false)}>
              <Icon as={ImagePlus} size={14} />
              <Text>{t('Chọn ảnh')}</Text>
            </Button>
            {photo.asset ? (
              <Button size="sm" variant="ghost" disabled={disabled} onPress={photo.remove}>
                <Text>{t('Bỏ ảnh')}</Text>
              </Button>
            ) : null}
          </View>
          {photo.busy ? (
            <Text className="text-xs text-muted-foreground">{t('Đang chuẩn bị ảnh…')}</Text>
          ) : null}
          {photo.error ? (
            <>
              <Text className="text-xs text-destructive">{t(photo.error)}</Text>
              {photo.asset && !photo.url ? (
                <Button size="sm" variant="outline" disabled={disabled} onPress={photo.retry}>
                  <Text>{t('Tải ảnh lại')}</Text>
                </Button>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
      {error ? <Text className="text-xs text-destructive">{t(error)}</Text> : null}
      <Button size="sm" disabled={disabled || (photo && !photo.ready)} onPress={send}>
        <Text>{isParent ? t('Gửi đơn chờ duyệt') : t('Tạo ủy quyền đã duyệt')}</Text>
      </Button>
      <Button size="sm" disabled={closingDisabled} variant="outline" onPress={onClose}>
        <Text>{t('Đóng form')}</Text>
      </Button>
    </Card>
  );
}
