import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActionToast } from '@/components/shared/useActionToast';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePickupRequests } from '@/features/pickup/hooks/usePickupRequests';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { DailyRecordCard } from '../components/DailyRecordCard';
import { DateHeader } from '../components/DateHeader';
import { PickupRecordCard } from '../components/PickupRecordCard';
import { PickupSummary } from '../components/PickupSummary';
import { RecordDetailSheet } from '../components/RecordDetailSheet';
import { ScheduleState } from '../components/ScheduleState';
import { useDailyRecords } from '../hooks/useDailyRecords';
import { DAILY_ACTIONS, isAbsent } from '../utils/daily-records';
import { schoolClock, shortDate } from '../utils/schedule-date';
import { timetableError } from '../utils/timetable-model';

export default function DailyRecordsScreen() {
  const user = useAuthStore((state) => state.user);
  const params = useLocalSearchParams();
  const kind = typeof params.kind === 'string' ? params.kind : '';
  const date = typeof params.date === 'string' ? params.date : '';
  const slotId = typeof params.slotId === 'string' ? params.slotId : '';
  return (
    <DailyRecordsForm
      key={JSON.stringify([user?.id, user?.assignedClasses, kind, date, slotId])}
      kind={kind}
      date={date}
      slotId={slotId}
    />
  );
}

