import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BottomSheet, BottomSheetInput } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { statusBadgeVariant } from '@/lib/status-badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { REQUEST_STATUS, requestPeriod } from '../utils/pickup-request';

// Ô trống ghi "Không có" chữ nghiêng màu xám thay cho dấu gạch.
function Field({ label, value, mono }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-start gap-2">
      <Text className="w-28 text-2xs leading-5 text-muted-foreground">{label}</Text>
      <Text
        className={cn(
          'min-w-0 flex-1 text-xs leading-5',
          mono && value && 'font-mono',
          !value && 'italic text-muted-foreground'
        )}>
        {value || t('Không có')}
      </Text>
    </View>
  );
}

// Chi tiết một đơn ủy quyền khi bấm dòng trong bảng. Sheet là bước xác nhận: giáo viên duyệt hoặc
// nhập lý do rồi từ chối, phụ huynh hủy đơn đang chờ; không mở thêm hộp thoại hỏi lại.
export function PickupRequestSheet({
  request,
  isParent,
  disabled,
  saving,
  error,
  onAction,
  onClose,
}) {
  const t = useTranslation();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [shown, setShown] = useState(request);
  // Giữ đơn cuối cùng để nội dung không biến mất khi sheet đang trượt xuống.
  if (request && request !== shown) setShown(request);
  if (!request && (rejecting || reason)) {
    setRejecting(false);
    setReason('');
  }
  const item = request || shown;
  const pending = item?.status === 'PENDING';
  const person = item?.pickupPersonName || t('Người đón trẻ');

  return (
    <BottomSheet
      open={Boolean(request)}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
      title={t('Đơn ủy quyền')}
      closeLabel={t('Đóng')}>
      {item ? (
        <>
          <View className="flex-row items-center gap-2.5">
            {!isParent && item.student?.name ? (
              <>
                <AccountAvatar user={item.student} className="size-10" />
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="text-sm font-semibold">
                    {item.student.name}
                  </Text>
                  {item.student.code ? (
                    <Text className="font-mono text-2xs text-muted-foreground">
                      {item.student.code}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <View className="min-w-0 flex-1" />
            )}
            <Badge variant={statusBadgeVariant('authorization', item.status)}>
              <Text>{t(REQUEST_STATUS[item.status] || 'Chưa rõ trạng thái')}</Text>
            </Badge>
          </View>
          <View className="flex-row items-center gap-2.5 border border-border p-3">
            <AccountAvatar
              user={{ fullName: person, avatarUrl: item.photoUrl }}
              className="size-12"
            />
            <View className="min-w-0 flex-1">
              <Text className="text-2xs text-muted-foreground">{t('Người được ủy quyền')}</Text>
              <Text numberOfLines={1} className="text-sm font-semibold">
                {person}
              </Text>
              {item.relationship ? (
                <Text numberOfLines={1} className="text-2xs text-muted-foreground">
                  {item.relationship}
                </Text>
              ) : null}
            </View>
          </View>
          <View className="gap-2">
            <Field label={t('Số điện thoại')} value={item.pickupPersonPhone} mono />
            <Field label={t('Thời gian hiệu lực')} value={requestPeriod(item)} mono />
            <Field label={t(isParent ? 'Ghi chú' : 'Dặn dò phụ huynh')} value={item.note} />
            {item.status === 'REJECTED' ? (
              <Field label={t('Lý do từ chối')} value={item.rejectedReason} />
            ) : null}
          </View>
          {error ? (
            // Lý do máy chủ từ chối thao tác (ví dụ quy tắc ngày của đơn) hiện ngay trong sheet.
            <Alert variant="destructive" icon={CircleAlert}>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : null}
          {pending && isParent ? (
            <Button
              variant="destructive-soft"
              disabled={disabled}
              onPress={() => onAction('cancel')}>
              <Text>{t(saving ? 'Đang lưu…' : 'Hủy đơn')}</Text>
            </Button>
          ) : null}
          {pending && !isParent && rejecting ? (
            <View className="gap-2">
              <BottomSheetInput
                value={reason}
                onChangeText={setReason}
                editable={!disabled}
                autoFocus
                placeholder={t('Nhập lý do từ chối')}
                accessibilityLabel={t('Lý do từ chối')}
                maxLength={500}
              />
              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={disabled}
                  onPress={() => {
                    setRejecting(false);
                    setReason('');
                  }}>
                  <Text>{t('Hủy')}</Text>
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={disabled || !reason.trim()}
                  onPress={() => onAction('reject', { reason: reason.trim() })}>
                  <Text>{t(saving ? 'Đang lưu…' : 'Từ chối')}</Text>
                </Button>
              </View>
            </View>
          ) : null}
          {pending && !isParent && !rejecting ? (
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={disabled}
                onPress={() => setRejecting(true)}>
                <Text>{t('Từ chối')}</Text>
              </Button>
              <Button className="flex-1" disabled={disabled} onPress={() => onAction('approve')}>
                <Text>{t(saving ? 'Đang lưu…' : 'Duyệt')}</Text>
              </Button>
            </View>
          ) : null}
        </>
      ) : null}
    </BottomSheet>
  );
}
