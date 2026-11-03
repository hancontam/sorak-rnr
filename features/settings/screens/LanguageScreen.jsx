import { SettingsOptionRow, SettingsSheetLayout } from '@/components/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

const languages = [
  { label: 'Tiếng Việt', selected: true },
  { label: 'English', description: 'Tiếng Anh' },
  { label: '日本語', description: 'Tiếng Nhật' },
  { label: 'Português (Brasil)', description: 'Tiếng Bồ Đào Nha (Brazil)' },
  { label: '한국어', description: 'Tiếng Hàn' },
];

export default function LanguageScreen() {
  const router = useRouter();
  return (
    <SettingsSheetLayout title="Chọn ngôn ngữ" onBack={() => router.back()}>
      <View>
        {languages.map((language) => (
          <SettingsOptionRow key={language.label} {...language} />
        ))}
      </View>
    </SettingsSheetLayout>
  );
}
