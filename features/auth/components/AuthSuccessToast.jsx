import { CircleCheck } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { PanResponder, View } from 'react-native';
import { FadeInDown, FadeOutUp, ReduceMotion } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

const toastEnter = FadeInDown.duration(200).reduceMotion(ReduceMotion.System);
const toastExit = FadeOutUp.duration(160).reduceMotion(ReduceMotion.System);

export function AuthSuccessToast({ title, description, typography, onDismiss }) {
  const t = useTranslation();
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) => dy < -8 && -dy > Math.abs(dx),
        onPanResponderRelease: (_, { dy, vy }) => {
          if (dy < -28 || (dy < -12 && vy < -0.65)) onDismiss();
        },
      }),
    [onDismiss]
  );

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <NativeOnlyAnimatedView
      {...swipe.panHandlers}
      entering={toastEnter}
      exiting={toastExit}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityActions={[{ name: 'dismiss', label: t('Tắt thông báo') }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'dismiss') onDismiss();
      }}
      onAccessibilityEscape={onDismiss}
      className="w-full max-w-md flex-row items-center gap-3 rounded-2xl border border-primary bg-primary p-3.5 shadow-lg shadow-black/20">
      <View className="size-7 items-center justify-center rounded-full bg-brand">
        <Icon as={CircleCheck} size={16} className="text-brand-foreground" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs leading-4 text-primary-foreground" style={typography.semiBold}>
          {title}
        </Text>
        <Text
          className="text-[11px] leading-4 text-primary-foreground/85"
          style={typography.regular}>
          {description}
        </Text>
      </View>
    </NativeOnlyAnimatedView>
  );
}
