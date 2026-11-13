import { Tabs, useRouter } from 'expo-router';
import { Baby, CalendarDays, GraduationCap, LayoutGrid } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { useAccounts } from '@/features/auth/hooks/useAccounts';
import { useSession } from '@/features/auth/hooks/useSession';
import { assignedClass } from '@/features/auth/utils/class-assignment';
import { describeAccount } from '@/features/auth/utils/linked-accounts';
import { PushPermissionSheet } from '@/features/notification/components/PushPermissionSheet';
import { useNotificationInbox } from '@/features/notification/hooks/useNotifications';
import { usePushSettings } from '@/features/notification/hooks/usePushPreference';
import { FONT_FAMILY } from '@/lib/fonts';
import { THEME } from '@/lib/theme';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { AccountSwitchSheet } from '../components/AccountSwitchSheet';
import { HomeHeader } from '../components/HomeHeader';

export function HomeTabs({ role }) {
  const t = useTranslation();
  const router = useRouter();
  const { user, notice, loginSucceeded, dismissLoginSuccess } = useSession();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const isParent = role === 'parent';
  const inbox = useNotificationInbox();
  const accounts = useAccounts();
  const push = usePushSettings();
  const [pushPromptClosed, setPushPromptClosed] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);

  // Kết quả đăng nhập và thông báo phiên hiện bằng toast chung (sonner) thay cho thẻ nổi riêng.
  useEffect(() => {
    if (!loginSucceeded) return;
    toast.success(t('Đăng nhập hoàn tất!'), { description: t('Bạn đã kết nối với Sorak.') });
    dismissLoginSuccess();
  }, [dismissLoginSuccess, loginSucceeded, t]);

  useEffect(() => {
    if (notice) toast.error(t(notice));
  }, [notice, t]);

  if (!user) return null;
  const showPushPrompt =
    !pushPromptClosed &&
    push.supported &&
    push.ready &&
    push.preference === 'unset' &&
    // Android 13+ trả 'denied' + canAskAgain trước lần hỏi đầu, nên không dựa vào 'undetermined'.
    push.permission?.granted === false &&
    push.permission.canAskAgain;

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
    setSwitchOpen(false);
    if (account.id === user.id && !account.requiresLogin) return;
    if (account.requiresLogin) {
      router.push({ pathname: '/add-account', params: { accountId: account.id } });
      return;
    }
    void accounts.choose(account.id);
  }

  // Ngữ cảnh ở header: lớp được phân công (GV) hoặc bé của tài khoản đang dùng (PH).
  const assignment = isParent ? null : assignedClass(user);
  const title = isParent
    ? currentAccount.fullName || currentAccount.username
    : assignment?.className || 'Sorak';
  const subtitle = isParent
    ? user.student?.className
    : assignment?.classId
      ? assignment.schoolYearName
      : t('Chưa được phân công lớp');

  return (
    <View className="flex-1 bg-background">
      <Tabs
        screenOptions={{
          header: () => (
            <HomeHeader
              title={title}
              subtitle={subtitle}
              avatarUser={isParent ? currentAccount : user}
              unreadCount={inbox.data?.unreadCount}
              onTitlePress={isParent ? () => setSwitchOpen(true) : undefined}
              titleLabel={t('Chuyển tài khoản, đang dùng {name}', { name: title })}
              onActivityJournal={
                isParent ? () => router.push('/(parent)/activity-journal') : undefined
              }
              onNotifications={() =>
                router.push(isParent ? '/(parent)/notifications' : '/(teacher)/notifications')
              }
              onSettings={() => router.push('/settings')}
            />
          ),
          tabBarActiveTintColor: theme.foreground,
          tabBarInactiveTintColor: theme.mutedForeground,
          tabBarLabelStyle: { fontSize: 11, fontFamily: FONT_FAMILY.sans.medium },
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingTop: 4,
          },
        }}>
        <Tabs.Screen
          name={isParent ? 'child-profile' : 'overview'}
          options={{
            title: isParent ? t('Hồ sơ trẻ') : t('Tổng quan lớp'),
            tabBarIcon: ({ color }) =>
              isParent ? <Baby size={20} color={color} /> : <LayoutGrid size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="timetable"
          options={{
            title: t('Thời khóa biểu'),
            tabBarIcon: ({ color }) => <CalendarDays size={20} color={color} />,
          }}
        />
        <Tabs.Screen
          name="learning-results"
          options={{
            title: t('Kết quả học tập'),
            tabBarIcon: ({ color }) => <GraduationCap size={20} color={color} />,
          }}
        />
      </Tabs>
      {isParent ? (
        <AccountSwitchSheet
          open={switchOpen}
          onOpenChange={setSwitchOpen}
          currentAccount={currentAccount}
          accounts={accounts.accounts}
          busy={accounts.busy}
          onSelect={selectAccount}
          onAdd={() => {
            setSwitchOpen(false);
            router.push('/add-account');
          }}
        />
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
