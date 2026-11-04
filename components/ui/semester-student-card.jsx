import { AssessmentMetricRow } from '@/components/ui/assessment-metric-row';
import { Input } from '@/components/ui/input';
import { StudentInitialAvatar } from '@/components/ui/student-initial-avatar';
import { Text } from '@/components/ui/text';
import {
  DOMAIN_FIELDS,
  formatDomainResult,
  formatPercent,
} from '@/features/assessment/lib/assessment-format';
import { View } from 'react-native';

// Thẻ một học sinh trong màn Đánh giá học kỳ của giáo viên (Figma: Assessment Student).
export function SemesterStudentCard({ student, note, onNoteChange, editable, avatarUrl }) {
  return (
    <View className="gap-3 rounded-xl border border-border bg-card px-3 py-3">
      <View className="flex-row items-center gap-2">
        <StudentInitialAvatar name={student.name} code={student.code} uri={avatarUrl} />
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {student.name}
          </Text>
          <Text className="text-[11px] text-muted-foreground">{student.code}</Text>
        </View>
      </View>

      <View>
        <Text className="mb-1 text-[11px] text-muted-foreground">5 lĩnh vực phát triển</Text>
        <View className="flex-row flex-wrap">
          {DOMAIN_FIELDS.map((domain) => (
            <View key={domain.key} className="w-1/2">
              <AssessmentMetricRow
                label={domain.label}
                value={formatDomainResult(student.domainBreakdown?.[domain.key])}
              />
            </View>
          ))}
          <View className="w-1/2">
            <AssessmentMetricRow
              label="Đi học đủ"
              value={formatPercent(student.attendance?.rate)}
            />
          </View>
        </View>
      </View>

      <AssessmentMetricRow label="Sức khỏe" value={student.health?.status || '--'} />

      {editable ? (
        <View className="gap-1">
          <Text className="text-[11px] text-muted-foreground">Lời bình của cô</Text>
          <Input
            value={note}
            onChangeText={onNoteChange}
            placeholder="Thêm lời bình"
            accessibilityLabel={`Lời bình cho ${student.name}`}
          />
        </View>
      ) : null}
    </View>
  );
}
