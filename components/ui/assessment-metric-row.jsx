import { Text } from '@/components/ui/text';
import { View } from 'react-native';

// Một dòng chỉ số: nhãn bên trái, giá trị bên phải (Figma: Chỉ số · hàng 1/2).
export function AssessmentMetricRow({ label, value, emphasis = false }) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text className="flex-1 pr-3 text-xs text-muted-foreground">{label}</Text>
      <Text className={`text-xs ${emphasis ? 'font-semibold' : 'font-medium'} text-foreground`}>
        {value}
      </Text>
    </View>
  );
}

export function AssessmentSectionCard({ title, children, className = '' }) {
  return (
    <View className={`gap-1 rounded-xl border border-border bg-card px-4 py-4 ${className}`}>
      {title ? <Text className="mb-1 text-sm font-medium text-foreground">{title}</Text> : null}
      {children}
    </View>
  );
}
