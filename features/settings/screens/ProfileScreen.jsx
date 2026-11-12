import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AccountHeader } from '../components/AccountHeader';
import { SettingsContent } from '../components/SettingsContent';
import { SettingsSection } from '../components/SettingsRow';

export default function ProfileScreen() {
  const t = useTranslation();
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const fields = [
    [t('Họ và tên'), user.fullName || user.name],
    [t('Số điện thoại'), user.phone, true],
    ['Email', user.email],
    [t('Địa chỉ'), user.address || user.teacher?.address || user.student?.address],
  ];

  return (
    <SettingsContent>
      <View className="border-b border-border pb-5">
        <AccountHeader user={user} />
      </View>
      <SettingsSection title={t('Thông tin cá nhân')} footer={t('Hồ sơ do nhà trường quản lý')}>
        {fields.map(([label, value, mono]) => (
          <View key={label} className="gap-1 rounded-lg bg-muted/70 px-3 py-2.5 dark:bg-muted/60">
            <Text className="text-2xs text-muted-foreground">{label}</Text>
            <Text className={mono && value ? 'font-mono text-xs' : 'text-xs'}>
              {value || t('Chưa có thông tin')}
            </Text>
          </View>
        ))}
      </SettingsSection>
    </SettingsContent>
  );
}
