import { Button } from './button';
import { Card } from './card';
import { Input } from './input';
import { StudentInitialAvatar } from './student-initial-avatar';
import { Text } from './text';
import { ACTIVITY_RATINGS } from '@/features/daily/lib/activity-assessment';
import { View } from 'react-native';

export function ActivityStudentRatingCard({ student, disabled, onChange }) {
  return (
    <Card className="gap-2 p-3 shadow-none">
      <View className="flex-row items-center gap-2">
        <StudentInitialAvatar
          name={student.name}
          code={student.code}
          uri={student.avatarUrl}
          size={32}
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-[13px] font-medium">{student.name}</Text>
          <Text className="text-[10px] text-muted-foreground">{student.code}</Text>
        </View>
      </View>
      <View className="flex-row gap-2">
        {ACTIVITY_RATINGS.map((rating) => (
          <Button
            key={rating.value}
            variant={student.status === rating.value ? 'default' : 'outline'}
            size="sm"
            className="h-8 flex-1 px-1"
            disabled={disabled}
            accessibilityLabel={`${student.name}: ${rating.label}`}
            accessibilityState={{ selected: student.status === rating.value }}
            onPress={() => onChange({ status: rating.value })}>
            <Text className="text-[13px]">{rating.label}</Text>
          </Button>
        ))}
      </View>
      <Input
        value={student.note}
        editable={!disabled}
        placeholder="Ghi chú đánh giá…"
        accessibilityLabel={`Ghi chú đánh giá ${student.name}`}
        onChangeText={(note) => onChange({ note })}
      />
    </Card>
  );
}
