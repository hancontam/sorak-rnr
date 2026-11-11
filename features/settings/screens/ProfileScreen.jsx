import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AccountHeader } from '../components/AccountHeader';
import { SettingsContent } from '../components/SettingsContent';

export default function ProfileScreen() {
  const t = useTranslation();
  const user = useAuthStore((state) => state.user);
  if (!user) return null;

  const fields = [
    [t('Họ và tên'), user.fullName || user.name],
    [t('Số điện thoại'), user.phone],
    ['Email', user.email],
    [t('Địa chỉ'), user.address || user.teacher?.address || user.student?.address],
  ];

  return (
    <SettingsContent>
      <AccountHeader user={user} />
      <Text className="text-xs text-muted-foreground">{t('Hồ sơ do nhà trường quản lý')}</Text>
      {fields.map(([label, value]) => (
        <View key={label} className="gap-1.5">
          <Text className="text-xs font-semibold">{label}</Text>
          <View className="min-h-10 justify-center rounded-xl border border-border px-3 py-2">
            <Text className="text-xs leading-5">{value || t('Chưa có thông tin')}</Text>
          </View>
        </View>
      ))}
    </SettingsContent>
  );
}
