import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Thanh tiêu đề dùng chung cho các màn Stack (thay header mặc định của React Navigation): nền trùng
// màn, viền mảnh ở dưới thay đổ bóng, nút quay lại dạng chevron, tiêu đề đậm ở giữa và chỗ cho một
// thao tác bên phải. Màn có thể thay nút trái/phải qua options.headerLeft / headerRight.
const SIDE_WIDTH = 64;

// Nút quay lại của header; màn tự đặt headerLeft (vd. đóng form) dùng lại để cùng kiểu.
export function HeaderBackButton({ onPress, label, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      className="size-10 items-center justify-center active:bg-muted disabled:opacity-50">
      <Icon as={ChevronLeft} size={22} />
    </Pressable>
  );
}

export function AppHeader({ navigation, route, options, back }) {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const title = typeof options.title === 'string' ? options.title : route.name;
  const canGoBack = Boolean(back);
  const left = options.headerLeft ? (
    options.headerLeft({ canGoBack })
  ) : canGoBack && options.headerBackVisible !== false ? (
    <HeaderBackButton onPress={navigation.goBack} label={t('Quay lại')} />
  ) : null;
  const right = options.headerRight ? options.headerRight({ canGoBack }) : null;

  return (
    <View className="border-b border-border bg-background" style={{ paddingTop: insets.top }}>
      <View className="h-[52px] flex-row items-center px-2">
        <View style={{ width: SIDE_WIDTH }} className="items-start">
          {left}
        </View>
        <Text
          role="heading"
          numberOfLines={1}
          className="min-w-0 flex-1 text-center text-base font-semibold tracking-tight">
          {title}
        </Text>
        <View style={{ width: SIDE_WIDTH }} className="items-end">
          {right}
        </View>
      </View>
    </View>
  );
}

// Dùng trong screenOptions của các Stack: { ...APP_HEADER }.
export const APP_HEADER = {
  header: (props) => <AppHeader {...props} />,
};
