import { SettingsOptionRow, SettingsSheetLayout } from '@/components/ui';
import { useThemePreference } from '@/features/settings/hooks/useThemePreference';
import { useRouter } from 'expo-router';
import { Alert, View } from 'react-native';

const themes = [
  { value: 'system', label: 'Tự động' },
  { value: 'light', label: 'Sáng' },
  { value: 'dark', label: 'Tối' },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { themeMode, isSaving, chooseThemeMode } = useThemePreference();

  async function selectTheme(value) {
    try {
      await chooseThemeMode(value);
    } catch {
      Alert.alert('Không lưu được giao diện', 'Vui lòng thử lại.');
    }
  }

  return (
    <SettingsSheetLayout title="Chọn giao diện" onBack={() => router.back()}>
      <View>
        {themes.map((theme) => (
          <SettingsOptionRow
            key={theme.value}
            label={theme.label}
            selected={themeMode === theme.value}
            onPress={() => selectTheme(theme.value)}
            disabled={isSaving}
          />
        ))}
      </View>
    </SettingsSheetLayout>
  );
}
