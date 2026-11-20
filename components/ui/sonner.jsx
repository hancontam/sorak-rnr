import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import { useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toaster as SonnerToaster } from 'sonner-native';

import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';

// Snackbar dùng chung toàn app (màn hình gọi toast.success/error từ 'sonner-native'): nằm ở dưới,
// nổi trên thanh tab, nền đặc theo design system (xanh primary cho thành công/thông tin, navy cho
// thông thường/cảnh báo, đỏ destructive chỉ cho lỗi; không xanh lá/vàng), chữ trắng, có nút X để
// tắt ngoài thao tác vuốt sang trái.
// Màu lấy từ token sáng cho cả hai chế độ để nền luôn đậm; Toaster dùng theme tối để nút X sáng màu.
const COLORS = THEME.light;
const ON_COLOR = '#ffffff';
const ICON_SIZE = 18;
// Màn có thanh tab: snackbar nằm ngay trên thanh tab (cao 56 + vùng an toàn + hở 8). Màn không có
// thanh tab: đặt thấp sát đáy (vùng an toàn + 12).
const TAB_BAR_HEIGHT = 56;
const GAP = 8;
const BOTTOM_GAP = 12;

function Toaster(props) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const hasTabBar = segments.includes('(tabs)');
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-center"
      offset={hasTabBar ? TAB_BAR_HEIGHT + insets.bottom + GAP : insets.bottom + BOTTOM_GAP}
      duration={3200}
      visibleToasts={3}
      swipeToDismissDirection="left"
      closeButton
      maxFontSizeMultiplier={1.4}
      icons={{
        success: <CircleCheck size={ICON_SIZE} color={ON_COLOR} />,
        error: <CircleAlert size={ICON_SIZE} color={ON_COLOR} />,
        warning: <TriangleAlert size={ICON_SIZE} color={ON_COLOR} />,
        info: <Info size={ICON_SIZE} color={ON_COLOR} />,
      }}
      toastOptions={{
        style: {
          borderRadius: 0,
          borderWidth: 0,
          backgroundColor: COLORS.foreground,
        },
        success: { backgroundColor: COLORS.primary },
        error: { backgroundColor: COLORS.destructive },
        warning: { backgroundColor: COLORS.foreground },
        info: { backgroundColor: COLORS.primary },
        titleStyle: {
          fontFamily: FONT_FAMILY.sans.semibold,
          fontSize: 13,
          color: ON_COLOR,
        },
        descriptionStyle: {
          fontFamily: FONT_FAMILY.sans.regular,
          fontSize: 12,
          lineHeight: 17,
          color: 'rgba(255,255,255,0.85)',
        },
        actionButtonStyle: { borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.18)' },
        actionButtonTextStyle: {
          fontFamily: FONT_FAMILY.sans.semibold,
          fontSize: 12,
          color: ON_COLOR,
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
