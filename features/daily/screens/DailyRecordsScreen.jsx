import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Platform, View } from 'react-native';
import { useState } from 'react';

import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
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
  const confirmDiscard = useUnsavedChanges(form.hasUserEdits, form.isSaving);
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

  function confirmPickup(row) {
    const title = t('Xác nhận đón {name}?', { name: row.student.name });
    const person = pickupOptions(row.student).find((item) => item.key === row.value.personKey);
    const detail = [person?.name, dayTitle(date, locale), row.value.time]
      .filter(Boolean)
      .join(' · ');
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n${detail}`)) form.save(row.id);
      return;
    }
    Alert.alert(title, detail, [
      { text: t('Hủy'), style: 'cancel' },
      { text: t('Xác nhận'), onPress: () => form.save(row.id) },
    ]);
  }

  function confirmUndoPickup(row) {
    const title = t('Hủy ghi nhận đón trẻ?');
    const name = row.student.name || row.student.code;
    const detail = [
      `${name} · ${dayTitle(date, locale)}`,
      t('Bé sẽ về trạng thái Chưa đón. Điểm danh và đơn ủy quyền vẫn được giữ.'),
      row.changed && t('Các chỉnh sửa chưa lưu trên thẻ này sẽ bị bỏ.'),
    ]
      .filter(Boolean)
      .join('\n');
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n${detail}`)) form.undoPickup(row.id);
      return;
    }
    Alert.alert(title, detail, [
      { text: t('Giữ ghi nhận'), style: 'cancel' },
      { text: t('Hủy ghi nhận'), style: 'destructive', onPress: () => form.undoPickup(row.id) },
    ]);
  }

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
        ListHeaderComponent={
          <View className="gap-3">
            <Text className="text-sm font-semibold">{dayTitle(date, locale)}</Text>
            {form.slot ? (
              <Text className="text-sm">{form.slot.title || t('Hoạt động chưa có tên')}</Text>
            ) : null}
            {kind === 'pickup' && !form.loading && !form.error ? (
              <View className="gap-1">
                <Text className="text-sm font-semibold">
                  {t('Đã đón {pickedUp}/{total} học sinh', {
                    pickedUp: dismissed,
                    total: form.rows.length,
                  })}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {t('{awaiting} chưa đón · {absent} vắng · {unrecorded} chưa điểm danh', {
                    awaiting: awaitingPickup,
                    absent,
                    unrecorded,
                  })}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {t(
                    'Chọn người đón và xác nhận từng bé. Tạo ủy quyền chỉ bổ sung người vào danh sách, chưa ghi nhận đã đón.'
                  )}
                </Text>
              </View>
            ) : null}
            {!form.canEdit && !form.error ? (
              <Text className="text-xs text-muted-foreground">{t('Ngày này chỉ xem.')}</Text>
            ) : null}
            <ActionNotice
              message={
                form.message && { ...form.message, text: t(form.message.text, form.message.values) }
              }
            />
            {kind === 'health' ? (
              <Text className="text-xs text-muted-foreground">
                {t(
                  'Nhập đủ chiều cao và cân nặng cho tất cả học sinh có mặt. Học sinh vắng không được gửi số đo mới.'
                )}
              </Text>
            ) : null}
            {form.needsReload ? (
              <Button size="sm" variant="outline" onPress={reload}>
                <Text>{t('Tải lại dữ liệu')}</Text>
              </Button>
            ) : null}
            {form.rows.length > 0 ? (
              <Input
                value={search}
                onChangeText={setSearch}
                accessibilityLabel={t('Tìm học sinh')}
                placeholder={t('Tìm theo tên hoặc mã học sinh')}
                className="text-sm"
              />
            ) : null}
            {(kind === 'attendance' || kind === 'assessment') && canChange ? (
              <Text className="text-xs text-muted-foreground">
                {t(
                  '{status} được chọn sẵn cho dòng chưa ghi. Kiểm tra đủ {count} học sinh rồi bấm Lưu; tìm kiếm không giới hạn danh sách gửi.',
                  { status: t(kind === 'attendance' ? 'Có mặt' : 'Đạt'), count: form.rows.length }
                )}
              </Text>
            ) : null}
            {kind === 'pickup' && !form.error ? (
              <Button
                size="sm"
                variant="outline"
                disabled={form.isSaving}
                onPress={() =>
                  router.push({
                    pathname: '/(teacher)/pickup-requests',
                    params: { date },
                  })
                }>
                <Text>{t('Yêu cầu ủy quyền')}</Text>
              </Button>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ScheduleState
            loading={form.loading}
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
        ListFooterComponent={
          kind !== 'pickup' && form.canEdit && !form.error && form.rows.length ? (
            <Button
              size="sm"
              disabled={!canChange || !form.hasChangesToSave}
              onPress={() => form.save()}>
              <Text>{form.isSaving ? t('Đang lưu và kiểm tra…') : t('Lưu ghi nhận')}</Text>
            </Button>
          ) : null
        }
      />
    </View>
  );
}