function DailyRecordsForm({ kind, date, slotId }) {
  const t = useTranslation();
  const router = useRouter();
  const locale = useLocale();
  const form = useDailyRecords({ kind, date, slotId });
  // Đơn ủy quyền nằm trong màn Đón trẻ: lấy số chờ duyệt để dòng lối vào có trạng thái.
  const requests = usePickupRequests({ date, enabled: kind === 'pickup' });
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  // Một sheet chi tiết cho cả màn; hàng gọn chỉ mở sheet theo id học sinh.
  const [detailId, setDetailId] = useState(null);
  const detailRow = detailId ? form.rows.find((row) => row.id === detailId) || null : null;
  const unsaved = useUnsavedChanges(form.hasUserEdits, form.isSaving);
  const confirmDiscard = unsaved.confirmDiscard;
  useActionToast(form.message, t);
  const reload = () => confirmDiscard(form.reload);
  const text = search.trim().toLocaleLowerCase('vi');
  const rows = form.rows.filter(({ student }) =>
    `${student.name || ''} ${student.code || ''}`.toLocaleLowerCase('vi').includes(text)
  );
  const canChange = form.canEdit && !form.isSaving && !form.needsReload && !form.error;
  const dismissed = form.rows.filter(({ student }) => student.isDismissed).length;
  const awaitingPickup = form.rows.filter(
    ({ student }) => student.isPresent && !student.isDismissed
  ).length;
  const absent = form.rows.filter(({ student }) => isAbsent(student)).length;
  const unrecorded = form.rows.filter(
    ({ student }) => student.isAttendanceRecorded === false
  ).length;
  const showSaveBar = kind !== 'pickup' && form.canEdit && !form.error && form.rows.length > 0;

  // Ngày không còn sửa được (đã qua, chưa tới, ngày nghỉ): ô ngày xám và nhãn Chỉ xem/Ngày nghỉ.
  const readOnly = !form.canEdit && !form.error && !form.loading;
  const header = (
    <View className="gap-3 pb-3">
      <View className="gap-2">
        <DateHeader
          date={date}
          tone={readOnly ? 'locked' : form.canEdit ? 'today' : 'past'}
          badges={
            readOnly
              ? [[t(form.lock ? 'Ngày nghỉ' : 'Chỉ xem'), form.lock ? 'destructive' : 'outline']]
              : form.canEdit
                ? [[t('Hôm nay'), 'secondary']]
                : []
          }
          subtitle={form.slot ? form.slot.title || t('Hoạt động chưa có tên') : undefined}
        />
        {readOnly && form.lock ? (
          <Text className="text-2xs leading-4 text-muted-foreground">
            {form.lock.kind === 'holiday'
              ? `${t('Ngày nghỉ: {name}. Không ghi nhận trong ngày nghỉ.', {
                  name: form.lock.name || t('Ngày nghỉ'),
                })}${
                  form.lock.makeupDate
                    ? ` ${t('Lịch dạy được bù vào Thứ Bảy {date}.', { date: shortDate(form.lock.makeupDate, locale) })}`
                    : ''
                }`
              : t('Cuối tuần không có lịch học nên không ghi nhận trong ngày này.')}
          </Text>
        ) : null}
      </View>
      {kind === 'pickup' && !form.loading && !form.error ? (
        <PickupSummary
          total={form.rows.length}
          dismissed={dismissed}
          awaiting={awaitingPickup}
          absent={absent}
          unrecorded={unrecorded}
          busy={form.isSaving}
          pendingCount={requests.query.data?.stats?.pendingCount}
          onOpenRequests={() =>
            router.push({ pathname: '/(teacher)/pickup-requests', params: { date } })
          }
        />
      ) : null}
      {form.needsReload ? (
        <Alert variant="destructive" icon={CircleAlert}>
          <AlertDescription className="text-xs">
            {t('Cần tải lại dữ liệu mới nhất trước khi làm tiếp.')}
          </AlertDescription>
          <Button size="sm" variant="outline" className="ml-6 mt-1 self-start" onPress={reload}>
            <Text>{t('Tải lại dữ liệu')}</Text>
          </Button>
        </Alert>
      ) : null}
      {form.rows.length > 0 ? (
        <View className="justify-center">
          <Input
            value={search}
            onChangeText={setSearch}
            accessibilityLabel={t('Tìm học sinh')}
            placeholder={t('Tìm theo tên hoặc mã học sinh')}
            className="pl-9"
          />
          <View pointerEvents="none" className="absolute left-3">
            <Icon as={Search} size={16} className="text-muted-foreground" />
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: t(DAILY_ACTIONS[kind] || 'Ghi nhận') }} />
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl p-4 pb-8"
        keyboardShouldPersistTaps="handled"
        // Cuộn ô đang gõ lên trên bàn phím và trên thanh Lưu (~76 dp).
        renderScrollComponent={(props) => (
          <KeyboardAwareScrollView {...props} bottomOffset={showSaveBar ? 88 : 16} />
        )}
        data={form.error ? [] : rows}
        keyExtractor={(row) => row.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <ScheduleState
            loading={form.loading}
            loadingLabel={t('Đang tải danh sách học sinh…')}
            error={
              typeof form.error === 'string'
                ? form.error
                : form.error
                  ? timetableError(form.error)
                  : ''
            }
            onRetry={form.canReload && form.error ? reload : undefined}
            title={text ? 'Không tìm thấy học sinh' : 'Chưa có học sinh'}
          />
        }
        renderItem={({ item, index }) =>
          kind === 'pickup' ? (
            <PickupRecordCard
              row={item}
              first={index === 0}
              editable={canChange}
              locked={!form.canEdit}
              onOpenDetail={() => setDetailId(item.id)}
            />
          ) : (
            <DailyRecordCard
              kind={kind}
              row={item}
              first={index === 0}
              editable={canChange}
              locked={!form.canEdit}
              onChange={(patch) => form.update(item.id, patch)}
              onOpenDetail={() => setDetailId(item.id)}
            />
          )
        }
      />
      {showSaveBar ? (
        <KeyboardStickyView offset={{ opened: insets.bottom }}>
          <SafeAreaView edges={['bottom']} className="border-t border-border bg-background">
            <View className="mx-auto w-full max-w-xl px-4 py-3">
              <Button disabled={!canChange || !form.hasChangesToSave} onPress={() => form.save()}>
                <Text>
                  {form.isSaving
                    ? t('Đang lưu và kiểm tra…')
                    : form.hasRecorded
                      ? form.changedCount
                        ? t('Cập nhật ghi nhận · {count} thay đổi', { count: form.changedCount })
                        : t('Cập nhật ghi nhận')
                      : form.changedCount
                        ? t('Lưu ghi nhận · {count} thay đổi', { count: form.changedCount })
                        : t('Lưu ghi nhận')}
                </Text>
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardStickyView>
      ) : null}
      <RecordDetailSheet
        kind={kind}
        row={detailRow}
        editable={canChange}
        onChange={(patch) => detailRow && form.update(detailRow.id, patch)}
        onClose={() => setDetailId(null)}
        onPickup={(personKey) => {
          setDetailId(null);
          // Bấm lại đúng người đã đón thì không gửi lại.
          if (!detailRow || (detailRow.student.isDismissed && personKey === detailRow.value.personKey))
            return;
          form.save(detailRow.id, {
            personKey,
            time: detailRow.value.time || schoolClock(new Date()),
          });
        }}
      />
      <ConfirmDialog {...unsaved.dialog} />
    </View>
  );
}
