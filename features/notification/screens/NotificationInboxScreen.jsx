import { Bell, RefreshCw } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, View } from 'react-native';

import { ActionNotice } from '@/components/shared/ActionNotice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

import { useNotificationInbox, useNotificationReadActions } from '../hooks/useNotifications';

export default function NotificationInboxScreen() {
  const [tab, setTab] = useState('unread');
  const query = useNotificationInbox();
  const actions = useNotificationReadActions(query);
  const rows = (query.data?.notifications || []).filter((item) => item.isRead === (tab === 'read'));
  const error =
    actions.error || (query.isError ? 'Chưa tải được thông báo. Vui lòng thử lại.' : '');

  function confirmReadAll() {
    const title = 'Đánh dấu tất cả thông báo là đã đọc?';
    if (Platform.OS === 'web') {
      if (globalThis.confirm(title)) actions.markRead('all');
      return;
    }
    Alert.alert(title, undefined, [
      { text: 'Quay lại', style: 'cancel' },
      { text: 'Đánh dấu đã đọc', onPress: () => actions.markRead('all') },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshing={query.isRefetching && !actions.busy}
        onRefresh={actions.reload}
        ListHeaderComponent={
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-2">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="unread">
                    <Text className="text-xs">Chưa đọc</Text>
                  </TabsTrigger>
                  <TabsTrigger value="read">
                    <Text className="text-xs">Đã đọc</Text>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                size="sm"
                variant="outline"
                accessibilityLabel="Làm mới thông báo"
                disabled={actions.busy || query.isFetching}
                onPress={actions.reload}>
                <Icon as={RefreshCw} size={15} />
              </Button>
            </View>
            {tab === 'unread' && query.isSuccess && query.data.unreadCount > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                className="self-end"
                disabled={actions.busy}
                onPress={confirmReadAll}>
                <Text className="text-xs">Đánh dấu tất cả đã đọc</Text>
              </Button>
            ) : null}
            <ActionNotice message={error ? { error: true, text: error } : null} />
          </View>
        }
        ListEmptyComponent={
          query.isPending ? (
            <ActivityIndicator accessibilityLabel="Đang tải thông báo" />
          ) : !error ? (
            <Text className="py-6 text-center text-sm text-muted-foreground">
              {tab === 'unread' ? 'Không có thông báo chưa đọc.' : 'Chưa có thông báo đã đọc.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const content = (
            <Card className="flex-row items-start gap-3 p-4 shadow-none">
              <View
                className={item.isRead ? 'rounded-lg bg-muted p-2' : 'rounded-lg bg-brand/20 p-2'}>
                <Icon as={Bell} size={16} />
              </View>
              <View className="min-w-0 flex-1 gap-1.5">
                <Text className="text-sm font-semibold">{item.title || 'Thông báo'}</Text>
                {item.body ? (
                  <Text className="text-xs leading-5 text-muted-foreground">{item.body}</Text>
                ) : null}
                {item.createdAt ? (
                  <Text className="text-[11px] text-muted-foreground">{item.createdAt}</Text>
                ) : null}
              </View>
            </Card>
          );
          return item.isRead ? (
            content
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Đánh dấu thông báo này đã đọc"
              disabled={actions.busy || !query.isSuccess}
              onPress={() => actions.markRead(item.id)}
              className="active:opacity-75">
              {content}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
