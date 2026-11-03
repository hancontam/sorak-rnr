import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsGroup, SettingsMenuRow, SettingsSheetLayout, Text } from '@/components/ui';
import { signOut } from '@/features/auth/hooks/useSession';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  Bell,
  CircleHelp,
  Languages,
  LogOut,
  Palette,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const name = user?.fullName || user?.name || user?.username || 'Người dùng';
  const role = user?.role === 'PARENT_PH' ? 'Phụ huynh' : 'Giáo viên';

  async function logout() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      // Phiên trên thiết bị đã được xóa kể cả khi request tới server thất bại.
    }
  }

  function confirmLogout() {
    Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi thiết bị này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SettingsSheetLayout onBack={() => router.back()}>
      <View className="mb-5 flex-row items-center gap-3">
        <Avatar alt={name} className="size-14">
          {user?.avatar ? <AvatarImage source={{ uri: user.avatar }} /> : null}
          <AvatarFallback>
            <Text className="text-lg font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg font-bold" numberOfLines={1}>
              {name}
            </Text>
            <Text className="rounded-md bg-[#5faaf9] px-1.5 py-0.5 text-xs text-white">{role}</Text>
          </View>
          <Text className="text-xs text-muted-foreground">
            {user?.username || user?.employeeCode || ''} · {role}
          </Text>
          {user?.email ? <Text className="text-xs text-muted-foreground">{user.email}</Text> : null}
        </View>
      </View>
      <View className="gap-3">
        <SettingsGroup title="CÁ NHÂN">
          <SettingsMenuRow label="Hồ sơ cá nhân" icon={UserRound} />
        </SettingsGroup>
        <SettingsGroup title="GIAO DIỆN">
          <SettingsMenuRow label="Giao diện - Sáng" icon={Palette} />
        </SettingsGroup>
        <SettingsGroup title="NGÔN NGỮ">
          <SettingsMenuRow label="Ngôn ngữ - Tiếng Việt" icon={Languages} />
        </SettingsGroup>
        <SettingsGroup title="THÔNG BÁO">
          <SettingsMenuRow label="Thông báo" icon={Bell} />
        </SettingsGroup>
        <SettingsGroup title="HỖ TRỢ">
          <SettingsMenuRow
            label="Giới thiệu"
            icon={CircleHelp}
            onPress={() => router.push('/settings/about')}
          />
        </SettingsGroup>
        <SettingsGroup title="KHÁC">
          <SettingsMenuRow
            label="Quản lý tài khoản"
            icon={UsersRound}
            onPress={() => router.push('/settings/account')}
          />
          <SettingsMenuRow
            label={isSigningOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            icon={LogOut}
            destructive
            showChevron={false}
            onPress={confirmLogout}
          />
        </SettingsGroup>
      </View>
    </SettingsSheetLayout>
  );
}
