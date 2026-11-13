import { CalendarDays } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

const STATUS = {
  PENDING: ['Chờ duyệt', 'default'],
  APPROVED: ['Đã duyệt', 'secondary'],
  REJECTED: ['Đã từ chối', 'outline'],
  CANCELLED: ['Đã hủy', 'outline'],
};

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
  const contact = [request.relationship, request.pickupPersonPhone].filter(Boolean).join(' · ');
  const period = [request.startDate, request.endDate].filter(Boolean).join(' – ');

  return (
    <Card className="gap-3 px-4 py-3.5">
      <View className="flex-row items-center gap-3">
        <AccountAvatar
          user={{ fullName: person, avatarUrl: request.photoUrl }}
          className="size-10"
        />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text numberOfLines={1} className="text-sm font-semibold">
            {person}
          </Text>
          {contact ? (
            <Text numberOfLines={1} className="text-2xs text-muted-foreground">
              {contact}
            </Text>
          ) : null}
        </View>
        <Badge variant={variant}>
          <Text>{t(label)}</Text>
        </Badge>
      </View>
      {!isParent && request.student?.name ? (
        <View className="flex-row items-center gap-2">
          <AccountAvatar user={request.student} className="size-6" />
          <Text numberOfLines={1} className="min-w-0 flex-1 text-xs">
            {t('Học sinh {name}', { name: request.student.name })}
          </Text>
          {request.student.code ? (
            <Text className="font-mono text-2xs text-muted-foreground">{request.student.code}</Text>
          ) : null}
        </View>
      ) : null}
      {period ? (
        <View className="flex-row items-center gap-2">
          <Icon as={CalendarDays} size={14} className="text-muted-foreground" />
          <Text className="font-mono text-xs">{period}</Text>
        </View>
      ) : null}
      {request.note ? (
        <Text className="text-xs leading-5 text-muted-foreground">{request.note}</Text>
      ) : null}
      {request.rejectedReason ? (
        <View className="rounded-xl bg-destructive/5 px-3 py-2">
          <Text className="text-xs text-destructive">{request.rejectedReason}</Text>
        </View>
      ) : null}
      {pending && isParent ? (
        <Button
          size="sm"
          variant="destructive-soft"
          disabled={disabled}
          onPress={() => onAction('cancel')}>
          <Text>{t('Hủy đơn')}</Text>
        </Button>
      ) : null}
      {pending && !isParent ? (
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
    </Card>
  );
}
