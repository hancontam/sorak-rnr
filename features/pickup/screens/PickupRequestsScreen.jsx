import { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ScheduleState } from '@/features/daily/components/ScheduleState';
import { timetableError } from '@/features/daily/utils/timetable-model';
import { schoolToday } from '@/features/daily/utils/schedule-date';

import { PickupRequestCard } from '../components/PickupRequestCard';
import { PickupRequestForm } from '../components/PickupRequestForm';
import { usePickupRequests } from '../hooks/usePickupRequests';
import { usePickupPhoto } from '../hooks/usePickupPhoto';

const FILTERS = [
  ['all', 'Tất cả'],
  ['PENDING', 'Chờ duyệt'],
  ['APPROVED', 'Đã duyệt'],
  ['REJECTED', 'Từ chối'],
  ['CANCELLED', 'Đã hủy'],
];

export default function PickupRequestsScreen() {
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : schoolToday();
  const [creating, setCreating] = useState(params.create === '1');
  const requests = usePickupRequests({ date, creating });
  const photo = usePickupPhoto();
  const [dirty, setDirty] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const confirmDiscard = useUnsavedChanges(dirty, requests.saving || photo.busy);

  const { query, allowed, isParent, message, saving, needsReload } = requests;
  const disabled = !query.isSuccess || saving || needsReload || photo.busy;
  const rows = (query.data?.requests || []).filter(
    (item) => filter === 'all' || item.status === filter
  );

  async function act(action, id, body) {
    if (await requests.act(action, id, body)) {
      closeForm();
      setFilter('all');
    }
  }

  function closeForm() {
    setCreating(false);
    setRejectingId(null);
    setDirty(false);
    photo.remove();
  }

  async function reload() {
    if (await requests.reload()) closeForm();
  }

  function confirm(action, id, body) {
    const labels = {
      create: isParent ? 'Gửi đơn ủy quyền chờ duyệt?' : 'Tạo đơn ủy quyền đã duyệt?',
      cancel: 'Hủy đơn đang chờ duyệt?',
      approve: 'Duyệt đơn ủy quyền?',
      reject: 'Từ chối đơn ủy quyền?',
    };
    const selected = isParent
      ? query.data?.student
      : requests.studentsQuery.data?.find((s) => String(s.id) === body?.studentId);
    const detail =
      action === 'create'
        ? `${selected?.fullName || selected?.name || ''}\nNgười đón: ${body.pickup_person_name}\n${body.start_date} – ${body.end_date}`
        : undefined;
    if (Platform.OS === 'web') {
      if (globalThis.confirm([labels[action], detail].filter(Boolean).join('\n')))
        act(action, id, body);
      return;
    }
    Alert.alert(labels[action], detail, [
      { text: 'Quay lại', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => act(action, id, body) },
    ]);
  }

  if (creating)
    return (
      <ScrollView
        className="flex-1 bg-background"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8">
        <ActionNotice
          message={
            message || (query.isError ? { error: true, text: timetableError(query.error) } : null)
          }
        />
        {needsReload ? (
          <Button size="sm" variant="outline" disabled={saving} onPress={reload}>
            <Text>Kiểm tra lại đơn vừa gửi</Text>
          </Button>
        ) : null}
        {!isParent && !requests.studentsQuery.isSuccess ? (
          <ScheduleState
            loading={requests.studentsQuery.isPending && allowed}
            error={
              requests.studentsQuery.isError
                ? timetableError(requests.studentsQuery.error)
                : requests.assignmentError
            }
            title="Chưa có danh sách học sinh"
            onRetry={allowed ? requests.studentsQuery.refetch : undefined}
          />
        ) : (
          <PickupRequestForm
            student={query.data?.student}
            students={requests.studentsQuery.data || []}
            isParent={isParent}
            date={date}
            selectedStudentId={typeof params.studentId === 'string' ? params.studentId : ''}
            photo={isParent ? undefined : photo}
            disabled={disabled}
            closingDisabled={saving || photo.busy}
            onDirtyChange={setDirty}
            onClose={() => confirmDiscard(closeForm)}
            onSend={(body) => confirm('create', null, body)}
          />
        )}
      </ScrollView>
    );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        data={rows}
        keyExtractor={(item) => String(item.id)}
        refreshing={query.isRefetching}
        onRefresh={allowed && !saving ? reload : undefined}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={
          <View className="gap-3">
            <ActionNotice
              message={
                message ||
                (query.isError ? { error: true, text: timetableError(query.error) } : null)
              }
            />
            {saving ? (
              <Text className="text-xs text-muted-foreground">
                Đang cập nhật và kiểm tra trạng thái…
              </Text>
            ) : null}
            {needsReload ? (
              <Button size="sm" variant="outline" onPress={reload}>
                <Text>Tải lại danh sách</Text>
              </Button>
            ) : null}
            {allowed && query.data && !rejectingId ? (
              <Button size="sm" disabled={disabled} onPress={() => setCreating(true)}>
                <Text>Tạo đơn ủy quyền</Text>
              </Button>
            ) : null}
            {query.data ? (
              <View className="flex-row flex-wrap gap-2">
                {FILTERS.map(([value, label]) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={value === filter ? 'default' : 'outline'}
                    disabled={saving || Boolean(rejectingId)}
                    onPress={() => setFilter(value)}
                    accessibilityState={{ selected: value === filter }}>
                    <Text>{label}</Text>
                  </Button>
                ))}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ScheduleState
            loading={allowed && query.isPending}
            error={requests.assignmentError || (query.isError ? timetableError(query.error) : '')}
            onRetry={allowed && query.isError ? reload : undefined}
            title={
              allowed
                ? 'Chưa có đơn ở trạng thái này'
                : 'Chưa có lớp hoặc hồ sơ học sinh để xem đơn'
            }
          />
        }
        renderItem={({ item }) => (
          <PickupRequestCard
            request={item}
            isParent={isParent}
            disabled={disabled || creating || Boolean(rejectingId && rejectingId !== item.id)}
            rejecting={rejectingId === item.id}
            onRejecting={(open) => (open ? setRejectingId(item.id) : confirmDiscard(closeForm))}
            onDirtyChange={setDirty}
            onAction={(action, body) => confirm(action, item.id, body)}
          />
        )}
      />
    </View>
  );
}
