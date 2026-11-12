import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { BookOpen, FileText, Shield } from 'lucide-react-native';
import { View } from 'react-native';

import { SorakLogo } from '@/components/shared/SorakLogo';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';

export default function AboutScreen() {
  const t = useTranslation();
  const router = useRouter();
  const version = Constants.expoConfig?.version;
  const open = (doc) => router.push({ pathname: '/settings/legal/[doc]', params: { doc } });

  return (
    <SettingsContent>
      <View className="items-center gap-2 border-b border-border pb-5">
        <SorakLogo size={40} />
        <Text className="text-base font-semibold tracking-tight">Sorak Mobile</Text>
        <Text className="text-center text-xs text-muted-foreground">
          {t('Ứng dụng dành cho giáo viên và phụ huynh Trường Mầm Non Hòn Tre.')}
        </Text>
      </View>
      {version ? (
        <View className="flex-row items-center justify-between px-1">
          <Text className="text-xs font-medium">{t('Phiên bản')}</Text>
          <Text className="font-mono text-xs text-muted-foreground">v{version}</Text>
        </View>
      ) : null}
      <SettingsSection title={t('Pháp lý')}>
        <SettingsRow
          icon={Shield}
          label={t('Chính sách bảo mật')}
          onPress={() => open('privacy')}
        />
        <SettingsRow
          icon={FileText}
          label={t('Điều khoản sử dụng')}
          onPress={() => open('terms')}
        />
      </SettingsSection>
      <SettingsSection title={t('Tài liệu')}>
        <SettingsRow
          icon={BookOpen}
          label={t('Tài liệu hướng dẫn Sorak')}
          onPress={() => open('guide')}
        />
      </SettingsSection>
    </SettingsContent>
  );
}
