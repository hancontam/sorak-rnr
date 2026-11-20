import { useEffect, useRef } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/**
 * Hàng tab gạch chân cuộn ngang để lọc hoặc chuyển mục (phẳng, không viền viên thuốc).
 * options: [{ value, label, count? }]. Tab đang chọn được cuộn vào khung khi đổi lựa chọn.
 */
export function ChipTabs({ options, value, onChange, disabled }) {
  const scroll = useRef(null);
  const offsets = useRef({});

  useEffect(() => {
    const x = offsets.current[value];
    if (typeof x === 'number') scroll.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
  }, [value]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="border-b border-border"
      contentContainerClassName="gap-5"
      accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            hitSlop={4}
            onLayout={(event) => {
              const { x } = event.nativeEvent.layout;
              offsets.current[option.value] = x;
              // Lần hiển thị đầu: effect chạy trước khi chip có vị trí, nên cuộn tại đây.
              if (selected) scroll.current?.scrollTo({ x: Math.max(0, x - 16), animated: false });
            }}
            onPress={() => onChange(option.value)}
            // Viền dưới 2 dp luôn có, chỉ đổi màu để chữ không nhảy khi chọn.
            className={cn(
              '-mb-px h-10 shrink-0 flex-row items-center gap-1.5 border-b-2 active:opacity-70',
              selected ? 'border-primary' : 'border-transparent',
              disabled && 'opacity-50'
            )}>
            <Text
              numberOfLines={1}
              className={cn(
                'text-sm',
                selected ? 'font-semibold text-primary' : 'text-muted-foreground'
              )}>
              {option.label}
            </Text>
            {option.count !== undefined ? (
              <Text
                className={cn(
                  'font-mono text-2xs',
                  selected ? 'text-primary' : 'text-muted-foreground'
                )}>
                {option.count}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
