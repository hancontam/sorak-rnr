import { Check, ChevronDown, Plus } from 'lucide-react-native';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function AccountDropdown({ currentAccount, accounts, busy, onSelect, onAdd }) {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const name = currentAccount.fullName || currentAccount.username;

  return (
    <DropdownMenu className="min-w-0 shrink">
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 max-w-[112px] gap-2 rounded-full px-3"
          disabled={busy}
          accessibilityLabel={t('Chuyển tài khoản, đang dùng {name}', { name })}>
          <Text numberOfLines={1} className="shrink text-xs font-medium">
            {name}
          </Text>
          <Icon as={ChevronDown} size={14} className="shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        insets={{ top: insets.top + 8, bottom: insets.bottom + 8, left: 16, right: 16 }}
        style={{ width: Math.min(256, width - 32) }}
        className="rounded-xl p-1.5">
        <ScrollView
          style={{ maxHeight: Math.min(280, height * 0.45) }}
          keyboardShouldPersistTaps="handled">
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.id}
              textValue={account.fullName || account.username}
              disabled={busy}
              className="gap-2.5 rounded-lg px-2 py-2.5"
              onPress={() => onSelect(account)}>
              <AccountAvatar user={account} className="size-8" />
              <View className="min-w-0 flex-1 gap-0.5">
                <Text numberOfLines={2} className="text-xs font-medium">
                  {account.fullName || account.username}
                </Text>
                <Text className="text-[10px] text-muted-foreground">{account.username}</Text>
                {account.requiresLogin ? (
                  <Text className="text-[10px] text-brand-link">{t('Đăng nhập lại')}</Text>
                ) : null}
              </View>
              {account.id === currentAccount.id ? (
                <Icon as={Check} size={15} accessibilityLabel={t('Đang dùng')} />
              ) : null}
            </DropdownMenuItem>
          ))}
        </ScrollView>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={busy} className="rounded-lg" onPress={onAdd}>
          <Icon as={Plus} size={16} />
          <Text className="text-xs font-medium">{t('Thêm tài khoản')}</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
