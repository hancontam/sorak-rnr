import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/lib/utils';

const BAND = 160;
const DURATION = 1300;

// Khối giữ chỗ khi tải: nền muted với một dải sáng lướt ngang (shimmer) thay cho vòng xoay.
// Dải sáng vẽ bằng react-native-svg + Reanimated có sẵn, không cần module native mới.
// Người dùng bật giảm chuyển động thì chỉ còn khối tĩnh.
function Skeleton({ className, ...props }) {
  const { colorScheme } = useColorScheme();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion || !width) return undefined;
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: DURATION, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion, width]);

  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -BAND + progress.value * (width + BAND) }],
  }));
  const highlight = colorScheme === 'dark' ? 0.08 : 0.65;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={cn('overflow-hidden rounded-md bg-muted', className)}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      {...props}>
      {width && !reduceMotion ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 0, bottom: 0, width: BAND }, bandStyle]}>
          <Svg width={BAND} height="100%">
            <Defs>
              <LinearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <Stop offset="0.5" stopColor="#ffffff" stopOpacity={highlight} />
                <Stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width={BAND} height="100%" fill="url(#shimmer)" />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

export { Skeleton };
