import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';

const ICON_SIZE = 20;
const DURATION = 220;
const LABEL_MAX_WIDTH = 160;

// Một tab kiểu "bubble" (tham khảo gorhom/react-native-animated-tabbar): tab đang chọn giãn ra,
// nền xanh nhạt hiện dần và tên trượt ra cạnh icon; tab khác thu về chỉ còn icon. Chỉ animate style
// (độ rộng chữ, độ mờ), không dùng layout animation vì làm lệch vùng chạm trên Android. Các tab
// rộng theo nội dung và chia đều khoảng trống (justify-around) nên bubble không lệch.
function TabItem({ focused, label, renderIcon, theme, onPress, onLongPress }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: reduceMotion ? 0 : DURATION });
  }, [focused, progress, reduceMotion]);

  const bubbleStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    maxWidth: progress.value * LABEL_MAX_WIDTH,
    marginLeft: progress.value * 6,
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={{ left: 12, right: 12 }}
      className="min-h-14 min-w-14 shrink items-center justify-center active:opacity-70">
      <View className="max-w-full flex-row items-center px-3 py-2">
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.secondary }, bubbleStyle]}
        />
        {renderIcon?.({
          focused,
          color: focused ? theme.primary : theme.mutedForeground,
          size: ICON_SIZE,
        })}
        <Animated.Text
          numberOfLines={1}
          style={[styles.label, { color: theme.primary }, labelStyle]}>
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

// Thanh tab dưới dùng cho Expo Router Tabs (prop tabBar). Giữ sự kiện tabPress/tabLongPress của
// React Navigation để màn bên trong vẫn nghe được (vd. bấm lại tab đang mở).
export function IconTabBar({ state, descriptors, navigation, insets, colorScheme }) {
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row justify-around border-t border-border bg-background px-2"
      style={{ paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        if (options.tabBarItemStyle?.display === 'none') return null;
        const focused = state.index === index;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }

        return (
          <TabItem
            key={route.key}
            focused={focused}
            label={options.title ?? route.name}
            renderIcon={options.tabBarIcon}
            theme={theme}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: FONT_FAMILY.sans.semibold, fontSize: 14, lineHeight: 20 },
});
