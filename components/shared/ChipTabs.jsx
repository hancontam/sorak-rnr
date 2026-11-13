import { useEffect, useRef } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

/**
 * Hàng chip cuộn ngang (chip của showcase) để lọc hoặc chuyển mục.
 * options: [{ value, label, count? }]. Chip đang chọn được cuộn vào khung khi đổi lựa chọn.
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
      contentContainerClassName="gap-2"
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
            className={cn(
              'h-9 shrink-0 flex-row items-center gap-1.5 rounded-full border px-3.5 active:opacity-70',
              selected ? 'border-primary bg-primary' : 'border-border bg-background',
              disabled && 'opacity-50'
            )}>
            <Text
              numberOfLines={1}
              className={cn(
                'text-xs font-medium',
                selected ? 'text-primary-foreground' : 'text-foreground'
              )}>
              {option.label}
            </Text>
            {option.count !== undefined ? (
              <Text
                className={cn(
                  'font-mono text-2xs',
                  selected ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
