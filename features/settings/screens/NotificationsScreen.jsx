import { SettingsMenuRow, SettingsSheetLayout, SettingsSwitchRow, Text } from '@/components/ui';
import { usePreferencesStore } from '@/features/settings/store/preferences.store';
import { useRouter } from 'expo-router';
import { Bell, Settings2 } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const notificationPrefs = usePreferencesStore((state) => state.notificationPrefs);
  const updateNotificationPrefs = usePreferencesStore((state) => state.updateNotificationPrefs);

  const isEnabled = notificationPrefs?.notificationsEnabled ?? true;

  return (
    <SettingsSheetLayout title="Thông báo" onBack={() => router.back()}>
      <View className="gap-2">
        <SettingsSwitchRow
          label="Thông báo"
          icon={Bell}
          checked={isEnabled}
          onCheckedChange={(val) => updateNotificationPrefs({ notificationsEnabled: val })}
          compact
        />
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
