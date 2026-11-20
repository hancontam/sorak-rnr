import { Image, Linking, Pressable, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Ảnh đính kèm theo cách web đọc: data.attachments, attachments, data.imageUrl hoặc data.image.
function attachmentsOf(item) {
  const data = item?.data || {};
  const raw = data.attachments || item?.attachments || data.imageUrl || data.image || [];
  return (Array.isArray(raw) ? raw : [raw]).filter(
    (url) => typeof url === 'string' && /^https?:\/\//i.test(url)
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <View className="flex-row gap-2">
      <Text className="w-20 text-xs text-muted-foreground">{label}</Text>
      <Text className="min-w-0 flex-1 text-xs font-medium">{value}</Text>
    </View>
  );
}

// Chi tiết một thông báo như modal của web: tiêu đề, thời gian, toàn bộ nội dung, ảnh đính kèm và
// học sinh/lớp/người gửi khi backend có. Nội dung do nhà trường gửi giữ nguyên, không dịch.
export function NotificationDetailSheet({ item, onClose }) {
  const t = useTranslation();
  const data = item?.data || {};
  const attachments = attachmentsOf(item);
  return (
    <BottomSheet
      open={Boolean(item)}
      onOpenChange={(next) => (!next ? onClose() : undefined)}
      title={item?.title || t('Thông báo')}
      description={item?.createdAt}
      closeLabel={t('Đóng')}
      scrollable>
      {item ? (
        <>
          <View className="border border-border bg-muted/40 p-3">
            <Text selectable className="text-sm leading-6">
              {item.body || t('Không có nội dung chi tiết.')}
            </Text>
          </View>
          {attachments.length ? (
            <View className="gap-2">
              <Text className="text-xs font-medium text-muted-foreground">
                {t('Hình ảnh đính kèm ({count})', { count: attachments.length })}
              </Text>
              {attachments.map((url, index) => (
                <Pressable
                  key={url}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={t('Ảnh đính kèm {index}', { index: index + 1 })}
                  onPress={() => Linking.openURL(url).catch(() => undefined)}
                  className="border border-border bg-muted active:opacity-80">
                  <Image source={{ uri: url }} style={{ aspectRatio: 16 / 9 }} resizeMode="cover" />
                </Pressable>
              ))}
            </View>
          ) : null}
          {data.studentName || data.className || data.senderName ? (
            <View className="gap-1.5 border-t border-border pt-3">
              <Meta label={t('Học sinh')} value={data.studentName} />
              <Meta label={t('Lớp')} value={data.className} />
              <Meta label={t('Người gửi')} value={data.senderName} />
            </View>
          ) : null}
        </>
      ) : null}
    </BottomSheet>
  );
}
