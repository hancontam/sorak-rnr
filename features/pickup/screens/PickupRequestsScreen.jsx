import { Stack, useLocalSearchParams } from 'expo-router';
import { CircleAlert, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { BackHandler, FlatList, Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderBackButton } from '@/components/shared/AppHeader';
import { usePullToRefresh } from '@/components/shared/usePullToRefresh';
import { ChipTabs } from '@/components/shared/ChipTabs';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActionToast } from '@/components/shared/useActionToast';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ScheduleState } from '@/features/daily/components/ScheduleState';
import { schoolToday, shortDate } from '@/features/daily/utils/schedule-date';
import { timetableError } from '@/features/daily/utils/timetable-model';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { PickupRequestForm } from '../components/PickupRequestForm';
import { PickupRequestSheet } from '../components/PickupRequestSheet';
import { PickupRequestTable } from '../components/PickupRequestTable';
import { usePickupPhoto } from '../hooks/usePickupPhoto';
import { usePickupRequests } from '../hooks/usePickupRequests';

// Ba nhóm thay cho năm trạng thái: đơn chờ duyệt cần xử lý, còn lại gom vào Đã xử lý (nhãn trạng thái
// cụ thể vẫn hiện ở cột Trạng thái của bảng).
const FILTERS = [
  ['all', 'Tất cả'],
  ['PENDING', 'Chờ duyệt'],
  ['done', 'Đã xử lý'],
];
// Ngày dd/mm/yyyy cho hộp xác nhận (đơn lưu dạng YYYY-MM-DD).
const fullDate = (value) => (value ? `${shortDate(value)}/${value.slice(0, 4)}` : '');
const matches = (key, item) =>
  key === 'all' || (key === 'done' ? item.status !== 'PENDING' : item.status === key);

export default function PickupRequestsScreen() {
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const date = typeof params.date === 'string' ? params.date : schoolToday();
  const [creating, setCreating] = useState(params.create === '1');
  const requests = usePickupRequests({ date, creating });
  const photo = usePickupPhoto();
  const [dirty, setDirty] = useState(false);
  // Đơn đang mở trong sheet chi tiết (theo id để luôn đọc bản mới nhất sau khi tải lại).
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [confirmRequest, setConfirmRequest] = useState(null);
  const unsaved = useUnsavedChanges(dirty, requests.saving || photo.busy);
  const confirmDiscard = unsaved.confirmDiscard;
  const { query, allowed, isParent, message, saving, needsReload } = requests;
  useActionToast(message, t);
  const pull = usePullToRefresh(allowed && !saving ? reload : undefined);

  const disabled = !query.isSuccess || saving || needsReload || photo.busy;
  const all = query.data?.requests || [];
  const rows = all.filter((item) => matches(filter, item));
  const counts = Object.fromEntries(
    FILTERS.map(([key]) => [key, all.filter((item) => matches(key, item)).length])
  );
  const canCreate = allowed && query.data && !creating;
  const opened = openId ? all.find((item) => item.id === openId) || null : null;

  async function act(action, id, body) {
    if (await requests.act(action, id, body)) {
      closeForm();
      setOpenId(null);
      setFilter('all');
    }
  }

  function leaveForm() {
    if (!saving && !photo.busy) confirmDiscard(closeForm);
  }

  // Phím quay lại của Android khi đang mở form: về danh sách đơn thay vì rời màn.
  useEffect(() => {
    if (!creating) return undefined;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      leaveForm();
      return true;
    });
    return () => sub.remove();
  });

  function closeForm() {
    setCreating(false);
    setDirty(false);
    photo.remove();
  }

  async function reload() {
    if (await requests.reload()) closeForm();
  }

  // Hỏi lại trước khi gửi đơn mới. Duyệt, từ chối, hủy đơn đã xác nhận trong sheet chi tiết.
  function confirmCreate(body) {
    const selected = isParent
      ? query.data?.student
      : requests.studentsQuery.data?.find((s) => String(s.id) === body?.studentId);
    setConfirmRequest({
      title: t(isParent ? 'Gửi đơn ủy quyền chờ duyệt?' : 'Tạo đơn ủy quyền đã duyệt?'),
      description: `${selected?.fullName || selected?.name || ''}\n${t('Người đón')}: ${body.pickup_person_name}\n${fullDate(body.start_date)} – ${fullDate(body.end_date)}`,
      cancelLabel: t('Hủy'),
      confirmLabel: t('Xác nhận'),
      onConfirm: () => act('create', null, body),
    });
  }

  const reloadNotice =
    needsReload || query.isError ? (
      <Alert variant="destructive" icon={CircleAlert}>
        <AlertDescription className="text-xs">
          {query.isError && !needsReload
            ? t(timetableError(query.error))
            : message?.error
              ? t(message.text)
              : t('Cần tải lại dữ liệu mới nhất trước khi làm tiếp.')}
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
                  ? t('Kiểm tra lại')
                  : t('Tải lại')}
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
        <Stack.Screen
          options={{
            title: t('Tạo đơn ủy quyền'),
            headerRight: () => null,
            // Nút quay lại đóng form về danh sách đơn (thay nút "Đóng form" cuối form).
            headerBackVisible: false,
            headerLeft: () => (
              <HeaderBackButton
                label={t('Quay lại danh sách đơn')}
                disabled={saving || photo.busy}
                onPress={leaveForm}
              />
            ),
          }}
        />
        <KeyboardAwareScrollView
          bottomOffset={16}
          className="flex-1 bg-background"
          keyboardShouldPersistTaps="handled"
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
              photo={photo}
              disabled={disabled}
              onDirtyChange={setDirty}
              onSend={confirmCreate}
            />
          )}
        </KeyboardAwareScrollView>
        {dialog}
      </>
    );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: t(isParent ? 'Ủy quyền đón con' : 'Ủy quyền đón trẻ'),
          headerRight: () => null,
          // Options được ghép thêm chứ không thay hẳn: trả lại nút quay lại mặc định, nếu không nút
          // "đóng form" của chế độ tạo đơn vẫn còn và bấm không rời được màn.
          headerLeft: undefined,
          headerBackVisible: true,
        }}
      />
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-2 p-4 pb-24"
        // Cả danh sách là một bảng (một mục), giống bảng đơn ủy quyền trên web.
        data={rows.length ? [{ id: 'table' }] : []}
        keyExtractor={(item) => String(item.id)}
        refreshing={pull.refreshing}
        onRefresh={pull.onRefresh}
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
                disabled={saving}
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
            </View>
          )
        }
        renderItem={() => (
          <PickupRequestTable
            requests={rows}
            isParent={isParent}
            onOpen={(request) => {
              requests.clearMessage();
              setOpenId(request.id);
            }}
          />
        )}
      />
      {/* Nút nổi góc dưới phải để tạo đơn (thay nút + trên thanh tiêu đề). */}
      {canCreate ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('Tạo đơn ủy quyền')}
          disabled={disabled}
          onPress={() => setCreating(true)}
          style={{ bottom: insets.bottom + 16, elevation: 6 }}
          className={cn(
            'absolute right-4 size-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/20 active:opacity-80',
            disabled && 'opacity-50'
          )}>
          <Icon as={Plus} size={24} className="text-primary-foreground" />
        </Pressable>
      ) : null}
      <PickupRequestSheet
        request={opened}
        isParent={isParent}
        disabled={disabled}
        saving={saving}
        error={message?.error ? t(message.text) : ''}
        onAction={(action, body) => act(action, openId, body)}
        onClose={() => setOpenId(null)}
      />
      {dialog}
    </View>
  );
}
