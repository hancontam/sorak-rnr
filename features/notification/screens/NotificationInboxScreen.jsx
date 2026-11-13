import { Bell, BellOff, CheckCheck, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, View } from 'react-native';
import { toast } from 'sonner-native';

import { ActionNotice } from '@/components/shared/ActionNotice';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { useNotificationInbox, useNotificationReadActions } from '../hooks/useNotifications';

export default function NotificationInboxScreen() {
  const t = useTranslation();
  const [tab, setTab] = useState('unread');
  const [confirm, setConfirm] = useState(null);
  const query = useNotificationInbox();
  const actions = useNotificationReadActions(query);
  const all = query.data?.notifications || [];
  const rows = all.filter((item) => item.isRead === (tab === 'read'));
  const unread = query.data?.unreadCount;
  const readCount = all.filter((item) => item.isRead).length;
  const error =
    actions.error || (query.isError ? t('Chưa tải được thông báo. Vui lòng thử lại.') : '');

  async function readAll() {
    if (await actions.markRead('all')) toast.success(t('Đã đánh dấu tất cả là đã đọc'));
  }

  function confirmReadAll() {
    setConfirm({
      title: t('Đánh dấu tất cả thông báo là đã đọc?'),
      cancelLabel: t('Quay lại'),
      confirmLabel: t('Đánh dấu đã đọc'),
      onConfirm: readAll,
    });
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl px-4 pb-8 pt-4"
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshing={query.isRefetching && !actions.busy}
        onRefresh={actions.reload}
        ListHeaderComponent={
          <View className="gap-3 pb-3">
            <View className="flex-row items-center gap-2">
              <Tabs value={tab} onValueChange={setTab} className="flex-1">
                <TabsList className="w-full">
                  <TabsTrigger value="unread" className="flex-1">
                    <Text>{t('Chưa đọc')}</Text>
                    {Number.isInteger(unread) ? (
                      <Text className="font-mono text-2xs text-muted-foreground">{unread}</Text>
                    ) : null}
                  </TabsTrigger>
                  <TabsTrigger value="read" className="flex-1">
                    <Text>{t('Đã đọc')}</Text>
                    {query.isSuccess ? (
                      <Text className="font-mono text-2xs text-muted-foreground">{readCount}</Text>
                    ) : null}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                size="icon"
                variant="outline"
                className="size-9 rounded-xl"
                accessibilityLabel={t('Làm mới thông báo')}
                disabled={actions.busy || query.isFetching}
                onPress={actions.reload}>
                <Icon as={RefreshCw} size={16} />
              </Button>
            </View>
            {tab === 'unread' && query.isSuccess && unread > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                className="self-end"
                disabled={actions.busy}
                onPress={confirmReadAll}>
                <Icon as={CheckCheck} size={14} />
                <Text>{t('Đánh dấu tất cả đã đọc')}</Text>
              </Button>
            ) : null}
            <ActionNotice message={error ? { error: true, text: t(error) } : null} />
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            <ActivityIndicator className="py-10" accessibilityLabel={t('Đang tải thông báo')} />
          ) : !error ? (
            <View className="items-center gap-2 rounded-2xl border border-dashed border-border px-5 py-8">
              <View className="mb-1 size-10 items-center justify-center rounded-xl bg-muted">
                <Icon as={BellOff} size={20} className="text-muted-foreground" />
              </View>
              <Text className="text-center text-sm font-semibold">
                {tab === 'unread'
                  ? t('Không có thông báo chưa đọc.')
                  : t('Chưa có thông báo đã đọc.')}
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const first = index === 0;
          const last = index === rows.length - 1;
          const content = (
            <>
              <View className="size-9 items-center justify-center rounded-lg bg-muted">
                <Icon as={Bell} size={16} className={item.isRead ? 'text-muted-foreground' : ''} />
                {!item.isRead ? (
                  <View className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-brand" />
                ) : null}
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  className={cn(
                    'text-sm leading-5',
                    item.isRead ? 'font-medium' : 'font-semibold'
                  )}>
                  {item.title || t('Thông báo')}
                </Text>
                {item.body ? (
                  <Text numberOfLines={3} className="text-xs leading-5 text-muted-foreground">
                    {item.body}
                  </Text>
                ) : null}
                {item.createdAt ? (
                  <Text className="font-mono text-2xs text-muted-foreground">{item.createdAt}</Text>
                ) : null}
              </View>
            </>
          );
          // Danh sách trong một Card: bo góc ở dòng đầu/cuối, đường kẻ mảnh giữa các dòng.
          const rowClass = cn(
            'flex-row items-start gap-3 border-x border-t border-border bg-card px-4 py-3.5',
            first && 'rounded-t-2xl',
            last && 'rounded-b-2xl border-b'
          );
          return item.isRead ? (
            <View className={rowClass}>{content}</View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityHint={t('Đánh dấu thông báo này đã đọc')}
              disabled={actions.busy || !query.isSuccess}
              onPress={() => actions.markRead(item.id)}
              className={cn(rowClass, 'active:bg-muted/60')}>
              {content}
            </Pressable>
          );
        }}
      />
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </View>
  );
}
