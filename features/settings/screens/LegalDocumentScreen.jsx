import { Stack, useLocalSearchParams } from 'expo-router';
import { FileWarning } from 'lucide-react-native';
import { View } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
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
      <Alert icon={FileWarning}>
        <AlertDescription className="text-2xs leading-4">
          {t('Bản nháp, nhà trường cần rà soát trước khi phát hành. Cập nhật {date}.', {
            date: LEGAL_UPDATED,
          })}
        </AlertDescription>
      </Alert>
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
    </SettingsContent>
  );
}
