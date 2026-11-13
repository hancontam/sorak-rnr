import { Image as ImageIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { SorakLogo } from '@/components/shared/SorakLogo';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function SorakBrand() {
  const t = useTranslation();
  return (
    <View className="max-w-[92%] flex-row items-center gap-2.5 self-center rounded-xl border border-dashed border-border bg-muted/30 px-3 py-1.5">
      <View className="flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <SorakLogo size={18} />
        </View>
        <Text className="text-xs font-semibold tracking-tight">Sorak</Text>
      </View>
      <Text className="font-mono text-2xs text-muted-foreground">×</Text>
      <View className="min-w-0 shrink flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <Icon as={ImageIcon} size={14} className="text-muted-foreground" />
        </View>
        <View className="min-w-0 shrink">
          <Text className="font-mono text-2xs font-semibold leading-[14px] text-foreground/85">
            {t('Trường Mầm Non')}
          </Text>
          <Text className="font-mono text-2xs leading-[14px] text-muted-foreground">Hòn Tre</Text>
        </View>
      </View>
    </View>
  );
}
