import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  PanResponder,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';

import { TypewriterText } from '@/components/shared/TypewriterText';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

const SLIDES = [
  {
    photo: require('@/assets/images/welcome-mascot-school.webp'),
    label: 'Hoạt động lớp',
    headline: 'Mỗi ngày đến lớp,\nmột điều tuyệt vời.',
    caption: 'Theo dõi lịch học và các hoạt động trong ngày của bé.',
  },
  {
    photo: require('@/assets/images/welcome-mascot-campus.webp'),
    label: 'Sổ liên lạc điện tử',
    headline: 'Kết nối Giáo viên,\nđồng hành cùng con.',
    caption: 'Xem Sổ bé ngoan và gửi phản hồi cho giáo viên.',
  },
  {
    photo: require('@/assets/images/welcome-mascot-clouds.webp'),
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
  // Câu tiêu đề của ảnh nào đã gõ xong; chỉ chuyển ảnh sau khi câu hiện đủ một lúc.
  const [typedHeadline, setTypedHeadline] = useState('');
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

  const headline = t(slide.headline);
  useEffect(() => {
    if (paused || reduceMotion || typedHeadline !== headline) return;
    const timer = setTimeout(() => setIndex(wrap(index + 1)), 3000);
    return () => clearTimeout(timer);
  }, [headline, index, paused, reduceMotion, typedHeadline]);

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
        {/* Tiêu đề gõ chữ như bản Welcome cũ, đổi theo ảnh đang hiện; giữ chỗ 2 dòng để ảnh không nhảy. */}
        <TypewriterText
          role="heading"
          text={headline}
          reduceMotion={reduceMotion}
          onComplete={setTypedHeadline}
          className="mt-6 min-h-[84px] px-4 pt-1 text-center text-[28px] font-normal leading-[40px] tracking-tight"
        />
      </View>
      <View className="grow justify-center py-2">
        <View className="flex-row items-center justify-center gap-3" {...swipe.panHandlers}>
          <PeekPhoto
            side="left"
            photo={SLIDES[wrap(index - 1)].photo}
            height={peekHeight}
            onPress={() => setIndex(wrap(index - 1))}
          />
          {/* Ảnh mascot chính thức như Figma: ảnh sạch, không phủ tối hay chữ trên ảnh. */}
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${t(slide.label)}. ${t(slide.caption)}`}
            className="overflow-hidden border border-border bg-muted"
            style={{ width: cardWidth, height: cardHeight }}>
            <Image
              source={slide.photo}
              className="absolute inset-0 h-full w-full"
              resizeMode="cover"
            />
          </View>
          <PeekPhoto
            side="right"
            photo={SLIDES[wrap(index + 1)].photo}
            height={peekHeight}
            onPress={() => setIndex(wrap(index + 1))}
          />
        </View>
        <View className="flex-row items-center justify-center gap-1.5 pt-4">
          {SLIDES.map(({ label }, position) => (
            <Pressable
              key={label}
              hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel={t('Ảnh {number}: {label}', {
                number: position + 1,
                label: t(label),
              })}
              accessibilityState={{ selected: index === position }}
              onPress={() => setIndex(position)}
              className={index === position ? 'h-1.5 w-5 bg-primary' : 'size-1.5 bg-border'}
            />
          ))}
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
      className={`w-6 overflow-hidden border-y border-border bg-muted p-0 opacity-75 ${left ? 'border-r' : 'border-l'}`}
      style={{ height }}
      accessibilityRole="button"
      accessibilityLabel={left ? t('Ảnh trước') : t('Ảnh tiếp theo')}
      onPress={onPress}>
      <Image source={photo} className="absolute inset-0 h-full w-full" resizeMode="cover" />
    </Button>
  );
}
