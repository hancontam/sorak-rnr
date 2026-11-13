import { Stack, useLocalSearchParams } from 'expo-router';
import { CircleAlert, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import { ChipTabs } from '@/components/shared/ChipTabs';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActionToast } from '@/components/shared/useActionToast';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ScheduleState } from '@/features/daily/components/ScheduleState';
import { schoolToday } from '@/features/daily/utils/schedule-date';
import { timetableError } from '@/features/daily/utils/timetable-model';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { PickupRequestCard } from '../components/PickupRequestCard';
import { PickupRequestForm } from '../components/PickupRequestForm';
import { usePickupPhoto } from '../hooks/usePickupPhoto';
import { usePickupRequests } from '../hooks/usePickupRequests';

const FILTERS = [
  ['all', 'Tất cả'],
  ['PENDING', 'Chờ duyệt'],
  ['APPROVED', 'Đã duyệt'],
  ['REJECTED', 'Đã từ chối'],
  ['CANCELLED', 'Đã hủy'],
];

export default function PickupRequestsScreen() {
  const t = useTranslation();
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : schoolToday();
  const [creating, setCreating] = useState(params.create === '1');
  const requests = usePickupRequests({ date, creating });
  const photo = usePickupPhoto();
  const [dirty, setDirty] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirmRequest, setConfirmRequest] = useState(null);
  const unsaved = useUnsavedChanges(dirty, requests.saving || photo.busy);
  const confirmDiscard = unsaved.confirmDiscard;
  const { query, allowed, isParent, message, saving, needsReload } = requests;
  useActionToast(message, t);

  const disabled = !query.isSuccess || saving || needsReload || photo.busy;
  const all = query.data?.requests || [];
  const rows = all.filter((item) => filter === 'all' || item.status === filter);
  const counts = Object.fromEntries(
    FILTERS.map(([key]) => [
      key,
      key === 'all' ? all.length : all.filter((item) => item.status === key).length,
    ])
  );
  const canCreate = allowed && query.data && !rejectingId && !creating;

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
      create: t(isParent ? 'Gửi đơn ủy quyền chờ duyệt?' : 'Tạo đơn ủy quyền đã duyệt?'),
      cancel: t('Hủy đơn đang chờ duyệt?'),
      approve: t('Duyệt đơn ủy quyền?'),
      reject: t('Từ chối đơn ủy quyền?'),
    };
    const selected = isParent
      ? query.data?.student
      : requests.studentsQuery.data?.find((s) => String(s.id) === body?.studentId);
    setConfirmRequest({
      title: labels[action],
      description:
        action === 'create'
          ? `${selected?.fullName || selected?.name || ''}\n${t('Người đón')}: ${body.pickup_person_name}\n${body.start_date} – ${body.end_date}`
          : undefined,
      cancelLabel: t('Quay lại'),
      confirmLabel: t('Xác nhận'),
      destructive: action === 'reject' || action === 'cancel',
      onConfirm: () => act(action, id, body),
    });
  }

  const reloadNotice =
    needsReload || query.isError ? (
      <Alert variant="destructive" icon={CircleAlert}>
        <AlertDescription className="text-xs">
          {query.isError && !needsReload
            ? t(timetableError(query.error))
            : t('Cần tải lại để đối chiếu với máy chủ trước khi thao tác tiếp.')}
        </AlertDescription>
        {needsReload || allowed ? (
          <Button
            size="sm"
            variant="outline"
            className="ml-6 mt-1 self-start"
            disabled={saving}
            onPress={reload}>
            <Text>
              {!needsReload
                ? t('Thử lại')
                : creating
                  ? t('Kiểm tra lại đơn vừa gửi')
                  : t('Tải lại danh sách')}
            </Text>
          </Button>
        ) : null}
      </Alert>
    ) : null;

  const dialog = (
    <>
      <ConfirmDialog request={confirmRequest} onClose={() => setConfirmRequest(null)} />
      <ConfirmDialog {...unsaved.dialog} />
    </>
  );

  if (creating)
    return (
      <>
        <Stack.Screen options={{ title: t('Tạo đơn ủy quyền'), headerRight: () => null }} />
        <ScrollView
          className="flex-1 bg-background"
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8">
          {reloadNotice}
          {!isParent && !requests.studentsQuery.isSuccess ? (
            <ScheduleState
              loading={requests.studentsQuery.isPending && allowed}
              loadingLabel={t('Đang tải danh sách học sinh…')}
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
        {dialog}
      </>
    );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: t('Đơn ủy quyền đón trẻ'),
          headerRight: canCreate
            ? () => (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  accessibilityLabel={t('Tạo đơn ủy quyền')}
                  disabled={disabled}
                  onPress={() => setCreating(true)}>
                  <Icon as={Plus} size={20} />
                </Button>
              )
            : () => null,
        }}
      />
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
            {reloadNotice}
            {saving ? (
              <Text className="text-2xs text-muted-foreground">
                {t('Đang cập nhật và kiểm tra trạng thái…')}
              </Text>
            ) : null}
            {query.data ? (
              <ChipTabs
                options={FILTERS.map(([key, label]) => ({
                  value: key,
                  label: t(label),
                  count: counts[key],
                }))}
                value={filter}
                disabled={saving || Boolean(rejectingId)}
                onChange={setFilter}
              />
            ) : null}
          </View>
        }
        ListEmptyComponent={
          query.isError ? null : (
            <View className="gap-3">
              <ScheduleState
                loading={allowed && query.isPending}
                error={requests.assignmentError}
                title={
                  allowed
                    ? 'Chưa có đơn ở trạng thái này'
                    : 'Chưa có lớp hoặc hồ sơ học sinh để xem đơn'
                }
              />
              {canCreate && !query.isPending ? (
                <Button variant="outline" disabled={disabled} onPress={() => setCreating(true)}>
                  <Icon as={Plus} size={16} />
                  <Text>{t('Tạo đơn ủy quyền')}</Text>
                </Button>
              ) : null}
            </View>
          )
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
      {dialog}
    </View>
  );
}
