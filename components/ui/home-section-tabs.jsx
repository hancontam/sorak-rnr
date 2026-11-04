import { Icon } from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { CalendarDays, ChevronDown, LayoutGrid, ListChecks } from 'lucide-react-native';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion } from 'react-native-reanimated';

const TAB_LAYOUT = LinearTransition.duration(250).reduceMotion(ReduceMotion.System);
const LABEL_ENTER = FadeIn.duration(140).delay(80).reduceMotion(ReduceMotion.System);
const LABEL_EXIT = FadeOut.duration(90).reduceMotion(ReduceMotion.System);

export function HomeSectionTabs({ value, onValueChange, isParent }) {
  const sections = [
    { value: 'report', label: 'Báo cáo', icon: LayoutGrid },
    { value: 'daily', label: 'Nhật ký ngày', icon: CalendarDays },
    {
      value: 'assessment',
      label: isParent ? 'Kết quả đánh giá' : 'Đánh giá giai đoạn',
      icon: ListChecks,
    },
  ];

  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="mr-0 h-14 w-full justify-start gap-2 rounded-none bg-transparent p-0">
        {sections.map((section) => {
          const active = value === section.value;

          return (
            <Animated.View
              key={section.value}
              layout={TAB_LAYOUT}
              className="h-14 overflow-hidden"
              style={active ? { flex: 1 } : { width: 64 }}>
              <TabsTrigger
                value={section.value}
                accessibilityLabel={section.label}
                className={`h-full w-full rounded-lg border px-0 py-0 shadow-none ${
                  active
                    ? 'border-border bg-background dark:border-border dark:bg-background'
                    : 'border-transparent bg-muted dark:bg-muted'
                }`}>
                <View className="w-full flex-row items-center justify-center gap-2">
                  <Icon
                    as={section.icon}
                    size={20}
                    strokeWidth={2}
                    className={active ? 'text-foreground' : 'text-muted-foreground'}
                  />
                  {active ? (
                    <Animated.View
                      entering={LABEL_ENTER}
                      exiting={LABEL_EXIT}
                      style={{ flexShrink: 1 }}>
                      <Text className="text-base font-medium text-foreground" numberOfLines={1}>
                        {section.label}
                      </Text>
                    </Animated.View>
                  ) : null}
                </View>
                {active && section.value === 'daily' ? (
                  <Icon
                    as={ChevronDown}
                    size={16}
                    strokeWidth={2}
                    className="absolute right-3 text-muted-foreground"
                  />
                ) : null}
              </TabsTrigger>
            </Animated.View>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
