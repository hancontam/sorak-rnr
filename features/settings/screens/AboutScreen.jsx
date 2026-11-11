import Constants from 'expo-constants';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';

export default function AboutScreen() {
  const t = useTranslation();
  const version = Constants.expoConfig?.version;
  return (
    <SettingsContent>
      <Card className="gap-2 rounded-xl py-4 shadow-none">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Sorak Mobile</CardTitle>
        </CardHeader>
        <CardContent className="gap-1 px-4">
          <Text className="text-xs">
            {t('Ứng dụng dành cho giáo viên và phụ huynh Trường Mầm Non Hòn Tre.')}
          </Text>
          {version ? (
            <Text className="text-xs text-muted-foreground">
              {t('Phiên bản {version}', { version })}
            </Text>
          ) : null}
        </CardContent>
      </Card>
    </SettingsContent>
  );
}
