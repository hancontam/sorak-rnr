import { Image as ImageIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { SorakLogo } from '@/components/shared/SorakLogo';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function SorakBrand({ typography }) {
  return (
    <View className="max-w-[92%] flex-row items-center gap-2.5 self-center rounded-xl border border-dashed border-border bg-muted/30 px-3 py-1.5">
      <View className="flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <SorakLogo size={18} />
        </View>
        <Text className="text-xs tracking-tight" style={typography.semiBold}>
          Sorak
        </Text>
      </View>
      <Text className="text-[11px] text-muted-foreground" style={typography.mono}>
        ×
      </Text>
      <View className="min-w-0 shrink flex-row items-center gap-1.5">
        <View className="size-6 items-center justify-center rounded-md border border-dashed border-border bg-background">
          <Icon as={ImageIcon} size={14} className="text-muted-foreground" />
        </View>
        <View className="min-w-0 shrink">
          <Text
            className="text-[10px] leading-[13px] text-foreground/85"
            style={typography.monoSemiBold}>
            Trường Mầm Non
          </Text>
          <Text
            className="text-[10px] leading-[13px] text-muted-foreground"
            style={typography.mono}>
            Hòn Tre
          </Text>
        </View>
      </View>
    </View>
  );
}
