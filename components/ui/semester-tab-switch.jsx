import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

const OPTIONS = [
  { value: 'SEMESTER_1', label: 'Học kỳ 1' },
  { value: 'SEMESTER_2', label: 'Học kỳ 2' },
];

// Segmented switch hai học kỳ; nền brand cho mục đang chọn theo token RNR.
export function SemesterTabSwitch({ value, onChange }) {
  return (
    <View className="h-10 flex-row gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            className={`h-10 flex-1 items-center justify-center rounded-lg ${
              active ? 'bg-brand' : 'bg-secondary'
            }`}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}>
            <Text
              className={`text-[13px] font-medium ${
                active ? 'text-brand-foreground' : 'text-muted-foreground'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
