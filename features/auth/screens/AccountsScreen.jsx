import { useRouter } from 'expo-router';
import { LogOut, Plus, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { useAccounts } from '../hooks/useAccounts';
import { AUTH_ROLES } from '../utils/auth-roles';

export default function AccountsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const { accounts, activeId, status, error, notice, busy, choose, remove } = useAccounts();
  const [confirm, setConfirm] = useState(null);
  const signedIn = status === 'signed-in';

  function login(accountId) {
    router.push({
      pathname: signedIn ? '/add-account' : '/auth/login',
      params: { role: AUTH_ROLES.parent, accountId },
    });
  }

  function confirmRemove(account) {
    setConfirm({
      title: t('Đăng xuất tài khoản này?'),
      description: account.username,
      cancelLabel: t('Hủy'),
      confirmLabel: t('Đăng xuất'),
      destructive: true,
      onConfirm: async () => {
        if (await remove(account.id))
          toast.success(t('Đã đăng xuất {name}', { name: account.username }));
      },
    });
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
      contentContainerClassName="mx-auto w-full max-w-md gap-4 p-4 pb-8">
      <Text className="text-xs leading-5 text-muted-foreground">
        {t('Chọn bé để xem hồ sơ, thời khóa biểu và thông báo của bé đó.')}
      </Text>
      <ActionNotice message={error || notice ? { error: true, text: t(error || notice) } : null} />
      <Card className="gap-0 overflow-hidden py-0">
        {accounts.map((account, index) => (
          <View
            key={account.id}
            className={cn(
              'flex-row items-center gap-2 pr-2',
              index > 0 && 'border-t border-border'
            )}>
            <Pressable
              disabled={busy}
              onPress={() => chooseAccount(account)}
              accessibilityRole="button"
              accessibilityLabel={t('Chuyển sang {name}', {
                name: account.fullName || account.username,
              })}
              className="min-h-16 min-w-0 flex-1 flex-row items-center gap-3 py-3 pl-4 active:opacity-70">
              <AccountAvatar user={account} className="size-10" />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-sm font-semibold" numberOfLines={1}>
                  {account.fullName || account.username}
                </Text>
                <Text className="font-mono text-2xs text-muted-foreground">{account.username}</Text>
                {account.requiresLogin ? (
                  <Text className="text-2xs text-brand-link">{t('Đăng nhập lại')}</Text>
                ) : null}
              </View>
              {account.id === activeId ? (
                <Badge variant="secondary">
                  <Text>{t('Đang dùng')}</Text>
                </Badge>
              ) : null}
            </Pressable>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              disabled={busy}
              onPress={() => confirmRemove(account)}
              accessibilityLabel={t('Đăng xuất {name}', {
                name: account.fullName || account.username,
              })}>
              <Icon as={LogOut} size={16} className="text-muted-foreground" />
            </Button>
          </View>
        ))}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => login()}
          className={cn(
            'min-h-14 flex-row items-center gap-3 px-4 py-3 active:bg-muted/60',
            accounts.length > 0 && 'border-t border-border'
          )}>
          <View className="size-10 items-center justify-center rounded-full border border-dashed border-border">
            <Icon as={Plus} size={16} />
          </View>
          <Text className="text-sm font-semibold">{t('Thêm tài khoản')}</Text>
        </Pressable>
      </Card>
      <Text className="text-2xs leading-4 text-muted-foreground">
        {t('Đăng xuất chỉ xóa phiên của tài khoản được chọn trên thiết bị này.')}
      </Text>
      {signedIn ? (
        <Button variant="ghost" onPress={() => router.push('/settings')}>
          <Icon as={Settings} size={16} />
          <Text>{t('Cài đặt')}</Text>
        </Button>
      ) : null}
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </ScrollView>
  );
}
