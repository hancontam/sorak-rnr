import { X } from 'lucide-react-native';
import { View } from 'react-native';

import { SorakLogo } from '@/components/shared/SorakLogo';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Thương hiệu như Figma: logo + "Sorak", dấu × xanh và tên trường màu xanh (trường chưa có logo).
export function SorakBrand() {
  const t = useTranslation();
  return (
    <View className="flex-row items-center gap-2.5 self-center">
      <View className="flex-row items-center gap-1.5">
        <SorakLogo size={22} />
        <Text className="text-base font-semibold tracking-tight">Sorak</Text>
      </View>
      <Icon as={X} size={16} className="text-primary" />
      <View>
        <Text className="text-2xs font-semibold leading-[13px] text-primary">
          {t('Trường Mầm Non')}
        </Text>
        <Text className="text-2xs font-semibold leading-[13px] text-primary">Hòn Tre</Text>
      </View>
    </View>
  );
}
