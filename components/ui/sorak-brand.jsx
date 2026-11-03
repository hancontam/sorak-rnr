import SorakMark from '@/assets/images/sorak-mark.svg';
import { Text } from '@/components/ui/text';
import { Image, View } from 'react-native';

const schoolSeparator = require('@/assets/images/school-separator.png');

export function SorakBrand() {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <SorakMark width={32} height={35} />
      <Text className="text-lg font-semibold text-foreground">Sorak</Text>
      <Image source={schoolSeparator} className="ml-2 h-[23px] w-[23px]" resizeMode="contain" />
      <Text className="max-w-[114px] text-sm font-semibold leading-[17px] text-[#5faaf9]">
        Trường Mầm{'\n'}Non Hòn Tre
      </Text>
    </View>
  );
}
