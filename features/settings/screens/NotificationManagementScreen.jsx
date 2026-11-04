import { SettingsSheetLayout, SettingsSwitchRow, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePreferencesStore } from '@/features/settings/store/preferences.store';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { View } from 'react-native';

export default function NotificationManagementScreen() {
  const router = useRouter();
  const isParent = useAuthStore((state) => state.user?.role === 'PARENT_PH');
  const prefs = usePreferencesStore((state) => state.notificationPrefs);
  const updatePrefs = usePreferencesStore((state) => state.updateNotificationPrefs);

  return (
    <SettingsSheetLayout title="Quản lý thông báo" onBack={() => router.back()}>
      <View className="gap-6">
        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted-foreground">THÔNG BÁO QUA EMAIL</Text>
          <SettingsSwitchRow
            label="Lớp học & điểm danh"
            description="Cập nhật điểm danh và thông tin lớp"
            checked={prefs?.emailClassAttendance ?? true}
            onCheckedChange={(val) => updatePrefs({ emailClassAttendance: val })}
          />
          <SettingsSwitchRow
            label="Đơn xin nghỉ & chuyển lớp"
            description={
              isParent
                ? 'Cập nhật trạng thái yêu cầu của con'
                : 'Thông báo khi có yêu cầu cần duyệt'
            }
            checked={prefs?.emailRequests ?? true}
            onCheckedChange={(val) => updatePrefs({ emailRequests: val })}
          />
          <SettingsSwitchRow
            label="Bảo mật tài khoản"
            description="Cảnh báo đăng nhập và đổi mật khẩu"
            checked={prefs?.emailSecurity ?? true}
            onCheckedChange={(val) => updatePrefs({ emailSecurity: val })}
          />
        </View>
        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted-foreground">
            THÔNG BÁO TRONG ỨNG DỤNG
          </Text>
          <SettingsSwitchRow
            label="Thông báo đẩy"
            description="Hiện thông báo nhanh trên thiết bị"
            checked={prefs?.pushNotifications ?? true}
            onCheckedChange={(val) => updatePrefs({ pushNotifications: val })}
          />
          <SettingsSwitchRow
            label="Âm thanh"
            description="Phát âm thanh khi có thông báo"
            checked={prefs?.soundEnabled ?? false}
            onCheckedChange={(val) => updatePrefs({ soundEnabled: val })}
          />
        </View>
      </View>
    </SettingsSheetLayout>
  );
}
