import { Bell, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { SorakLogo } from '@/components/shared/SorakLogo';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { roleLabel } from '@/features/auth/utils/auth-roles';

export function HomeHeader({ user, onSettings, onNotifications, unreadCount }) {
  const hasUnread = Number.isInteger(unreadCount) && unreadCount > 0;
  return (
    <SafeAreaView edges={['top']} className="border-b border-border bg-background">
      <View className="mx-auto w-full max-w-xl flex-row items-center justify-between gap-3 px-4 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <SorakLogo size={28} />
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-semibold">Sorak</Text>
              <Badge variant="brand">
                <Text className="text-[10px]">{roleLabel(user.role)}</Text>
              </Badge>
            </View>
            <Text numberOfLines={1} className="text-[10px] text-muted-foreground">
              Trường Mầm Non Hòn Tre
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hasUnread ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
          hitSlop={6}
          onPress={onNotifications}
          className="size-9 items-center justify-center rounded-xl border border-border bg-background active:opacity-75">
          <Icon as={Bell} size={17} />
          {hasUnread ? (
            <Badge className="absolute -right-1.5 -top-1.5 min-w-[16px] px-1 py-0">
              <Text className="text-[9px]">{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </Badge>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mở cài đặt tài khoản"
          hitSlop={6}
          onPress={onSettings}
          className="max-w-[40%] flex-row items-center gap-1.5 rounded-full border border-border bg-muted/30 p-1 pr-2">
          <AccountAvatar user={user} className="size-7" />
          <Text numberOfLines={1} className="shrink text-[11px] font-medium">
            {user.username || user.employeeCode || user.student?.studentCode || user.fullName}
          </Text>
          <Icon as={ChevronRight} size={12} className="text-muted-foreground" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
