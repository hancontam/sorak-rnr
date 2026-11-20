import { CheckSquare, SlidersHorizontal } from 'lucide-react-native';
import { View } from 'react-native';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// Nút lọc cạnh ô tìm kiếm, mở menu một lựa chọn như bộ lọc bảng trên web: tiêu đề nhóm, lựa chọn
// đang chọn tô màu primary kèm dấu tích. Nút tô primary khi đang lọc khác lựa chọn đầu (Tất cả).
export function FilterMenu({ title, options, value, onChange, accessibilityLabel }) {
  const active = value !== options[0]?.value;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        accessibilityLabel={accessibilityLabel}
        className={cn(
          'size-10 items-center justify-center rounded-lg border active:opacity-70',
          active ? 'border-primary bg-primary/10' : 'border-input bg-background'
        )}>
        <Icon
          as={SlidersHorizontal}
          size={16}
          className={active ? 'text-primary' : 'text-muted-foreground'}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}>
              <Text className={cn('flex-1 text-sm', selected && 'text-primary')}>
                {option.label}
              </Text>
              {selected ? (
                <Icon as={CheckSquare} size={16} className="text-primary" />
              ) : (
                <View className="size-4" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
