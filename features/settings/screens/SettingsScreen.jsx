import { useRouter } from 'expo-router';
import {
  Info,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useSession } from '@/features/auth/hooks/useSession';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { useLanguagePreference, useTranslation } from '@/shared/i18n/useLanguage';

import { AccountHeader } from '../components/AccountHeader';
import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow } from '../components/SettingsRow';
import { useThemePreference } from '../hooks/useThemePreference';

export default function SettingsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user, signOut } = useSession();
  const { colorScheme } = useThemePreference();
  const { language } = useLanguagePreference();
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
            label={t('Hồ sơ cá nhân')}
            onPress={() => router.push('/settings/profile')}
          />
        </CardContent>
      </Card>
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          {t('Tùy chọn')}
        </Text>
        <Card className="rounded-xl py-0 shadow-none">
          <CardContent className="px-1 py-1">
            <SettingsRow
              icon={isDark ? Moon : Sun}
              label={t('Giao diện')}
              detail={isDark ? t('Tối') : t('Sáng')}
              onPress={() => router.push('/settings/appearance')}
            />
            <SettingsRow
              icon={Languages}
              label={t('Ngôn ngữ')}
              detail={language === 'en' ? 'English' : 'Tiếng Việt'}
              onPress={() => router.push('/settings/language')}
            />
          </CardContent>
        </Card>
      </View>
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
          {t('Tài khoản và hỗ trợ')}
        </Text>
        <Card className="rounded-xl py-0 shadow-none">
          <CardContent className="px-1 py-1">
            <SettingsRow
              icon={ShieldCheck}
              label={t('Quản lý tài khoản')}
              onPress={() => router.push('/settings/account')}
            />
            {user.role === AUTH_ROLES.parent ? (
              <SettingsRow
                icon={UsersRound}
                label={t('Chuyển tài khoản')}
                onPress={() => router.push('/accounts')}
              />
            ) : null}
            <SettingsRow
              icon={Info}
              label={t('Giới thiệu')}
              onPress={() => router.push('/settings/about')}
            />
            <SettingsRow
              icon={LogOut}
              label={t(user.role === AUTH_ROLES.parent ? 'Đăng xuất tài khoản này' : 'Đăng xuất')}
              destructive
              onPress={signOut}
            />
          </CardContent>
        </Card>
      </View>
    </SettingsContent>
  );
}
