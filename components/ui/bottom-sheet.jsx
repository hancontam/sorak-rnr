import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Check, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';

const CONTENT_STYLE = { gap: 16, paddingHorizontal: 20, paddingTop: 4 };

// Sheet trượt từ dưới như bản showcase: bo 28, thanh kéo, nền mờ, đóng bằng vuốt/chạm nền/nút X.
function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
  className,
  // Tắt kéo sheet bằng nội dung khi bên trong có vùng cuộn riêng (wheel picker, lịch).
  enableContentPanningGesture = true,
  // Danh sách dài: dùng ScrollView của sheet làm khung để Gorhom đo được chiều cao và cuộn được.
  scrollable = false,
}) {
  const ref = useRef(null);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  // Chỉ dismiss khi đã present: gọi dismiss() lúc mount làm Gorhom kẹt ở trạng thái DISMISSING
  // và bỏ qua mọi lần present() sau đó.
  const presented = useRef(false);
  useEffect(() => {
    if (open) {
      presented.current = true;
      ref.current?.present();
    } else if (presented.current) {
      presented.current = false;
      ref.current?.dismiss();
    }
  }, [open]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const Container = scrollable ? BottomSheetScrollView : BottomSheetView;
  const bottomPadding = Math.max(insets.bottom, 16) + 16;

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      maxDynamicContentSize={Math.round(height * 0.85)}
      onDismiss={() => {
        presented.current = false;
        onOpenChange?.(false);
      }}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: theme.popover,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{ width: 40, height: 6, backgroundColor: theme.border }}
      enableContentPanningGesture={enableContentPanningGesture}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore">
      <Container
        {...(scrollable
          ? {
              keyboardShouldPersistTaps: 'handled',
              contentContainerStyle: { ...CONTENT_STYLE, paddingBottom: bottomPadding },
            }
          : {
              className: cn('gap-4 px-5 pt-1', className),
              style: { paddingBottom: bottomPadding },
            })}>
        {title ? (
          <View className="flex-row items-start gap-3">
            <View className="min-w-0 flex-1 gap-0.5">
              <Text role="heading" className="text-sm font-semibold">
                {title}
              </Text>
              {description ? (
                <Text className="text-xs text-muted-foreground">{description}</Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              hitSlop={8}
              onPress={() => onOpenChange?.(false)}
              className="size-8 items-center justify-center rounded-full bg-muted active:opacity-70">
              <Icon as={X} size={16} className="text-muted-foreground" />
            </Pressable>
          </View>
        ) : null}
        {children}
      </Container>
    </BottomSheetModal>
  );
}

// Một lựa chọn trong sheet chọn (select trên mobile): dòng bo 12, dấu tích bên phải.
// `leading` (ví dụ avatar) thay cho icon khi lựa chọn có hình đại diện.
function BottomSheetOption({
  label,
  description,
  icon,
  leading,
  selected = false,
  onPress,
  disabled,
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        'min-h-11 flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-muted',
        selected && 'bg-muted/60',
        disabled && 'opacity-50'
      )}>
      {leading ?? (icon ? <Icon as={icon} size={16} className="text-muted-foreground" /> : null)}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-xs font-medium">{label}</Text>
        {description ? <Text className="text-2xs text-muted-foreground">{description}</Text> : null}
      </View>
      {selected ? <Icon as={Check} size={16} /> : null}
    </Pressable>
  );
}

export { BottomSheet, BottomSheetModalProvider, BottomSheetOption, BottomSheetScrollView };
