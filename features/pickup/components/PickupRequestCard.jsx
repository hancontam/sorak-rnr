import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

const LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
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
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (rejecting) onDirtyChange(Boolean(reason.trim()));
    else setReason('');
  }, [rejecting, reason, onDirtyChange]);
  const pending = request.status === 'PENDING';
  return (
    <Card className="gap-2 p-4 shadow-none">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-sm font-semibold">{request.pickupPersonName || 'Người đón trẻ'}</Text>
        <Badge variant="secondary">
          <Text>{LABELS[request.status] || 'Chưa rõ trạng thái'}</Text>
        </Badge>
      </View>
      {request.student?.name ? (
        <Text className="text-sm">Học sinh {request.student.name}</Text>
      ) : null}
      <Text className="text-xs text-muted-foreground">
        {[request.relationship, request.pickupPersonPhone].filter(Boolean).join(' · ')}
      </Text>
      <Text className="text-xs">
        {[request.startDate, request.endDate].filter(Boolean).join(' – ')}
      </Text>
      {request.note ? <Text className="text-xs">{request.note}</Text> : null}
      {request.rejectedReason ? (
        <Text className="text-xs text-destructive">{request.rejectedReason}</Text>
      ) : null}
      {pending && isParent ? (
        <Button size="sm" variant="outline" disabled={disabled} onPress={() => onAction('cancel')}>
          <Text>Hủy đơn</Text>
        </Button>
      ) : null}
      {pending && !isParent ? (
        rejecting ? (
          <View className="gap-2">
            <Input
              value={reason}
              onChangeText={setReason}
              editable={!disabled}
              placeholder="Nhập lý do từ chối"
              accessibilityLabel="Lý do từ chối"
              maxLength={500}
              className="text-sm"
            />
            <Button
              size="sm"
              variant="destructive"
              disabled={disabled || !reason.trim()}
              onPress={() => onAction('reject', { reason: reason.trim() })}>
              <Text>Xác nhận từ chối</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onPress={() => onRejecting(false)}>
              <Text>Quay lại</Text>
            </Button>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            <Button size="sm" disabled={disabled} onPress={() => onAction('approve')}>
              <Text>Duyệt</Text>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled}
              onPress={() => onRejecting(true)}>
              <Text>Từ chối</Text>
            </Button>
          </View>
        )
      ) : null}
    </Card>
  );
}
