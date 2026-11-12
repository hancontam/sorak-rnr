import { BadgeCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { roleLabel } from '@/features/auth/utils/auth-roles';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function AccountHeader({ user }) {
  const t = useTranslation();
  const name = user.fullName || user.name || user.username || t('Tài khoản Sorak');
  const code = user.employeeCode || user.studentCode || user.student?.studentCode || user.username;
  return (
    <View className="flex-row items-center gap-3.5">
      <AccountAvatar user={user} className="size-14 border-2 border-border" />
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="text-base font-semibold tracking-tight">{name}</Text>
          <Badge variant="brand">
            <Icon as={BadgeCheck} size={12} className="text-brand-foreground" />
            <Text>{t(roleLabel(user.role))}</Text>
          </Badge>
        </View>
        {code ? <Text className="font-mono text-2xs text-muted-foreground">{code}</Text> : null}
        {user.email ? (
          <Text numberOfLines={1} className="text-2xs text-muted-foreground">
            {user.email}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
