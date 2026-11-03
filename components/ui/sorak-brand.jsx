import { Text } from '@/components/ui/text';
import SorakMark from '@/assets/images/welcome/sorak-mark.svg';
import { Image, View } from 'react-native';

const separator = require('@/assets/images/welcome/school-separator.png');

export function SorakBrand() {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <SorakMark width={32} height={35} />
      <Text className="text-lg font-semibold text-foreground">Sorak</Text>
      <Image source={separator} className="ml-2 h-[23px] w-[23px]" resizeMode="contain" />
      <Text className="max-w-[114px] text-sm font-semibold leading-[17px] text-[#5faaf9]">
        Trường Mầm Non Hòn Tre
      </Text>
    </View>
  );
}
