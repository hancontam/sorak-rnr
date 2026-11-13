import { CircleAlert, Languages } from 'lucide-react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguagePreference, useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';

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
        <SettingsSection
          title={t('Ngôn ngữ')}
          footer={t('Tên riêng, nhận xét và nội dung từ nhà trường giữ nguyên ngôn ngữ gốc.')}>
          {LANGUAGES.map(({ value, label }) => (
            <SettingsRow
              key={value}
              icon={Languages}
              label={label}
              disabled={disabled}
              onPress={() => chooseLanguage(value)}
              accessibilityLabel={label}
              right={
                <RadioGroupItem value={value} accessibilityLabel={label} disabled={disabled} />
              }
            />
          ))}
        </SettingsSection>
      </RadioGroup>
      {error ? (
        <Alert icon={CircleAlert} variant="destructive">
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      ) : null}
    </SettingsContent>
  );
}
