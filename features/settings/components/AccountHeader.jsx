import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { roleLabel } from '@/features/auth/utils/auth-roles';

export function AccountHeader({ user }) {
  const name = user.fullName || user.name || user.username || 'Tài khoản Sorak';
  const code = user.employeeCode || user.studentCode || user.student?.studentCode || user.username;
  return (
    <View className="flex-row items-center gap-3.5">
      <AccountAvatar user={user} className="size-14" />
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="text-sm font-semibold">{name}</Text>
          <Badge variant="brand">
            <Text className="text-[10px]">{roleLabel(user.role)}</Text>
          </Badge>
        </View>
        {code ? <Text className="text-xs text-muted-foreground">{code}</Text> : null}
      </View>
    </View>
  );
}
