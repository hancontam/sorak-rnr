import { Tabs, useRouter } from 'expo-router';
import { Baby, CalendarDays, GraduationCap, LayoutGrid } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { AuthSuccessToast } from '@/features/auth/components/AuthSuccessToast';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { useSession } from '@/features/auth/hooks/useSession';
import { useAccounts } from '@/features/auth/hooks/useAccounts';
import { describeAccount } from '@/features/auth/utils/linked-accounts';
import { PushPermissionSheet } from '@/features/notification/components/PushPermissionSheet';
import { useNotificationInbox } from '@/features/notification/hooks/useNotifications';
import { usePushSettings } from '@/features/notification/hooks/usePushPreference';
import { THEME } from '@/lib/theme';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { HomeHeader } from '../components/HomeHeader';
import { AccountDropdown } from '../components/AccountDropdown';

export function HomeTabs({ role }) {
  const t = useTranslation();
  const router = useRouter();
  const { user, notice, loginSucceeded, dismissLoginSuccess } = useSession();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isParent = role === 'parent';
  const inbox = useNotificationInbox();
  const accounts = useAccounts();
  const push = usePushSettings();
  const [pushPromptClosed, setPushPromptClosed] = useState(false);
  if (!user) return null;
  const showPushPrompt =
    !pushPromptClosed &&
    push.supported &&
    push.ready &&
    push.preference === 'unset' &&
    push.permission?.status === 'undetermined';

  async function enablePush() {
    try {
      if ((await push.enable()) === 'enabled') toast.success(t('Đã bật thông báo trên máy này'));
    } catch {
      toast.error(t('Chưa bật được thông báo. Hãy thử lại trong Cài đặt.'));
    } finally {
      setPushPromptClosed(true);
    }
  }

  function declinePush() {
    setPushPromptClosed(true);
    void push.decline();
  }
  const currentAccount =
    accounts.accounts.find((account) => account.id === user.id) || describeAccount(user);

  function selectAccount(account) {
    if (account.id === user.id && !account.requiresLogin) return;
    if (account.requiresLogin) {
      router.push({ pathname: '/add-account', params: { accountId: account.id } });
      return;
    }
    void accounts.choose(account.id);
  }
  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          header: () => (
            <HomeHeader
              user={user}
              unreadCount={inbox.data?.unreadCount}
              onActivityJournal={
                isParent ? () => router.push('/(parent)/activity-journal') : undefined
              }
              onNotifications={() =>
                router.push(isParent ? '/(parent)/notifications' : '/(teacher)/notifications')
              }
              onSettings={() => router.push('/settings')}
              avatarUser={isParent ? currentAccount : user}
              accountMenu={
                isParent ? (
                  <AccountDropdown
                    currentAccount={currentAccount}
                    accounts={accounts.accounts}
                    busy={accounts.busy}
                    onSelect={selectAccount}
                    onAdd={() => router.push('/add-account')}
                  />
                ) : undefined
              }
            />
          ),
          tabBarActiveTintColor: theme.foreground,
          tabBarInactiveTintColor: theme.mutedForeground,
          tabBarLabelStyle: { fontSize: 11 },
          tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        }}>
        <Tabs.Screen
          name={isParent ? 'child-profile' : 'overview'}
          options={{
            title: isParent ? t('Hồ sơ trẻ') : t('Tổng quan lớp'),
            tabBarIcon: ({ color }) =>
              isParent ? <Baby size={18} color={color} /> : <LayoutGrid size={18} color={color} />,
          }}
        />
        <Tabs.Screen
          name="timetable"
          options={{
            title: t('Thời khóa biểu'),
            tabBarIcon: ({ color }) => <CalendarDays size={18} color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-results"
          options={{
            title: t('Kết quả học tập'),
            tabBarIcon: ({ color }) => <GraduationCap size={18} color={color} />,
          }}
        />
      </Tabs>
      {notice ? (
        <View className="absolute inset-x-4 bottom-20">
          <ActionNotice message={{ error: true, text: t(notice) }} />
        </View>
      ) : null}
      {loginSucceeded ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-x-0 items-center px-4"
          style={{ top: insets.top + 8, zIndex: 20, elevation: 20 }}>
          <AuthSuccessToast
            title={t('Đăng nhập hoàn tất!')}
            description={t('Bạn đã kết nối với Sorak.')}
            onDismiss={dismissLoginSuccess}
          />
        </View>
      ) : null}
      <PushPermissionSheet
        open={showPushPrompt}
        busy={push.busy}
        onEnable={enablePush}
        onLater={declinePush}
      />
    </View>
  );
}
