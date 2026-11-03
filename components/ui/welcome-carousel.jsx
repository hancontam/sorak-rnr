import * as React from 'react';
import { Image, ScrollView, View, useWindowDimensions } from 'react-native';

const slides = [
  require('@/assets/images/welcome/slide-previous.png'),
  require('@/assets/images/welcome/slide-school.png'),
  require('@/assets/images/welcome/slide-next.png'),
];

export function WelcomeCarousel() {
  const { width } = useWindowDimensions();
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(1);
  const slideWidth = Math.min(344, width - 96);
  const slideHeight = (slideWidth * 459) / 344;
  const itemWidth = slideWidth + 20;

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ x: itemWidth, animated: false });
  }, [itemWidth]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: nextIndex * itemWidth, animated: true });
      setActiveIndex(nextIndex);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeIndex, itemWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={itemWidth}
      decelerationRate="fast"
      contentOffset={{ x: itemWidth, y: 0 }}
      contentContainerStyle={{ paddingHorizontal: (width - itemWidth) / 2 }}
      style={{ flexGrow: 0, height: slideHeight }}
      onMomentumScrollEnd={(event) => {
        setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / itemWidth));
      }}>
      {slides.map((source, index) => {
        const active = index === activeIndex;
        return (
          <View
            key={index}
            style={{
              width: itemWidth,
              height: slideHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={source}
              resizeMode="cover"
              style={{
                width: active ? slideWidth : (slideWidth * 320) / 344,
                height: active ? slideHeight : (slideHeight * 380) / 459,
                borderRadius: 6,
              }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
