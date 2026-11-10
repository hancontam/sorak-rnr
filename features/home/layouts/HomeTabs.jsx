import { Tabs, useRouter } from 'expo-router';
import { Baby, CalendarDays, GraduationCap, LayoutGrid } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthSuccessToast } from '@/features/auth/components/AuthSuccessToast';
import { useAuthTypography } from '@/features/auth/hooks/useAuthTypography';
import { useSession } from '@/features/auth/hooks/useSession';
import { useNotificationInbox } from '@/features/notification/hooks/useNotifications';
import { THEME } from '@/lib/theme';

import { HomeHeader } from '../components/HomeHeader';

export function HomeTabs({ role }) {
  const router = useRouter();
  const { user, loginSucceeded, dismissLoginSuccess } = useSession();
  const typography = useAuthTypography();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isParent = role === 'parent';
  const inbox = useNotificationInbox();
  if (!user) return null;
  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          header: () => (
            <HomeHeader
              user={user}
              unreadCount={inbox.data?.unreadCount}
              onNotifications={() =>
                router.push(isParent ? '/(parent)/notifications' : '/(teacher)/notifications')
              }
              onSettings={() => router.push('/settings')}
            />
          ),
          tabBarActiveTintColor: theme.foreground,
          tabBarInactiveTintColor: theme.mutedForeground,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        }}>
        <Tabs.Screen
          name={isParent ? 'child-profile' : 'overview'}
          options={{
            title: isParent ? 'Hồ sơ trẻ' : 'Tổng quan lớp',
            tabBarIcon: ({ color }) =>
              isParent ? <Baby size={18} color={color} /> : <LayoutGrid size={18} color={color} />,
          }}
        />
        <Tabs.Screen
          name="timetable"
          options={{
            title: 'Thời khóa biểu',
            tabBarIcon: ({ color }) => <CalendarDays size={18} color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-results"
          options={{
            title: 'Kết quả học tập',
            tabBarIcon: ({ color }) => <GraduationCap size={18} color={color} />,
          }}
        />
      </Tabs>
      {loginSucceeded ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 items-center px-4"
          style={{ top: insets.top + 8, zIndex: 20, elevation: 20 }}>
          <AuthSuccessToast
            title="Đăng nhập hoàn tất!"
            description="Bạn đã kết nối với Sorak."
            typography={typography}
            onDismiss={dismissLoginSuccess}
          />
        </View>
      ) : null}
    </View>
  );
}
