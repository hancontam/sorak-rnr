import { useRouter } from 'expo-router';
import { Info, Languages, LogOut, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/hooks/useSession';

import { AccountHeader } from '../components/AccountHeader';
import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow } from '../components/SettingsRow';
import { useThemePreference } from '../hooks/useThemePreference';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useSession();
  const { colorScheme } = useThemePreference();
  if (!user) return null;

  const isDark = colorScheme === 'dark';
  return (
    <SettingsContent>
      <View className="border-b border-border pb-4">
        <AccountHeader user={user} />
      </View>
      <Card className="rounded-xl py-0 shadow-none">
        <CardContent className="px-1 py-1">
          <SettingsRow
            icon={UserRound}
            label="Hồ sơ cá nhân"
            onPress={() => router.push('/settings/profile')}
          />
        </CardContent>
      </Card>
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">Tùy chọn</Text>
        <Card className="rounded-xl py-0 shadow-none">
          <CardContent className="px-1 py-1">
            <SettingsRow
              icon={isDark ? Moon : Sun}
              label="Giao diện"
              detail={isDark ? 'Tối' : 'Sáng'}
              onPress={() => router.push('/settings/appearance')}
            />
            <SettingsRow icon={Languages} label="Ngôn ngữ" detail="Tiếng Việt" />
          </CardContent>
        </Card>
      </View>
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          Tài khoản và hỗ trợ
        </Text>
        <Card className="rounded-xl py-0 shadow-none">
          <CardContent className="px-1 py-1">
            <SettingsRow
              icon={ShieldCheck}
              label="Quản lý tài khoản"
              onPress={() => router.push('/settings/account')}
            />
            <SettingsRow
              icon={Info}
              label="Giới thiệu"
              onPress={() => router.push('/settings/about')}
            />
            <SettingsRow icon={LogOut} label="Đăng xuất" destructive onPress={signOut} />
          </CardContent>
        </Card>
      </View>
    </SettingsContent>
  );
}
