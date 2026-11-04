import { SettingsOptionRow, SettingsSheetLayout } from '@/components/ui';
import { usePreferencesStore } from '@/features/settings/store/preferences.store';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

const languages = [
  { code: 'vi', label: 'Tiếng Việt', description: 'Vietnamese' },
  { code: 'en', label: 'English', description: 'Tiếng Anh' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const language = usePreferencesStore((state) => state.language);
  const setLanguage = usePreferencesStore((state) => state.setLanguage);

  return (
    <SettingsSheetLayout title="Chọn ngôn ngữ" onBack={() => router.back()}>
      <View>
        {languages.map((item) => (
          <SettingsOptionRow
            key={item.code}
            label={item.label}
            description={item.description}
            selected={language === item.code}
            onPress={() => setLanguage(item.code)}
          />
        ))}
      </View>
    </SettingsSheetLayout>
  );
}
