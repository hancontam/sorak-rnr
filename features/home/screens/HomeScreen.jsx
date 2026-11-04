import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SorakMark from '@/assets/images/sorak-mark.svg';
import { HomeBottomNav, HomeSectionTabs, Icon, Text } from '@/components/ui';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const name = user?.fullName || user?.name || user?.username || 'Sorak';
  const username = user?.username || user?.employeeCode || name;
  const avatar = user?.avatar || user?.avatarUrl;
  const isParent = user?.role === 'PARENT_PH';
  const assignedClass = user?.assignedClasses?.[0] || user?.teacher?.assignedClasses?.[0];
  const className =
    (isParent ? user?.student?.className : assignedClass?.className) || 'Chưa có lớp';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="h-[72px] flex-row items-center justify-between px-6">
        <View className="flex-row items-center gap-1.5">
          <SorakMark width={20} height={20} />
          <Text className="text-lg font-semibold text-foreground">Sorak</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-10 max-w-[144px] flex-row items-center gap-2 rounded-full border border-border px-3">
            <Text className="flex-shrink text-sm" numberOfLines={1}>
              {username}
            </Text>
            <Icon as={ChevronDown} size={14} strokeWidth={2} className="text-muted-foreground" />
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Mở hồ sơ và cài đặt">
            <Avatar alt={name} className="size-9">
              {avatar ? <AvatarImage source={{ uri: avatar }} /> : null}
              <AvatarFallback>
                <Text className="font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
              </AvatarFallback>
            </Avatar>
          </Pressable>
        </View>
      </View>
      <HomeSectionTabs isParent={isParent}>
        <Text className="text-xl font-semibold">Báo cáo</Text>
        <Text className="text-xl font-semibold">Xin chào, {name}</Text>
        <Text className="text-xl font-semibold">
          {isParent ? 'Kết quả đánh giá' : 'Đánh giá giai đoạn'}
        </Text>
      </HomeSectionTabs>
      <HomeBottomNav isParent={isParent} className={className} notificationCount={2} />
    </SafeAreaView>
  );
}
