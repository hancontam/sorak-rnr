import { SettingsOptionRow, SettingsSheetLayout } from '@/components/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

const themes = [{ label: 'Tự động' }, { label: 'Sáng', selected: true }, { label: 'Tối' }];

export default function AppearanceScreen() {
  const router = useRouter();
  return (
    <SettingsSheetLayout title="Chọn giao diện" onBack={() => router.back()}>
      <View>
        {themes.map((theme) => (
          <SettingsOptionRow key={theme.label} {...theme} />
        ))}
      </View>
    </SettingsSheetLayout>
  );
}
