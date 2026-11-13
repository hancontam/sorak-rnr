import { CircleAlert, Monitor, Moon, Sun } from 'lucide-react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
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
        <SettingsSection title={t('Chế độ hiển thị')}>
          {MODES.map(({ value, title, detail, icon }) => (
            <SettingsRow
              key={value}
              icon={icon}
              label={t(title)}
              detail={detail ? t(detail) : undefined}
              disabled={disabled}
              onPress={() => chooseMode(value)}
              accessibilityLabel={t(title)}
              right={
                <RadioGroupItem value={value} accessibilityLabel={t(title)} disabled={disabled} />
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
