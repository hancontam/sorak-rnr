import { SettingsMenuRow, SettingsSheetLayout, SettingsSwitchRow, Text } from '@/components/ui';
import { useRouter } from 'expo-router';
import { Bell, Settings2 } from 'lucide-react-native';
import { View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  return (
    <SettingsSheetLayout title="Thông báo" onBack={() => router.back()}>
      <View className="gap-2">
        <SettingsSwitchRow label="Thông báo" icon={Bell} checked compact />
        <SettingsMenuRow
          label="Quản lý thông báo"
          icon={Settings2}
          onPress={() => router.push('/settings/notification-management')}
        />
        <Text className="text-xs text-muted-foreground">
          Tùy chỉnh các loại thông báo bạn muốn nhận trong Sorak.
        </Text>
      </View>
    </SettingsSheetLayout>
  );
}
