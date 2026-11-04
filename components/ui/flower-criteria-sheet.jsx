import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { BottomSheetContent, Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { ThemedSpinner } from '@/components/ui/themed-spinner';
import {
  ATTENDANCE_PRESETS,
  GOAL_PRESETS,
  HEALTH_STATUS_OPTIONS,
} from '@/features/assessment/lib/flower-criteria';
import * as React from 'react';
import { Pressable, View } from 'react-native';

function PresetRow({ presets, value, onSelect }) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {presets.map((preset) => {
        const active = preset === value;
        return (
          <Pressable
            key={preset}
            className={`h-8 items-center justify-center rounded-md border px-3 ${
              active ? 'border-primary bg-primary' : 'border-border bg-background'
            }`}
            onPress={() => onSelect(preset)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${preset} phần trăm`}>
            <Text
              className={`text-[13px] font-medium ${
                active ? 'text-primary-foreground' : 'text-foreground'
              }`}>
              {preset}%
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Bottom sheet cấu hình tiêu chí gợi ý tặng hoa (Figma 2289:2790).
export function FlowerCriteriaSheet({
  open,
  onOpenChange,
  initialCriteria,
  onSave,
  isSaving,
  error,
}) {
  const [attendance, setAttendance] = React.useState(initialCriteria.minAttendanceRate);
  const [goals, setGoals] = React.useState(initialCriteria.minGoalsRate);
  const [healthStatuses, setHealthStatuses] = React.useState(initialCriteria.allowedHealthStatuses);
  const [attendanceText, setAttendanceText] = React.useState('');
  const [goalsText, setGoalsText] = React.useState('');

  // Mỗi lần mở lại sheet thì lấy tiêu chí đang áp dụng làm bản nháp.
  React.useEffect(() => {
    if (!open) return;
    setAttendance(initialCriteria.minAttendanceRate);
    setGoals(initialCriteria.minGoalsRate);
    setHealthStatuses(initialCriteria.allowedHealthStatuses);
    setAttendanceText('');
    setGoalsText('');
  }, [open, initialCriteria]);

  function toggleHealth(status) {
    setHealthStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status]
    );
  }

  function applyCustomAttendance(text) {
    setAttendanceText(text);
    const parsed = Number(text);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) setAttendance(parsed);
  }

  function applyCustomGoals(text) {
    setGoalsText(text);
    const parsed = Number(text);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) setGoals(parsed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent open={open} title="Cấu hình gợi ý tặng hoa">
        <Text className="mt-1 text-xs text-muted-foreground">
          Đặt tiêu chí để đề xuất tặng hoa hồng nhanh
        </Text>

        <View className="mt-4 gap-2">
          <Text className="text-sm font-semibold">1. Chuyên cần tuần tối thiểu</Text>
          <Text className="text-[11px] text-muted-foreground">
            Tỷ lệ số ngày bé đi học đủ trong tuần
          </Text>
          <PresetRow
            presets={ATTENDANCE_PRESETS}
            value={attendance}
            onSelect={(value) => {
              setAttendance(value);
              setAttendanceText('');
            }}
          />
          <Input
            className="h-9 w-60"
            value={attendanceText}
            onChangeText={applyCustomAttendance}
            placeholder="Nhập % chuyên cần khác"
            keyboardType="number-pad"
            accessibilityLabel="Nhập phần trăm chuyên cần khác"
          />
        </View>

        <View className="mt-6 gap-2">
          <Text className="text-sm font-semibold">2. Mục tiêu bài học tối thiểu</Text>
          <Text className="text-[11px] text-muted-foreground">
            Tỷ lệ mục tiêu giáo dục trong tuần đạt yêu cầu
          </Text>
          <PresetRow
            presets={GOAL_PRESETS}
            value={goals}
            onSelect={(value) => {
              setGoals(value);
              setGoalsText('');
            }}
          />
          <Input
            className="h-9 w-60"
            value={goalsText}
            onChangeText={applyCustomGoals}
            placeholder="Nhập % mục tiêu khác"
            keyboardType="number-pad"
            accessibilityLabel="Nhập phần trăm mục tiêu khác"
          />
        </View>

        <View className="mt-6 gap-2">
          <Text className="text-sm font-semibold">3. Tiêu chuẩn sức khoẻ</Text>
          <Text className="text-[11px] text-muted-foreground">
            Chọn trạng thái đủ điều kiện nhận hoa
          </Text>
          {HEALTH_STATUS_OPTIONS.map((status) => (
            <Pressable
              key={status}
              className="flex-row items-center gap-2 py-1.5"
              onPress={() => toggleHealth(status)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: healthStatuses.includes(status) }}
              accessibilityLabel={status}>
              <View pointerEvents="none">
                <Checkbox
                  checked={healthStatuses.includes(status)}
                  onCheckedChange={() => toggleHealth(status)}
                />
              </View>
              <Text className="flex-1 text-xs font-medium">{status}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text className="mt-3 text-xs text-destructive">{error}</Text> : null}

        <View className="mt-5 flex-row justify-end gap-2">
          <Button variant="outline" size="sm" onPress={() => onOpenChange(false)}>
            <Text>Huỷ</Text>
          </Button>
          <Button
            size="sm"
            disabled={isSaving}
            onPress={() =>
              onSave({
                minAttendanceRate: attendance,
                minGoalsRate: goals,
                allowedHealthStatuses: healthStatuses,
              })
            }>
            {isSaving ? (
              <ThemedSpinner />
            ) : (
              <Text className="text-primary-foreground">Lưu &amp; áp dụng</Text>
            )}
          </Button>
        </View>
      </BottomSheetContent>
    </Dialog>
  );
}
