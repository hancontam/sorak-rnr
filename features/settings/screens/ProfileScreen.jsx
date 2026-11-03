import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileField, SettingsSheetLayout, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const name = user?.fullName || user?.name || user?.username || '';
  const avatar = user?.avatar || user?.avatarUrl;

  return (
    <SettingsSheetLayout title="Hồ sơ cá nhân" onBack={() => router.back()}>
      <View className="gap-5">
        <View className="items-center gap-3 py-2">
          <Text className="self-start text-sm font-medium">Ảnh đại diện</Text>
          <Avatar alt={name || 'Người dùng'} className="size-20">
            {avatar ? <AvatarImage source={{ uri: avatar }} /> : null}
            <AvatarFallback>
              <Text className="text-xl font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
            </AvatarFallback>
          </Avatar>
        </View>
        <ProfileField label="Họ và tên" value={name} />
        <ProfileField label="Số điện thoại" value={user?.phone || user?.teacher?.phone} />
        <ProfileField label="Email" value={user?.email || user?.teacher?.email} />
        <ProfileField label="Địa chỉ" value={user?.address || user?.teacher?.address} />
      </View>
    </SettingsSheetLayout>
  );
}
