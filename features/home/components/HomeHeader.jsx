import { Bell, Clock } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { SorakLogo } from '@/components/shared/SorakLogo';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { roleLabel } from '@/features/auth/utils/auth-roles';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function HomeHeader({
  user,
  onSettings,
  accountMenu,
  avatarUser = user,
  onNotifications,
  onActivityJournal,
  unreadCount,
}) {
  const t = useTranslation();
  const hasUnread = Number.isInteger(unreadCount) && unreadCount > 0;
  return (
    <SafeAreaView edges={['top']} className="border-b border-border bg-background">
      <View className="mx-auto w-full max-w-xl flex-row items-center justify-between gap-2 px-4 py-2.5">
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <SorakLogo size={28} />
          <View className="min-w-0 flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-1.5">
              <Text className="text-sm font-semibold">Sorak</Text>
              <Badge variant="brand">
                <Text className="text-[10px]">{t(roleLabel(user.role))}</Text>
              </Badge>
            </View>
            <Text numberOfLines={1} className="text-[10px] text-muted-foreground">
              {t('Trường Mầm Non Hòn Tre')}
            </Text>
          </View>
        </View>
        {onActivityJournal ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Nhật ký hoạt động ở trường')}
            hitSlop={4}
            onPress={onActivityJournal}
            className="size-9 items-center justify-center rounded-xl border border-border bg-background active:opacity-75">
            <Icon as={Clock} size={17} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            hasUnread ? t('Thông báo, {count} chưa đọc', { count: unreadCount }) : t('Thông báo')
          }
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
        <View className="max-w-[45%] shrink flex-row items-center gap-2">
          {accountMenu || (
            <Text numberOfLines={1} className="shrink text-[11px] font-medium">
              {user.username || user.employeeCode || user.fullName}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Mở cài đặt tài khoản')}
            hitSlop={4}
            onPress={onSettings}
            className="size-9 shrink-0 items-center justify-center rounded-full active:opacity-75">
            <AccountAvatar user={avatarUser} className="size-9" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
