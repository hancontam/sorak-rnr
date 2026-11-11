import { CircleAlert } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { useLanguagePreference, useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'English' },
];

export default function LanguageScreen() {
  const t = useTranslation();
  const { language, ready, saving, error, chooseLanguage } = useLanguagePreference();
  const disabled = !ready || saving;

  return (
    <SettingsContent>
      <RadioGroup value={language} onValueChange={chooseLanguage}>
        {LANGUAGES.map(({ value, label }) => (
          <View
            key={value}
            className="min-h-12 flex-row items-center rounded-xl border border-border px-3">
            <Pressable
              accessible={false}
              disabled={disabled}
              onPress={() => chooseLanguage(value)}
              className="min-h-12 flex-1 justify-center">
              <Text className="text-xs font-semibold">{label}</Text>
            </Pressable>
            <RadioGroupItem value={value} accessibilityLabel={label} disabled={disabled} />
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
