import { CircleAlert, Monitor, Moon, Sun } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { useThemePreference } from '../hooks/useThemePreference';

const MODES = [
  { value: 'light', title: 'Sáng', icon: Sun },
  { value: 'dark', title: 'Tối', icon: Moon },
  { value: 'system', title: 'Tự động', detail: 'Theo giao diện của thiết bị', icon: Monitor },
];

export default function AppearanceScreen() {
  const t = useTranslation();
  const { mode, ready, saving, error, chooseMode } = useThemePreference();
  const disabled = !ready || saving;

  return (
    <SettingsContent>
      <RadioGroup value={mode} onValueChange={chooseMode}>
        {MODES.map(({ value, title, detail, icon }) => (
          <View
            key={value}
            className="min-h-12 flex-row items-center rounded-xl border border-border px-3">
            <Pressable
              accessible={false}
              disabled={disabled}
              onPress={() => chooseMode(value)}
              className="min-h-12 flex-1 flex-row items-center gap-3 py-2">
              <Icon as={icon} size={17} className="text-muted-foreground" />
              <View className="flex-1 gap-0.5">
                <Text className="text-xs font-semibold">{t(title)}</Text>
                {detail ? (
                  <Text className="text-[11px] text-muted-foreground">{t(detail)}</Text>
                ) : null}
              </View>
            </Pressable>
            <RadioGroupItem value={value} accessibilityLabel={t(title)} disabled={disabled} />
          </View>
        ))}
      </RadioGroup>
      {error ? (
        <Alert icon={CircleAlert}>
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      ) : null}
    </SettingsContent>
  );
}
