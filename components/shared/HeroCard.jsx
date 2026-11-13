import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/text';

// Card ảnh grayscale tỉ lệ 16:9 như AspectRatio của showcase: ảnh minh họa (không người, không chữ),
// lớp phủ chuyển tối ở đáy, nhãn mono và tiêu đề lấy từ dữ liệu thật.
export function HeroCard({ source, tag, title, subtitle }) {
  return (
    <View className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted">
      <Image
        source={source}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        // Ảnh require() mặc định lấy kích thước gốc; đặt 100% để phủ đúng khung 16:9.
        style={styles.image}
      />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0.25" stopColor="#000" stopOpacity="0" />
            <Stop offset="0.6" stopColor="#000" stopOpacity="0.15" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.72" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#hero-fade)" />
      </Svg>
      <View className="flex-1 justify-end gap-1 p-3.5">
        {tag ? (
          <View className="self-start rounded bg-white/20 px-1.5 py-0.5">
            <Text className="font-mono text-2xs uppercase tracking-wider text-white">{tag}</Text>
          </View>
        ) : null}
        <Text numberOfLines={1} className="text-sm font-semibold text-white">
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="text-xs text-white/80">
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
