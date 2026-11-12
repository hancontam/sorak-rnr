import { ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  PanResponder,
  Platform,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

const SLIDES = [
  {
    photo: require('@/assets/images/welcome-class.jpg'),
    label: 'Hoạt động lớp',
    headline: 'Mỗi ngày đến lớp,\nmột điều tuyệt vời.',
    caption: 'Theo dõi lịch học và các hoạt động trong ngày của bé.',
  },
  {
    photo: require('@/assets/images/welcome-contact-book.jpg'),
    label: 'Sổ liên lạc điện tử',
    headline: 'Kết nối Giáo viên,\nđồng hành cùng con.',
    caption: 'Xem Sổ bé ngoan và gửi phản hồi cho giáo viên.',
  },
  {
    photo: require('@/assets/images/welcome-attendance.jpg'),
    label: 'Điểm danh & An toàn',
    headline: 'An tâm mỗi ngày,\ntrọn vẹn yêu thương.',
    caption: 'Theo dõi điểm danh, thông tin đón trẻ và sức khỏe của bé.',
  },
];

const count = SLIDES.length;
const PHOTO_WIDTH = 288;
const PHOTO_HEIGHT = 405;
const PEEK_HEIGHT = 335;

function wrap(index) {
  return (index + count) % count;
}

export function WelcomeCarousel({ paused, branding }) {
  const t = useTranslation();
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(1, Math.min(PHOTO_WIDTH, width - 88));
  const cardHeight = Math.round((cardWidth * PHOTO_HEIGHT) / PHOTO_WIDTH);
  const peekHeight = Math.round((cardWidth * PEEK_HEIGHT) / PHOTO_WIDTH);
  const slide = SLIDES[index];

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setTimeout(() => setIndex(wrap(index + 1)), 5000);
    return () => clearTimeout(timer);
  }, [index, paused, reduceMotion]);

  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy),
        onPanResponderRelease: (_, { dx }) => {
          if (Math.abs(dx) > 35) setIndex((value) => wrap(value + (dx < 0 ? 1 : -1)));
        },
        onPanResponderTerminationRequest: () => true,
      }),
    []
  );

  return (
    <View className="grow gap-5">
      <View className="gap-4">
        {branding}
        <Text
          role="heading"
          className="px-4 text-center font-mono text-xl font-medium leading-[27px] tracking-tight">
          {t(slide.headline)}
        </Text>
      </View>
      <View className="grow justify-center py-2">
        <View className="flex-row items-center justify-center gap-3" {...swipe.panHandlers}>
          <PeekPhoto
            side="left"
            photo={SLIDES[wrap(index - 1)].photo}
            height={peekHeight}
            onPress={() => setIndex(wrap(index - 1))}
          />
          <View
            className="rounded-2xl bg-muted shadow-md shadow-black/15"
            style={{ width: cardWidth, height: cardHeight }}>
            <View className="flex-1 overflow-hidden rounded-2xl border border-border">
              <Image
                source={slide.photo}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
              />
              <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute' }}>
                <Defs>
                  <LinearGradient id="photoShade" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0" stopColor="black" stopOpacity={0} />
                    <Stop offset="0.5" stopColor="black" stopOpacity={0.15} />
                    <Stop offset="1" stopColor="black" stopOpacity={0.75} />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#photoShade)" />
              </Svg>
              <View className="flex-1 justify-between p-4">
                <View className="flex-row items-center justify-between gap-1">
                  <Badge
                    variant="outline"
                    className="min-w-0 shrink rounded-md border-white/15 bg-black/45">
                    <Text className="shrink font-mono text-[10px] font-semibold uppercase leading-[13px] tracking-wider text-white">
                      {String(index + 1).padStart(2, '0')} / 0{count} • {t(slide.label)}
                    </Text>
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full border border-white/15 bg-black/40 active:bg-black/60"
                    accessibilityRole="button"
                    accessibilityLabel={t('Ảnh tiếp theo')}
                    hitSlop={8}
                    onPress={() => setIndex(wrap(index + 1))}>
                    <Icon as={ChevronRight} size={14} className="text-white" />
                  </Button>
                </View>
                <View className="gap-2">
                  <Text className="text-xs font-medium leading-4 text-white">
                    {t(slide.caption)}
                  </Text>
                  <View className="flex-row items-center gap-1.5 pt-1">
                    {SLIDES.map(({ label }, position) => (
                      <Button
                        key={label}
                        variant="ghost"
                        size="icon"
                        className={
                          index === position
                            ? 'h-1.5 w-5 rounded-full bg-white'
                            : 'size-1.5 rounded-full bg-white/45'
                        }
                        hitSlop={{ top: 10, bottom: 10, left: 3, right: 3 }}
                        accessibilityRole="button"
                        accessibilityLabel={t('Ảnh {number}: {label}', {
                          number: position + 1,
                          label: t(label),
                        })}
                        accessibilityState={{ selected: index === position }}
                        onPress={() => setIndex(position)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
          <PeekPhoto
            side="right"
            photo={SLIDES[wrap(index + 1)].photo}
            height={peekHeight}
            onPress={() => setIndex(wrap(index + 1))}
          />
        </View>
      </View>
    </View>
  );
}

function PeekPhoto({ side, photo, height, onPress }) {
  const t = useTranslation();
  const left = side === 'left';
  return (
    <Button
      variant="ghost"
      className={`w-6 overflow-hidden border-y border-border bg-muted p-0 opacity-75 ${left ? 'rounded-l-none rounded-r-2xl border-r' : 'rounded-l-2xl rounded-r-none border-l'}`}
      style={{ height }}
      accessibilityRole="button"
      accessibilityLabel={left ? t('Ảnh trước') : t('Ảnh tiếp theo')}
      onPress={onPress}>
      <Image source={photo} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <View className="absolute inset-0 bg-black/15" />
    </Button>
  );
}
