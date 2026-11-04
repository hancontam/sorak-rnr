import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  approveAuthorization,
  getTeacherAuthorizations,
  rejectAuthorization,
} from '@/features/request/api/request.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  UserRoundCheck,
  XCircle,
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

export default function TeacherApprovalScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const assignedClass =
    user?.assignedClasses?.[0] || user?.teacher?.assignedClasses?.[0];
  const classId = assignedClass?.classId || assignedClass?.id;
  const className = assignedClass?.className || assignedClass?.name || 'Lớp học';

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED'

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['teacher-authorizations', classId],
    queryFn: () => getTeacherAuthorizations(classId),
    enabled: !!classId,
  });

  const approveMutation = useMutation({
    mutationFn: (authId) => approveAuthorization(classId, authId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-authorizations', classId] });
    },
    onError: (err) => {
      Alert.alert('Không thể duyệt', err.response?.data?.message || err.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (authId) => rejectAuthorization(classId, authId, 'Giáo viên hủy đơn'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-authorizations', classId] });
    },
    onError: (err) => {
      Alert.alert('Không thể hủy đơn', err.response?.data?.message || err.message);
    },
  });

  const authorizations = data?.authorizations || [];
  const stats = data?.stats || { pendingCount: 0, approvedCount: 0, totalCount: 0 };

  const filteredList = useMemo(() => {
    if (statusFilter === 'ALL') return authorizations;
    return authorizations.filter((item) => item.status === statusFilter);
  }, [authorizations, statusFilter]);

  const handleApprove = (authId, studentName) => {
    Alert.alert(
      'Xác nhận duyệt',
      `Bạn đồng ý duyệt đơn ủy quyền đón bé ${studentName || ''}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt đơn',
          onPress: () => approveMutation.mutate(authId),
        },
      ]
    );
  };

  const handleReject = (authId, studentName) => {
    Alert.alert(
      'Xác nhận từ chối / hủy',
      `Bạn muốn từ chối / hủy đơn ủy quyền đón bé ${studentName || ''}?`,
      [
        { text: 'Đóng', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: () => rejectMutation.mutate(authId),
        },
      ]
    );
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
            <Text className="text-sm font-medium text-secondary-foreground">Duyệt đơn</Text>
          </View>

          <Button
            variant="outline"
            size="icon"
            onPress={() => refetch()}
            accessibilityLabel="Làm mới"
            className="size-10 rounded-lg">
            <Icon
              as={RefreshCw}
              size={16}
              strokeWidth={2}
              className={isRefetching ? 'animate-spin text-foreground' : 'text-foreground'}
            />
          </Button>
        </View>
      </View>

      {/* Subheading & Filter Tabs */}
      <View className="px-6 pt-2 pb-3">
        <Text className="text-lg font-semibold text-foreground">
          Đơn ủy thác đón trẻ
        </Text>
        <Text className="text-xs text-muted-foreground">
          {className} · {stats.pendingCount || 0} đơn chờ duyệt
        </Text>

        <View className="mt-3 flex-row items-center gap-2">
          <Pressable
            onPress={() => setStatusFilter('ALL')}
            className={`rounded-lg px-3 py-1.5 border ${
              statusFilter === 'ALL'
                ? 'bg-primary border-primary'
                : 'bg-secondary border-border'
            }`}>
            <Text
              className={`text-xs font-medium ${
                statusFilter === 'ALL' ? 'text-primary-foreground' : 'text-foreground'
              }`}>
              Tất cả ({authorizations.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('PENDING')}
            className={`rounded-lg px-3 py-1.5 border ${
              statusFilter === 'PENDING'
                ? 'bg-primary border-primary'
                : 'bg-secondary border-border'
            }`}>
            <Text
              className={`text-xs font-medium ${
                statusFilter === 'PENDING' ? 'text-primary-foreground' : 'text-foreground'
              }`}>
              Chưa duyệt ({stats.pendingCount || 0})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStatusFilter('APPROVED')}
            className={`rounded-lg px-3 py-1.5 border ${
              statusFilter === 'APPROVED'
                ? 'bg-primary border-primary'
                : 'bg-secondary border-border'
            }`}>
            <Text
              className={`text-xs font-medium ${
                statusFilter === 'APPROVED' ? 'text-primary-foreground' : 'text-foreground'
              }`}>
              Đã duyệt ({stats.approvedCount || 0})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }>
          {filteredList.length === 0 ? (
            <View className="mt-20 items-center justify-center px-4">
              <View className="size-16 items-center justify-center rounded-full bg-secondary">
                <Icon as={UserRoundCheck} size={28} strokeWidth={2} className="text-muted-foreground" />
              </View>
              <Text className="mt-4 text-center text-base font-medium text-foreground">
                Không có đơn nào
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                Các đơn ủy thác của phụ huynh học sinh sẽ xuất hiện tại đây.
              </Text>
            </View>
          ) : (
            <View className="flex-col gap-3">
              {filteredList.map((item) => {
                const studentName = item.student?.name || 'Học sinh';
                const studentCode = item.student?.code || '';
                const isPending = item.status === 'PENDING';
                const isApproved = item.status === 'APPROVED';

                return (
                  <Card
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-none">
                    {/* Student identity & status badge */}
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-foreground">
                          {studentName}
                        </Text>
                        <Text className="text-[11px] text-muted-foreground">
                          {studentCode ? `${studentCode} · ` : ''}
                          {className}
                        </Text>
                      </View>

                      <Badge
                        variant={
                          isApproved ? 'default' : isPending ? 'secondary' : 'destructive'
                        }>
                        <Text className="text-[11px] font-medium">
                          {isApproved
                            ? 'Đã duyệt'
                            : isPending
                            ? 'Chưa duyệt'
                            : 'Đã hủy'}
                        </Text>
                      </Badge>
                    </View>

                    <View className="my-3 h-px bg-border" />

                    {/* Authorized person */}
                    <View className="gap-0.5">
                      <Text className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Người được uỷ quyền
                      </Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {item.pickupPersonName}
                        {item.relationship ? ` · ${item.relationship}` : ''}
                      </Text>
                      {item.pickupPersonPhone ? (
                        <Text className="text-xs text-muted-foreground">
                          {item.pickupPersonPhone}
                        </Text>
                      ) : null}
                    </View>

                    {/* Effective dates */}
                    <View className="mt-2.5 gap-0.5">
                      <Text className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Thời gian hiệu lực
                      </Text>
                      <Text className="text-xs text-foreground">
                        {item.startDate} – {item.endDate}
                      </Text>
                    </View>

                    {/* Parent note */}
                    <View className="mt-2.5 gap-0.5">
                      <Text className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Dặn dò phụ huynh
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {item.note || 'Không có dặn dò'}
                      </Text>
                    </View>

                    {/* Actions if pending */}
                    {isPending ? (
                      <View className="mt-4 flex-row items-center justify-end gap-2 border-t border-border pt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onPress={() => handleReject(item.id, studentName)}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                          className="h-8 px-3 rounded-md">
                          <Text className="text-xs font-medium text-destructive-foreground">
                            Huỷ đơn
                          </Text>
                        </Button>

                        <Button
                          size="sm"
                          onPress={() => handleApprove(item.id, studentName)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="h-8 px-4 rounded-md bg-primary">
                          <Text className="text-xs font-medium text-primary-foreground">
                            Duyệt
                          </Text>
                        </Button>
                      </View>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
