import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

export function SettingsSwitchRow({ label, description, icon, checked = false, compact = false }) {
  return (
    <View
      className={`flex-row items-center gap-3 rounded-md px-4 ${compact ? 'h-10 bg-secondary' : 'min-h-[50px] bg-card py-2'}`}>
      {icon ? <Icon as={icon} size={16} strokeWidth={1} /> : null}
      <View className="flex-1">
        <Text className="text-sm">{label}</Text>
        {description ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      <Switch checked={checked} disabled className="opacity-100" accessibilityLabel={label} />
    </View>
  );
}
