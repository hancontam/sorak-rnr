import { SettingsSheetLayout, SettingsSwitchRow, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function NotificationManagementScreen() {
  const router = useRouter();
  const isParent = useAuthStore((state) => state.user?.role === 'PARENT_PH');
  return (
    <SettingsSheetLayout title="Quản lý thông báo" onBack={() => router.back()}>
      <View className="gap-6">
        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted-foreground">THÔNG BÁO QUA EMAIL</Text>
          <SettingsSwitchRow
            label="Lớp học & điểm danh"
            description="Cập nhật điểm danh và thông tin lớp"
            checked
          />
          <SettingsSwitchRow
            label="Đơn xin nghỉ & chuyển lớp"
            description={
              isParent
                ? 'Cập nhật trạng thái yêu cầu của con'
                : 'Thông báo khi có yêu cầu cần duyệt'
            }
            checked
          />
          <SettingsSwitchRow
            label="Bảo mật tài khoản"
            description="Cảnh báo đăng nhập và đổi mật khẩu"
            checked
          />
        </View>
        <View className="gap-3">
          <Text className="text-xs font-semibold text-muted-foreground">
            THÔNG BÁO TRONG ỨNG DỤNG
          </Text>
          <SettingsSwitchRow
            label="Thông báo đẩy"
            description="Hiện thông báo nhanh trên thiết bị"
            checked
          />
          <SettingsSwitchRow label="Âm thanh" description="Phát âm thanh khi có thông báo" />
        </View>
      </View>
    </SettingsSheetLayout>
  );
}
