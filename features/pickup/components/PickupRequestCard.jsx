import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

const STATUS = {
  PENDING: ['Chờ duyệt', 'default'],
  APPROVED: ['Đã duyệt', 'secondary'],
  REJECTED: ['Đã từ chối', 'outline'],
  CANCELLED: ['Đã hủy', 'outline'],
};

function Field({ label, value, mono, danger }) {
  return (
    <View className="flex-row items-start gap-2">
      <Text className="w-28 text-2xs leading-5 text-muted-foreground">{label}</Text>
      <Text
        className={cn(
          'min-w-0 flex-1 text-xs leading-5',
          mono && 'font-mono',
          danger && 'text-destructive',
          !value && 'text-muted-foreground'
        )}>
        {value || '—'}
      </Text>
    </View>
  );
}

export function PickupRequestCard({
  request,
  isParent,
  disabled,
  onAction,
  rejecting,
  onRejecting,
  onDirtyChange,
}) {
  const t = useTranslation();
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (rejecting) onDirtyChange(Boolean(reason.trim()));
    else setReason('');
  }, [rejecting, reason, onDirtyChange]);
  const pending = request.status === 'PENDING';
  const [label, variant] = STATUS[request.status] || ['Chưa rõ trạng thái', 'outline'];
  const person = request.pickupPersonName || t('Người đón trẻ');
  const dmy = (value) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value || '') ? value.split('-').reverse().join('/') : value;
  // Đơn một ngày chỉ hiện một ngày; khoảng ngày giữ đủ hai đầu.
  const period =
    request.startDate && request.startDate === request.endDate
      ? dmy(request.startDate)
      : [request.startDate, request.endDate].filter(Boolean).map(dmy).join(' – ');
  const student = request.student;

  // Thẻ đọc như một dòng của bảng đơn ủy quyền trên web: học sinh, người được ủy quyền, số điện thoại,
  // thời gian hiệu lực, dặn dò và trạng thái. Phụ huynh xem đơn của con nên không lặp tên bé.
  return (
    <Card className="gap-0 px-0 py-0">
      <View className="flex-row items-center gap-2.5 px-3 py-2.5">
        {!isParent && student?.name ? (
          <>
            <AccountAvatar user={student} className="size-9" />
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="text-sm font-semibold">
                {student.name}
              </Text>
              {student.code ? (
                <Text className="font-mono text-2xs text-muted-foreground">{student.code}</Text>
              ) : null}
            </View>
          </>
        ) : (
          <Text className="min-w-0 flex-1 text-sm font-semibold">{t('Đơn ủy quyền đón trẻ')}</Text>
        )}
        <Badge variant={variant}>
          <Text>{t(label)}</Text>
        </Badge>
      </View>
      <View className="gap-2 border-t border-border px-3 py-2.5">
        <View className="flex-row items-center gap-2">
          <Text className="w-28 text-2xs text-muted-foreground">{t('Người được ủy quyền')}</Text>
          <AccountAvatar
            user={{ fullName: person, avatarUrl: request.photoUrl }}
            className="size-6"
          />
          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className="text-xs font-medium">
              {person}
            </Text>
            {request.relationship ? (
              <Text numberOfLines={1} className="text-2xs text-muted-foreground">
                {request.relationship}
              </Text>
            ) : null}
          </View>
        </View>
        <Field label={t('Số điện thoại')} value={request.pickupPersonPhone} mono />
        <Field label={t('Thời gian hiệu lực')} value={period} mono />
        <Field label={t('Dặn dò phụ huynh')} value={request.note} />
        {request.rejectedReason ? (
          <Field label={t('Lý do từ chối')} value={request.rejectedReason} danger />
        ) : null}
      </View>
      {pending ? (
        <View className="border-t border-border px-3 py-2.5">
          {isParent ? (
            <Button
              size="sm"
              variant="destructive-soft"
              disabled={disabled}
              onPress={() => onAction('cancel')}>
              <Text>{t('Hủy đơn')}</Text>
            </Button>
          ) : null}
          {!isParent ? (
            rejecting ? (
              <View className="gap-2">
                <Input
                  value={reason}
                  onChangeText={setReason}
                  editable={!disabled}
                  placeholder={t('Nhập lý do từ chối')}
                  accessibilityLabel={t('Lý do từ chối')}
                  maxLength={500}
                />
                <View className="flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={disabled}
                    onPress={() => onRejecting(false)}>
                    <Text>{t('Quay lại')}</Text>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    disabled={disabled || !reason.trim()}
                    onPress={() => onAction('reject', { reason: reason.trim() })}>
                    <Text>{t('Xác nhận từ chối')}</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={disabled}
                  onPress={() => onRejecting(true)}>
                  <Text>{t('Từ chối')}</Text>
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={disabled}
                  onPress={() => onAction('approve')}>
                  <Text>{t('Duyệt')}</Text>
                </Button>
              </View>
            )
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
