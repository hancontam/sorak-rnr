import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Platform, View } from 'react-native';
import { useState } from 'react';

import { useUnsavedChanges } from '@/components/shared/useUnsavedChanges';
import { ActionNotice } from '@/components/shared/ActionNotice';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

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
  const router = useRouter();
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
    const title = `Xác nhận đón ${row.student.name}?`;
    const person = pickupOptions(row.student).find((item) => item.key === row.value.personKey);
    const detail = [person?.name, dayTitle(date), row.value.time].filter(Boolean).join(' · ');
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n${detail}`)) form.save(row.id);
      return;
    }
    Alert.alert(title, detail, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xác nhận', onPress: () => form.save(row.id) },
    ]);
  }

  function confirmUndoPickup(row) {
    const title = 'Hủy ghi nhận đón trẻ?';
    const name = row.student.name || row.student.code;
    const detail = [
      `${name} · ${dayTitle(date)}`,
      'Bé sẽ về trạng thái Chưa đón. Điểm danh và đơn ủy quyền vẫn được giữ.',
      row.changed && 'Các chỉnh sửa chưa lưu trên thẻ này sẽ bị bỏ.',
    ]
      .filter(Boolean)
      .join('\n');
    if (Platform.OS === 'web') {
      if (globalThis.confirm(`${title}\n${detail}`)) form.undoPickup(row.id);
      return;
    }
    Alert.alert(title, detail, [
      { text: 'Giữ ghi nhận', style: 'cancel' },
      { text: 'Hủy ghi nhận', style: 'destructive', onPress: () => form.undoPickup(row.id) },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: DAILY_ACTIONS[kind] || 'Ghi nhận' }} />
      <FlatList
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-xl gap-3 p-4 pb-8"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        data={form.error ? [] : rows}
        keyExtractor={(row) => row.id}
        ListHeaderComponent={
          <View className="gap-3">
            <Text className="text-sm font-semibold">{dayTitle(date)}</Text>
            {form.slot ? <Text className="text-sm">{form.slot.title}</Text> : null}
            {kind === 'pickup' && !form.loading && !form.error ? (
              <View className="gap-1">
                <Text className="text-sm font-semibold">
                  Đã đón {dismissed}/{form.rows.length} học sinh
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {awaitingPickup} chưa đón · {absent} vắng · {unrecorded} chưa điểm danh
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Chọn người đón và xác nhận từng bé. Tạo ủy quyền chỉ bổ sung người vào danh sách,
                  chưa ghi nhận đã đón.
                </Text>
              </View>
            ) : null}
            {!form.canEdit && !form.error ? (
              <Text className="text-xs text-muted-foreground">Ngày này chỉ xem.</Text>
            ) : null}
            <ActionNotice message={form.message} />
            {kind === 'health' ? (
              <Text className="text-xs text-muted-foreground">
                Nhập đủ chiều cao và cân nặng cho tất cả học sinh có mặt. Học sinh vắng không được
                gửi số đo mới.
              </Text>
            ) : null}
            {form.needsReload ? (
              <Button size="sm" variant="outline" onPress={reload}>
                <Text>Tải lại dữ liệu</Text>
              </Button>
            ) : null}
            {form.rows.length > 0 ? (
              <Input
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Tìm học sinh"
                placeholder="Tìm theo tên hoặc mã học sinh"
                className="text-sm"
              />
            ) : null}
            {(kind === 'attendance' || kind === 'assessment') && canChange ? (
              <Text className="text-xs text-muted-foreground">
                {kind === 'attendance' ? 'Có mặt' : 'Đạt'} được chọn sẵn cho dòng chưa ghi. Kiểm tra
                đủ {form.rows.length} học sinh rồi bấm Lưu; tìm kiếm không giới hạn danh sách gửi.
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
                <Text>Yêu cầu ủy quyền</Text>
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
              <Text>{form.isSaving ? 'Đang lưu và kiểm tra…' : 'Lưu ghi nhận'}</Text>
            </Button>
          ) : null
        }
      />
    </View>
  );
}
