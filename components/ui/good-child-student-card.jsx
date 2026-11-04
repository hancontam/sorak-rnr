import { Icon } from '@/components/ui/icon';
import { StudentInitialAvatar } from '@/components/ui/student-initial-avatar';
import { Text } from '@/components/ui/text';
import { formatMonthlyStats } from '@/features/assessment/lib/assessment-format';
import { Rose } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

// Một dòng học sinh trong Sổ bé ngoan theo tuần (Figma: Assessment Student · Sổ bé ngoan).
// Chế độ xem (read-only): Hiển thị hoa và thống kê chuyên cần/mục tiêu/sức khỏe của bé.
export function GoodChildStudentCard({
  student,
  weekKey,
  avatarUrl,
  roseActive = false,
  onToggleRose,
  readOnly = true,
}) {
  const weekly = student.weeklyStats?.[weekKey];
  const stats = formatMonthlyStats(weekly);

  return (
    <View className="flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-3">
      <StudentInitialAvatar name={student.name} code={student.code} uri={avatarUrl} />
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {student.name}
        </Text>
        <Text className="text-[11px] text-muted-foreground">{student.code}</Text>
        <View className="mt-1 flex-row flex-wrap gap-x-3 gap-y-0.5">
          <Text className="text-[11px] text-muted-foreground">
            Chuyên cần: <Text className="text-[11px] text-foreground">{stats.attendance}</Text>
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            Mục tiêu: <Text className="text-[11px] text-foreground">{stats.goals}</Text>
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            Sức khỏe: <Text className="text-[11px] text-foreground">{stats.health}</Text>
          </Text>
        </View>
      </View>
      {readOnly || !onToggleRose ? (
        <View
          className="items-center justify-center px-1.5 py-1"
          accessibilityLabel={
            roseActive ? `Bé ${student.name} đạt hoa tuần này` : `Bé ${student.name} chưa đạt hoa`
          }>
          <Icon
            as={Rose}
            size={20}
            strokeWidth={2}
            className={roseActive ? 'text-rose-500' : 'text-muted-foreground/30'}
          />
        </View>
      ) : (
        <Pressable
          className="items-center justify-center px-1.5 py-1"
          onPress={onToggleRose}
          accessibilityRole="switch"
          accessibilityState={{ checked: roseActive }}
          accessibilityLabel={
            roseActive
              ? `Bỏ hoa tuần này của ${student.name}`
              : `Tặng hoa tuần này cho ${student.name}`
          }>
          <Icon
            as={Rose}
            size={20}
            strokeWidth={2}
            className={roseActive ? 'text-rose-500' : 'text-muted-foreground/50'}
          />
        </Pressable>
      )}
    </View>
  );
}
