import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Toaster as SonnerToaster } from 'sonner-native';

import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';

// Toast dùng chung toàn app; màn hình gọi toast.success/error từ 'sonner-native'.
function Toaster(props) {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const theme = THEME[scheme];

  return (
    <SonnerToaster
      theme={scheme}
      position="top-center"
      duration={3200}
      visibleToasts={3}
      swipeToDismissDirection="up"
      maxFontSizeMultiplier={1.4}
      icons={{
        success: <CircleCheck size={18} color={theme.success} />,
        error: <CircleAlert size={18} color={theme.destructive} />,
        warning: <TriangleAlert size={18} color={theme.warning} />,
        info: <Info size={18} color={theme.mutedForeground} />,
      }}
      toastOptions={{
        style: {
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.popover,
        },
        titleStyle: {
          fontFamily: FONT_FAMILY.sans.semibold,
          fontSize: 13,
          color: theme.popoverForeground,
        },
        descriptionStyle: {
          fontFamily: FONT_FAMILY.sans.regular,
          fontSize: 12,
          lineHeight: 17,
          color: theme.mutedForeground,
        },
        actionButtonStyle: { borderRadius: 10, backgroundColor: theme.primary },
        actionButtonTextStyle: {
          fontFamily: FONT_FAMILY.sans.semibold,
          fontSize: 12,
          color: theme.primaryForeground,
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
