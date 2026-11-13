import { Check, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

// Chọn tài khoản PH trên máy (mỗi bé một tài khoản), mở từ tên bé ở header.
export function AccountSwitchSheet({
  open,
  onOpenChange,
  currentAccount,
  accounts,
  busy,
  onSelect,
  onAdd,
}) {
  const t = useTranslation();
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t('Chuyển tài khoản')}
      description={t('Chọn bé để xem hồ sơ, thời khóa biểu và thông báo của bé đó.')}
      closeLabel={t('Đóng')}
      scrollable>
      <View className="gap-1">
        {accounts.map((account) => {
          const active = account.id === currentAccount.id;
          return (
            <Pressable
              key={account.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, disabled: busy }}
              disabled={busy}
              onPress={() => onSelect(account)}
              className={cn(
                'min-h-14 flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-muted',
                active && 'bg-muted/60'
              )}>
              <AccountAvatar user={account} className="size-9" />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text numberOfLines={1} className="text-xs font-semibold">
                  {account.fullName || account.username}
                </Text>
                <Text className="font-mono text-2xs text-muted-foreground">{account.username}</Text>
                {account.requiresLogin ? (
                  <Text className="text-2xs text-brand-link">{t('Đăng nhập lại')}</Text>
                ) : null}
              </View>
              {active ? <Icon as={Check} size={16} accessibilityLabel={t('Đang dùng')} /> : null}
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={onAdd}
          className="min-h-12 flex-row items-center gap-3 rounded-xl px-3 py-2.5 active:bg-muted">
          <View className="size-9 items-center justify-center rounded-full border border-dashed border-border">
            <Icon as={Plus} size={16} />
          </View>
          <Text className="text-xs font-semibold">{t('Thêm tài khoản')}</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
