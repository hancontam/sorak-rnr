import { useRouter } from 'expo-router';
import {
  Bell,
  Contrast,
  Info,
  Languages,
  LogOut,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { View } from 'react-native';

import { useSession } from '@/features/auth/hooks/useSession';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { usePushSettings } from '@/features/notification/hooks/usePushPreference';
import { useLanguagePreference, useTranslation } from '@/shared/i18n/useLanguage';

import { AccountHeader } from '../components/AccountHeader';
import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
import { useThemePreference } from '../hooks/useThemePreference';

export default function SettingsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { user, signOut } = useSession();
  const { colorScheme } = useThemePreference();
  const { language } = useLanguagePreference();
  const push = usePushSettings();
  if (!user) return null;

  const isParent = user.role === AUTH_ROLES.parent;
  return (
    <SettingsContent>
      <View className="border-b border-border pb-5">
        <AccountHeader user={user} />
      </View>

      <SettingsSection title={t('Cá nhân')}>
        <SettingsRow
          icon={UserRound}
          label={t('Hồ sơ cá nhân')}
          onPress={() => router.push('/settings/profile')}
        />
      </SettingsSection>

      <SettingsSection title={t('Tùy chọn')}>
        <SettingsRow
          icon={Contrast}
          label={t('Giao diện')}
          value={colorScheme === 'dark' ? t('Tối') : t('Sáng')}
          onPress={() => router.push('/settings/appearance')}
        />
        <SettingsRow
          icon={Languages}
          label={t('Ngôn ngữ')}
          value={language === 'en' ? 'English' : 'Tiếng Việt'}
          onPress={() => router.push('/settings/language')}
        />
        <SettingsRow
          icon={Bell}
          label={t('Thông báo')}
          value={push.ready ? (push.enabled ? t('Bật') : t('Tắt')) : undefined}
          onPress={() => router.push('/settings/notifications')}
        />
      </SettingsSection>

      <SettingsSection title={t('Hỗ trợ')}>
        <SettingsRow
          icon={Info}
          label={t('Giới thiệu')}
          onPress={() => router.push('/settings/about')}
        />
      </SettingsSection>

      <SettingsSection title={t('Khác')}>
        <SettingsRow
          icon={ShieldCheck}
          label={t('Quản lý tài khoản')}
          onPress={() => router.push('/settings/account')}
        />
        {isParent ? (
          <SettingsRow
            icon={UsersRound}
            label={t('Chuyển tài khoản')}
            onPress={() => router.push('/accounts')}
          />
        ) : null}
        <SettingsRow
          icon={LogOut}
          label={t(isParent ? 'Đăng xuất tài khoản này' : 'Đăng xuất')}
          destructive
          onPress={signOut}
        />
      </SettingsSection>
    </SettingsContent>
  );
}
