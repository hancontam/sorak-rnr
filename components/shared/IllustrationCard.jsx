import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Banner minh họa màu (mascot Sorak) tỉ lệ 2:1: ảnh phủ khung, lớp sáng từ trái để chữ navy đọc rõ.
// Khác HeroCard (ảnh grayscale, chữ trắng); dùng cho các màn cần cảm giác thân thiện như Đón trẻ.
export function IllustrationCard({ source, eyebrow, title, subtitle, className }) {
  return (
    <View
      className={cn(
        'aspect-[2/1] w-full overflow-hidden border border-border bg-secondary',
        className
      )}>
      <Image
        source={source}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        style={styles.image}
      />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="illustration-fade" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
            <Stop offset="0.45" stopColor="#ffffff" stopOpacity="0.55" />
            <Stop offset="0.7" stopColor="#ffffff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#illustration-fade)" />
      </Svg>
      <View className="w-1/2 flex-1 justify-end gap-1 p-3.5">
        {eyebrow ? (
          <Text className="font-mono text-2xs uppercase tracking-wider text-primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text numberOfLines={2} className="text-base font-semibold leading-5 text-[#1A2845]">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} className="text-xs text-[#1A2845]/75">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
