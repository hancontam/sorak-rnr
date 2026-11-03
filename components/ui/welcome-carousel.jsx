import { Image, View, useWindowDimensions } from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';

const slides = [
  require('@/assets/images/slide-previous.png'),
  require('@/assets/images/slide-school.png'),
  require('@/assets/images/slide-next.png'),
];

export function WelcomeCarousel() {
  const { width } = useWindowDimensions();
  const slideWidth = Math.min(344, width - 96);
  const slideHeight = (slideWidth * 459) / 344;

  return (
    <Carousel
      style={{ width, height: slideHeight }}
      data={slides}
      defaultIndex={1}
      loop
      autoplay
      autoplayInterval={3000}
      animation={{ type: 'timing', duration: 650 }}
      layout={{ type: 'parallax', scale: 1, adjacentScale: 0.83, offset: 100 }}
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item }) => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={item}
            resizeMode="cover"
            style={{ width: slideWidth, height: slideHeight, borderRadius: 6 }}
          />
        </View>
      )}
    />
  );
}
