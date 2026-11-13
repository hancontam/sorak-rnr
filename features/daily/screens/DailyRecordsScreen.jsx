import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert, Search, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActionToast } from '@/components/shared/useActionToast';
import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { DailyRecordCard } from '../components/DailyRecordCard';
import { PickupRecordCard } from '../components/PickupRecordCard';
import { ScheduleState } from '../components/ScheduleState';
import { useDailyRecords } from '../hooks/useDailyRecords';
import { DAILY_ACTIONS, isAbsent, pickupOptions } from '../utils/daily-records';
import { dayTitle } from '../utils/schedule-date';
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
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
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

  function confirmPickup(row) {
    const person = pickupOptions(row.student).find((item) => item.key === row.value.personKey);
    setConfirm({
      title: t('Xác nhận đón {name}?', { name: row.student.name }),
      description: [person?.name, dayTitle(date, locale), row.value.time]
        .filter(Boolean)
        .join(' · '),
      cancelLabel: t('Hủy'),
      confirmLabel: t('Xác nhận'),
      onConfirm: () => form.save(row.id),
    });
  }

  function confirmUndoPickup(row) {
    const name = row.student.name || row.student.code;
    setConfirm({
      title: t('Hủy ghi nhận đón trẻ?'),
      description: [
        `${name} · ${dayTitle(date, locale)}`,
        t('Bé sẽ về trạng thái Chưa đón. Điểm danh và đơn ủy quyền vẫn được giữ.'),
        row.changed && t('Các chỉnh sửa chưa lưu trên thẻ này sẽ bị bỏ.'),
      ]
        .filter(Boolean)
        .join('\n'),
      cancelLabel: t('Giữ ghi nhận'),
      confirmLabel: t('Hủy ghi nhận'),
      destructive: true,
      onConfirm: () => form.undoPickup(row.id),
    });
  }

  const header = (
    <View className="gap-3 pb-1">
      <View className="gap-1">
        <View className="flex-row flex-wrap items-center gap-2">
          <Text className="text-sm font-semibold">{dayTitle(date, locale)}</Text>
          {!form.canEdit && !form.error ? (
            <Badge variant="outline">
              <Text>{t('Chỉ xem')}</Text>
            </Badge>
          ) : null}
        </View>
        {form.slot ? (
          <Text className="text-xs text-muted-foreground">
            {form.slot.title || t('Hoạt động chưa có tên')}
          </Text>
        ) : null}
      </View>
      {kind === 'pickup' && !form.loading && !form.error ? (
        <Card className="gap-2.5 px-4 py-3.5">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="text-sm font-semibold">{t('Đón trẻ')}</Text>
            <Text className="font-mono text-xs font-medium text-muted-foreground">
              {dismissed}/{form.rows.length}
            </Text>
          </View>
          {form.rows.length ? (
            <Progress
              value={Math.round((dismissed / form.rows.length) * 100)}
              className="h-1.5 bg-muted"
              accessibilityLabel={t('Đã đón {pickedUp}/{total} học sinh', {
                pickedUp: dismissed,
                total: form.rows.length,
              })}
            />
          ) : null}
          <Text className="text-2xs text-muted-foreground">
            {t('{awaiting} chưa đón · {absent} vắng · {unrecorded} chưa điểm danh', {
              awaiting: awaitingPickup,
              absent,
              unrecorded,
            })}
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={form.isSaving}
            onPress={() =>
              router.push({ pathname: '/(teacher)/pickup-requests', params: { date } })
            }>
            <Icon as={ShieldCheck} size={14} />
            <Text>{t('Yêu cầu ủy quyền')}</Text>
          </Button>
        </Card>
      ) : null}
      {form.needsReload ? (
        <Alert variant="destructive" icon={CircleAlert}>
          <AlertDescription className="text-xs">
            {t('Cần tải lại để đối chiếu với máy chủ trước khi thao tác tiếp.')}
          </AlertDescription>
          <Button size="sm" variant="outline" className="ml-6 mt-1 self-start" onPress={reload}>
            <Text>{t('Tải lại dữ liệu')}</Text>
          </Button>
        </Alert>
      ) : null}
      {canChange && kind !== 'pickup' ? (
        <Text className="text-2xs leading-4 text-muted-foreground">
          {kind === 'health'
            ? t(
                'Nhập đủ chiều cao và cân nặng cho tất cả học sinh có mặt. Học sinh vắng không được gửi số đo mới.'
              )
            : t(
                '{status} được chọn sẵn cho dòng chưa ghi. Kiểm tra đủ {count} học sinh rồi bấm Lưu; tìm kiếm không giới hạn danh sách gửi.',
                { status: t(kind === 'attendance' ? 'Có mặt' : 'Đạt'), count: form.rows.length }
              )}
        </Text>
      ) : null}
      {kind === 'pickup' && canChange ? (
        <Text className="text-2xs leading-4 text-muted-foreground">
          {t(
            'Chọn người đón và xác nhận từng bé. Tạo ủy quyền chỉ bổ sung người vào danh sách, chưa ghi nhận đã đón.'
          )}
        </Text>
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
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
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
        renderItem={({ item }) =>
          kind === 'pickup' ? (
            <PickupRecordCard
              row={item}
              editable={canChange}
              onChange={(patch) => form.update(item.id, patch)}
              onPickup={() => confirmPickup(item)}
              onUndoPickup={() => confirmUndoPickup(item)}
              onCreateAuthorization={() =>
                router.push({
                  pathname: '/(teacher)/pickup-requests',
                  params: { date, studentId: item.id, create: '1' },
                })
              }
            />
          ) : (
            <DailyRecordCard
              kind={kind}
              row={item}
              editable={canChange}
              onChange={(patch) => form.update(item.id, patch)}
            />
          )
        }
      />
      {showSaveBar ? (
        <SafeAreaView edges={['bottom']} className="border-t border-border bg-background">
          <View className="mx-auto w-full max-w-xl px-4 py-3">
            <Button disabled={!canChange || !form.hasChangesToSave} onPress={() => form.save()}>
              <Text>
                {form.isSaving
                  ? t('Đang lưu và kiểm tra…')
                  : form.changedCount
                    ? t('Lưu ghi nhận · {count} thay đổi', { count: form.changedCount })
                    : t('Lưu ghi nhận')}
              </Text>
            </Button>
          </View>
        </SafeAreaView>
      ) : null}
      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
      <ConfirmDialog {...unsaved.dialog} />
    </View>
  );
}
