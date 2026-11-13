import { Bell, ChevronDown, Clock } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { SorakLogo } from '@/components/shared/SorakLogo';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

function HeaderIconButton({ icon, label, onPress, children }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      className="size-10 items-center justify-center rounded-xl border border-border bg-background active:bg-accent">
      <Icon as={icon} size={18} />
      {children}
    </Pressable>
  );
}

// Header Home gọn: logo, ngữ cảnh lớp (GV) hoặc bé (PH), các nút nhanh và avatar mở Cài đặt.
export function HomeHeader({
  title,
  subtitle,
  avatarUser,
  unreadCount,
  onTitlePress,
  titleLabel,
  onActivityJournal,
  onNotifications,
  onSettings,
}) {
  const t = useTranslation();
  const hasUnread = Number.isInteger(unreadCount) && unreadCount > 0;
  const context = (
    <View className="min-w-0 flex-1 gap-0.5">
      <View className="flex-row items-center gap-1">
        <Text numberOfLines={1} className="shrink text-sm font-semibold tracking-tight">
          {title}
        </Text>
        {onTitlePress ? (
          <Icon as={ChevronDown} size={14} className="text-muted-foreground" />
        ) : null}
      </View>
      {subtitle ? (
        <Text numberOfLines={1} className="text-2xs text-muted-foreground">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} className="border-b border-border bg-background">
      <View className="mx-auto w-full max-w-xl flex-row items-center gap-2.5 px-4 py-2.5">
        <SorakLogo size={30} />
        {onTitlePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={titleLabel}
            onPress={onTitlePress}
            className={cn('min-w-0 flex-1 rounded-lg py-1 active:opacity-70')}>
            {context}
          </Pressable>
        ) : (
          context
        )}
        {onActivityJournal ? (
          <HeaderIconButton
            icon={Clock}
            label={t('Nhật ký hoạt động ở trường')}
            onPress={onActivityJournal}
          />
        ) : null}
        <HeaderIconButton
          icon={Bell}
          label={
            hasUnread ? t('Thông báo, {count} chưa đọc', { count: unreadCount }) : t('Thông báo')
          }
          onPress={onNotifications}>
          {hasUnread ? (
            <View className="absolute -right-1.5 -top-1.5 h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-primary px-1">
              <Text className="font-mono text-2xs font-semibold text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </HeaderIconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Mở cài đặt tài khoản')}
          hitSlop={4}
          onPress={onSettings}
          className="rounded-full active:opacity-75">
          <AccountAvatar user={avatarUser} className="size-10" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
