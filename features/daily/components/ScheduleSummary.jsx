import { ClipboardCheck, HeartPulse, UserCheck } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export function ScheduleSummary({ summary, className, isParent, onOpenRecords }) {
  return (
    <Card className="gap-2 rounded-2xl bg-muted/30 p-2.5 shadow-none">
      <View className="flex-row flex-wrap items-center justify-between gap-1 px-0.5">
        <Text className="text-[10px] text-muted-foreground">
          {isParent ? 'Tình hình của con trong ngày' : 'Trạng thái lớp trong ngày'}
        </Text>
        <Text className="text-[10px] font-medium text-muted-foreground">{className}</Text>
      </View>
      <View className="flex-row gap-2">
        {[
          {
            kind: 'attendance',
            title: 'Điểm danh',
            icon: ClipboardCheck,
            value: summary.attendance,
          },
          { kind: 'health', title: 'Sức khỏe', icon: HeartPulse, value: summary.health },
          { kind: 'pickup', title: 'Đón trẻ', icon: UserCheck, value: summary.pickup },
        ].map(({ kind, title, icon, value }) => {
          const card = (
            <Card className="min-w-0 flex-1 gap-1.5 rounded-xl p-2.5 shadow-none">
              <Icon as={icon} size={15} />
              <Text className="text-xs font-semibold">{title}</Text>
              <Text className="text-[10px] leading-4 text-muted-foreground">{value}</Text>
            </Card>
          );
          return onOpenRecords ? (
            <Pressable
              key={kind}
              className="min-w-0 flex-1 active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel={`${title}. ${value}`}
              onPress={() => onOpenRecords(kind)}>
              {card}
            </Pressable>
          ) : (
            <View key={kind} className="min-w-0 flex-1">
              {card}
            </View>
          );
        })}
      </View>
    </Card>
  );
}
