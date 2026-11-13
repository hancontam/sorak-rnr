import { BellRing } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Giới thiệu trước khi gọi hộp thoại quyền của hệ thống, vì hộp thoại đó chỉ hiện một lần.
export function PushPermissionSheet({ open, busy, onEnable, onLater }) {
  const t = useTranslation();
  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next && open) onLater();
      }}>
      <View className="items-center gap-3 pt-2">
        <View className="size-12 items-center justify-center rounded-2xl bg-muted">
          <Icon as={BellRing} size={22} />
        </View>
        <View className="items-center gap-1">
          <Text role="heading" className="text-base font-semibold">
            {t('Bật thông báo từ nhà trường?')}
          </Text>
          <Text className="text-center text-xs leading-5 text-muted-foreground">
            {t(
              'Nhận ngay đơn ủy quyền đón trẻ, kết quả học tập và tin của lớp. Bạn có thể đổi lại trong Cài đặt > Thông báo.'
            )}
          </Text>
        </View>
      </View>
      <View className="gap-2">
        <Button size="lg" onPress={onEnable} disabled={busy}>
          {busy ? <ActivityIndicator size="small" /> : <Text>{t('Bật thông báo')}</Text>}
        </Button>
        <Button size="lg" variant="ghost" onPress={onLater} disabled={busy}>
          <Text>{t('Để sau')}</Text>
        </Button>
      </View>
    </BottomSheet>
  );
}
