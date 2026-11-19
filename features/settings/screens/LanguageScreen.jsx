import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FONT_FAMILY } from '@/lib/fonts';
import { useLanguagePreference, useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';

// Lucide không có icon ngôn ngữ riêng: dùng mã VI/EN in đậm ở ô icon, nhận size/màu như icon
// (Icon truyền màu qua style.color) để hai dòng phân biệt được mà vẫn cùng cột icon Cài đặt.
function languageMark(code) {
  function LanguageMark({ size = 16, style }) {
    const color = StyleSheet.flatten(style)?.color;
    return (
      <View style={{ width: size + 4, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          allowFontScaling={false}
          style={{ color, fontSize: 11, lineHeight: 14, fontFamily: FONT_FAMILY.sans.bold }}>
          {code}
        </Text>
      </View>
    );
  }
  LanguageMark.displayName = `LanguageMark(${code})`;
  return LanguageMark;
}

const LANGUAGES = [
  { value: 'vi', label: 'Tiếng Việt', icon: languageMark('VI') },
  { value: 'en', label: 'English', icon: languageMark('EN') },
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
          {LANGUAGES.map(({ value, label, icon }) => (
            <SettingsRow
              key={value}
              icon={icon}
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
