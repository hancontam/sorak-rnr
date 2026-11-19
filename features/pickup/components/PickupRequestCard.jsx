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
  // Đơn một ngày chỉ hiện một ngày; khoảng ngày giữ đủ hai đầu.
  const period =
    request.startDate && request.startDate === request.endDate
      ? request.startDate
      : [request.startDate, request.endDate].filter(Boolean).join(' – ');

  return (
    <Card className="gap-2 px-3 py-2.5">
      <View className="flex-row items-center gap-2.5">
        <AccountAvatar
          user={{ fullName: person, avatarUrl: request.photoUrl }}
          className="size-9"
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
      {/* Học sinh và thời gian gộp một dòng để danh sách hiện được nhiều đơn. */}
      <View className="flex-row items-center gap-2 pl-[46px]">
        {!isParent && request.student?.name ? (
          <>
            <AccountAvatar user={request.student} className="size-5" />
            <Text numberOfLines={1} className="min-w-0 shrink text-xs">
              {request.student.name}
            </Text>
          </>
        ) : null}
        {period ? (
          <View className="ml-auto flex-row items-center gap-1">
            <Icon as={CalendarDays} size={12} className="text-muted-foreground" />
            <Text className="font-mono text-2xs text-muted-foreground">{period}</Text>
          </View>
        ) : null}
      </View>
      {request.note ? (
        <Text numberOfLines={2} className="pl-[46px] text-2xs leading-4 text-muted-foreground">
          {request.note}
        </Text>
      ) : null}
      {request.rejectedReason ? (
        <Text numberOfLines={2} className="bg-destructive/5 px-2 py-1 text-2xs text-destructive">
          {request.rejectedReason}
        </Text>
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
