import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { LEGAL_DOCUMENTS, LEGAL_UPDATED } from '../data/legal-documents';

export default function LegalDocumentScreen() {
  const t = useTranslation();
  const locale = useLocale();
  const { doc } = useLocalSearchParams();
  const entry = LEGAL_DOCUMENTS[doc];
  const content = entry?.[locale?.startsWith('en') ? 'en' : 'vi'];

  if (!content) {
    return (
      <SettingsContent>
        <Text className="text-xs text-muted-foreground">{t('Không tìm thấy tài liệu này.')}</Text>
      </SettingsContent>
    );
  }

  return (
    <SettingsContent>
      <Stack.Screen options={{ title: content.title }} />
      {content.sections.map((section) => (
        <View key={section.heading} className="gap-1.5">
          <Text role="heading" className="text-sm font-semibold">
            {section.heading}
          </Text>
          {section.body.map((paragraph) => (
            <Text key={paragraph} className="text-xs leading-5 text-muted-foreground">
              {paragraph}
            </Text>
          ))}
        </View>
      ))}
      <Text className="border-t border-border pt-3 text-2xs text-muted-foreground">
        {t('Trường Mầm Non Hòn Tre · Sorak. Cập nhật lần cuối {date}.', { date: LEGAL_UPDATED })}
      </Text>
    </SettingsContent>
  );
}
