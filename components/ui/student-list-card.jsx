import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StudentAvatar } from '@/components/ui/student-avatar';
import { Text } from '@/components/ui/text';
import { formatDate, formatGender } from '@/features/report/lib/report-format';
import { Pressable, View } from 'react-native';

export function StudentListCard({ student, onPress }) {
  const transferred = student.enrollmentStatus === 'TRANSFERRED_CLASS' || Boolean(student.leftAt);
  const status = transferred ? 'Đã chuyển lớp' : student.statusLabel || 'Đang học';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Xem báo cáo ${student.fullName}`}>
      <Card className="gap-2 rounded-lg p-3 shadow-none">
        <View className="flex-row items-center gap-2">
          <StudentAvatar student={student} />
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-sm font-semibold" numberOfLines={1}>
              {student.fullName}
            </Text>
            <Text className="text-[11px] text-muted-foreground">{student.studentCode}</Text>
          </View>
          <Badge
            variant={transferred ? 'destructive' : 'default'}
            className="rounded-md px-2 py-0.5">
            <Text className="text-[11px]">{status}</Text>
          </Badge>
        </View>
        <View className="gap-0.5">
          <Text className="text-xs text-muted-foreground">
            {formatGender(student.gender)} · Sinh {formatDate(student.dateOfBirth)}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            Vào lớp {formatDate(student.enrolledAt)} · Rời lớp {formatDate(student.leftAt)}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}
