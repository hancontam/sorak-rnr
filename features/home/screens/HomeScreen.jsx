import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SorakBrand, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const name = user?.fullName || user?.name || user?.username || 'Sorak';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-6 py-4">
        <SorakBrand />
        <Pressable
          onPress={() => router.push('/settings')}
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ và cài đặt">
          <Avatar alt={name} className="size-10">
            {user?.avatar ? <AvatarImage source={{ uri: user.avatar }} /> : null}
            <AvatarFallback>
              <Text className="font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
            </AvatarFallback>
          </Avatar>
        </Pressable>
      </View>
      <View className="px-6 pt-6">
        <Text className="text-xl font-semibold">Xin chào, {name}</Text>
      </View>
    </SafeAreaView>
  );
}
