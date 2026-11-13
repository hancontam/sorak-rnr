import { useRouter } from 'expo-router';
import { Check, LogOut, Plus, Settings } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { useAccounts } from '../hooks/useAccounts';
import { AUTH_ROLES } from '../utils/auth-roles';

export default function AccountsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { accounts, activeId, status, error, notice, busy, choose, remove } = useAccounts();
  const signedIn = status === 'signed-in';

  function login(accountId) {
    router.push({
      pathname: signedIn ? '/add-account' : '/auth/login',
      params: { role: AUTH_ROLES.parent, accountId },
    });
  }

  function confirmRemove(account) {
    Alert.alert(t('Đăng xuất tài khoản này?'), account.username, [
      { text: t('Hủy'), style: 'cancel' },
      {
        text: t('Đăng xuất'),
        style: 'destructive',
        onPress: async () => {
          if (await remove(account.id))
            toast.success(t('Đã đăng xuất {name}', { name: account.username }));
        },
      },
    ]);
  }

  function chooseAccount(account) {
    if (account.requiresLogin) {
      login(account.id);
      return;
    }
    if (account.id === activeId) {
      if (router.canGoBack()) router.back();
      else router.replace('/(parent)/(tabs)/child-profile');
      return;
    }
    choose(account.id).then((ok) => {
      if (ok)
        toast.success(t('Đã chuyển sang {name}', { name: account.fullName || account.username }));
    });
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="mx-auto w-full max-w-md gap-3 p-4 pb-8">
      <Text className="text-xs leading-5 text-muted-foreground">
        {t('Chọn bé để xem hồ sơ, thời khóa biểu và thông báo của bé đó.')}
      </Text>
      <ActionNotice message={error || notice ? { error: true, text: t(error || notice) } : null} />
      {accounts.map((account) => (
        <Card key={account.id} className="flex-row items-center gap-2 rounded-xl p-3 shadow-none">
          <Pressable
            disabled={busy}
            onPress={() => chooseAccount(account)}
            accessibilityRole="button"
            accessibilityLabel={t('Chuyển sang {name}', {
              name: account.fullName || account.username,
            })}
            className="min-w-0 flex-1 flex-row items-center gap-3">
            <AccountAvatar user={account} className="size-10" />
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-sm font-semibold" numberOfLines={2}>
                {account.fullName || account.username}
              </Text>
              <Text className="text-xs text-muted-foreground">{account.username}</Text>
              {account.requiresLogin ? (
                <Text className="text-[11px] text-brand-link">{t('Đăng nhập lại')}</Text>
              ) : null}
            </View>
            {account.id === activeId ? (
              <Badge variant="secondary">
                <Icon as={Check} size={12} />
                <Text className="text-[10px]">{t('Đang dùng')}</Text>
              </Badge>
            ) : null}
          </Pressable>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={busy}
            onPress={() => confirmRemove(account)}
            accessibilityLabel={t('Đăng xuất {name}', {
              name: account.fullName || account.username,
            })}>
            <Icon as={LogOut} size={15} className="text-muted-foreground" />
          </Button>
        </Card>
      ))}
      <Button variant="outline" size="sm" disabled={busy} onPress={() => login()}>
        <Icon as={Plus} size={15} />
        <Text className="text-xs">{t('Thêm tài khoản')}</Text>
      </Button>
      <Text className="text-[11px] leading-4 text-muted-foreground">
        {t('Đăng xuất chỉ xóa phiên của tài khoản được chọn trên thiết bị này.')}
      </Text>
      {signedIn ? (
        <Button variant="ghost" size="sm" onPress={() => router.push('/settings')}>
          <Icon as={Settings} size={15} />
          <Text className="text-xs">{t('Cài đặt')}</Text>
        </Button>
      ) : null}
    </ScrollView>
  );
}
