import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Khung giữ chỗ theo hình dạng nội dung sắp hiện, thay vòng xoay khi tải lần đầu:
// list = danh sách học sinh/thông báo, timetable = cột giờ + thẻ hoạt động, cards = các khối thông tin.
export function LoadingSkeleton({ variant = 'list', rows = 6, label, className }) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      className={cn('gap-3', className)}>
      {variant === 'timetable' ? (
        Array.from({ length: rows }, (_, index) => (
          <View key={index} className="flex-row gap-3">
            <View className="w-11 gap-1.5 pt-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-8" />
            </View>
            <View className="flex-1 gap-2 border border-border p-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-3/4" />
            </View>
          </View>
        ))
      ) : variant === 'cards' ? (
        Array.from({ length: rows }, (_, index) => (
          <View key={index} className="gap-3 border border-border p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </View>
        ))
      ) : (
        <View className="border border-border">
          {Array.from({ length: rows }, (_, index) => (
            <View
              key={index}
              className={cn(
                'flex-row items-center gap-3 px-4 py-3',
                index > 0 && 'border-t border-border'
              )}>
              <Skeleton className="size-9 rounded-full" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-2/5" />
                <Skeleton className="h-3 w-1/4" />
              </View>
              <Skeleton className="h-5 w-14" />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
