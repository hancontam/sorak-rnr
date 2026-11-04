import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  getNotifications,
  markNotificationRead,
} from '@/features/notification/api/notification.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  Bell,
  CalendarX,
  ChevronLeft,
  ClipboardCheck,
  HeartPulse,
  RefreshCw,
  UserCheck,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Vừa xong';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getNotificationIcon(item) {
  const type = String(item.type || '').toUpperCase();
  const title = String(item.title || '').toLowerCase();

  if (type.includes('ATTENDANCE') || title.includes('điểm danh')) {
    return ClipboardCheck;
  }
  if (type.includes('LEAVE') || title.includes('nghỉ')) {
    return CalendarX;
  }
  if (type.includes('HEALTH') || title.includes('sức khoẻ') || title.includes('sức khỏe')) {
    return HeartPulse;
  }
  if (type.includes('PICKUP') || title.includes('đón') || title.includes('uỷ thác')) {
    return UserCheck;
  }
  return Bell;
}

export default function NotificationListScreen() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' | 'read'

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () =>
      Alert.alert('Chưa cập nhật được', 'Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại.'),
  });

  const markAllMutation = useMutation({
    mutationFn: async (unreadList) => {
      const results = await Promise.allSettled(
        unreadList.map((item) => markNotificationRead(item.id))
      );
      if (results.some((result) => result.status === 'rejected'))
        throw new Error('Một số thông báo chưa cập nhật được.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => Alert.alert('Chưa cập nhật đủ', error.message),
  });

  const allNotifications = data?.notifications || [];
  const unreadList = useMemo(() => allNotifications.filter((n) => !n.isRead), [allNotifications]);
  const readList = useMemo(() => allNotifications.filter((n) => n.isRead), [allNotifications]);

  const currentList = activeTab === 'unread' ? unreadList : readList;

  const handleMarkAllRead = () => {
    if (unreadList.length > 0 && !markAllMutation.isPending) {
      markAllMutation.mutate(unreadList);
    }
  };

  const handleItemPress = (item) => {
    if (!item.isRead && !markReadMutation.isPending) {
      markReadMutation.mutate(item.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="h-14 flex-row items-center justify-between px-6">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="size-9 items-center justify-center rounded-lg border border-border bg-background">
          <Icon as={ChevronLeft} size={20} strokeWidth={2} className="text-foreground" />
        </Pressable>

        <View className="flex-1 flex-row items-center justify-between pl-3">
          <View className="h-10 flex-row items-center gap-2 rounded-lg bg-secondary px-4">
            <Icon as={Bell} size={16} strokeWidth={2} className="text-secondary-foreground" />
            <Text className="text-sm font-medium text-secondary-foreground">Thông báo</Text>
          </View>

          <Button
            variant="outline"
            size="icon"
            onPress={() => refetch()}
            accessibilityLabel="Làm mới"
            className="size-10 rounded-lg">
            {isRefetching ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon as={RefreshCw} size={16} strokeWidth={2} className="text-foreground" />
            )}
          </Button>
        </View>
      </View>

      {/* Controls: Tabs & Mark All Read */}
      <View className="mt-2 flex-row items-center justify-between px-6 py-2">
        <View className="h-10 flex-row items-center rounded-lg bg-secondary p-1">
          <Pressable
            onPress={() => setActiveTab('unread')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'unread' }}
            className="h-full items-center justify-center rounded-md px-3">
            <View
              pointerEvents="none"
              className="absolute inset-0 rounded-md bg-background shadow-sm shadow-black/5"
              style={{ opacity: activeTab === 'unread' ? 1 : 0 }}
            />
            <View className="flex-row items-center gap-1.5">
              <Text
                className={`text-[13px] font-medium ${
                  activeTab === 'unread' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                Chưa đọc
              </Text>
              {unreadList.length > 0 ? (
                <Badge className="h-4 min-w-4 px-1 py-0">
                  <Text className="text-[10px] font-semibold text-primary-foreground">
                    {unreadList.length}
                  </Text>
                </Badge>
              ) : null}
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('read')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'read' }}
            className="h-full items-center justify-center rounded-md px-3">
            <View
              pointerEvents="none"
              className="absolute inset-0 rounded-md bg-background shadow-sm shadow-black/5"
              style={{ opacity: activeTab === 'read' ? 1 : 0 }}
            />
            <Text
              className={`text-[13px] font-medium ${
                activeTab === 'read' ? 'text-foreground' : 'text-muted-foreground'
              }`}>
              Đã đọc
            </Text>
          </Pressable>
        </View>

        {activeTab === 'unread' && unreadList.length > 0 ? (
          <Pressable
            onPress={handleMarkAllRead}
            disabled={markAllMutation.isPending}
            className="px-2 py-1.5">
            <Text className="text-sm font-medium text-brand-link">
              {markAllMutation.isPending ? 'Đang cập nhật...' : 'Đánh dấu đã đọc'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Notification List with Timeline */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-3"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          {currentList.length === 0 ? (
            <View className="mt-20 items-center justify-center px-4">
              <View className="size-16 items-center justify-center rounded-full bg-secondary">
                <Icon as={Bell} size={28} strokeWidth={2} className="text-muted-foreground" />
              </View>
              <Text className="mt-4 text-center text-base font-medium text-foreground">
                {activeTab === 'unread'
                  ? 'Bạn không có thông báo chưa đọc'
                  : 'Chưa có thông báo nào'}
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                {activeTab === 'unread'
                  ? 'Mọi thông báo quan trọng sẽ hiển thị ở đây.'
                  : 'Các thông báo đã đọc sẽ được lưu lại tại mục này.'}
              </Text>
            </View>
          ) : (
            <View className="relative">
              {/* Timeline vertical bar */}
              <View className="absolute bottom-6 left-2 top-6 w-[2px] bg-border" />

              <View className="flex-col gap-3 pl-6">
                {currentList.map((item) => {
                  const ItemIcon = getNotificationIcon(item);
                  return (
                    <View key={item.id} className="relative">
                      {/* Timeline dot */}
                      <View className="absolute -left-6 top-5 size-2.5 rounded-full border-2 border-background bg-border" />

                      <Pressable onPress={() => handleItemPress(item)}>
                        <Card className="rounded-xl border border-border bg-card p-4 shadow-none">
                          {/* Top row: Icon, Time, Unread dot */}
                          <View className="flex-row items-center justify-between">
                            <Icon
                              as={ItemIcon}
                              size={16}
                              strokeWidth={2}
                              className="text-foreground"
                            />
                            <View className="flex-row items-center gap-1.5">
                              <Text className="text-[11px] text-muted-foreground">
                                {formatRelativeTime(item.createdAt)}
                              </Text>
                              {!item.isRead ? (
                                <View className="size-2 rounded-full bg-primary" />
                              ) : null}
                            </View>
                          </View>

                          {/* Title */}
                          <Text className="mt-2 text-sm font-semibold text-foreground">
                            {item.title}
                          </Text>

                          {/* Body */}
                          {item.body ? (
                            <Text className="mt-1 text-xs text-muted-foreground">{item.body}</Text>
                          ) : null}
                        </Card>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
