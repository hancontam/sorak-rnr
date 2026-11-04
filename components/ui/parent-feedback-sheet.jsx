import { Button } from '@/components/ui/button';
import { BottomSheetContent, Dialog } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';

function formatFeedbackTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (part) => String(part).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Bottom sheet xem ý kiến phản hồi của phụ huynh (Figma 2289:3115).
// Giáo viên xem toàn bộ phản hồi của tháng nhưng mỗi lần tập trung một phụ huynh,
// chuyển vòng bằng nút trước/sau.
export function ParentFeedbackSheet({ open, onOpenChange, items, initialIndex = 0 }) {
  const total = items.length;
  const [index, setIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    if (open) setIndex(Math.min(initialIndex, Math.max(total - 1, 0)));
  }, [open, initialIndex, total]);

  const current = total > 0 ? items[Math.min(index, total - 1)] : null;

  function step(direction) {
    if (total === 0) return;
    setIndex((prev) => (prev + direction + total) % total);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent open={open} title="Ý kiến phản hồi từ phụ huynh">
        <Text className="mt-1 text-xs text-muted-foreground">
          {total > 0
            ? `${Math.min(index, total - 1) + 1} / ${total} phản hồi trong tháng`
            : 'Chưa có phản hồi nào trong tháng'}
        </Text>

        {current ? (
          <View className="mt-4 gap-2 rounded-xl border border-border bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-foreground">
              {current.name} · {current.code}
            </Text>
            <Text className="text-xs font-medium text-rose-500">
              {current.rosesCount ?? 0}/{current.maxRoses ?? 5} hoa
            </Text>
            <Text className="text-sm leading-5 text-foreground">“{current.feedback}”</Text>
            <Text className="text-[11px] text-muted-foreground">
              {current.feedbackBy || 'Phụ huynh'}
              {current.feedbackAt ? ` · ${formatFeedbackTime(current.feedbackAt)}` : ''}
            </Text>
          </View>
        ) : (
          <View className="mt-4 rounded-xl border border-border bg-card px-4 py-6">
            <Text className="text-center text-xs text-muted-foreground">
              Giáo viên chưa nhận được phản hồi nào cho tháng này.
            </Text>
          </View>
        )}

        <View className="mt-4 flex-row justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => step(-1)}
            disabled={total < 2}
            accessibilityLabel="Phản hồi trước">
            <Icon as={ChevronLeft} size={16} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => step(1)}
            disabled={total < 2}
            accessibilityLabel="Phản hồi tiếp theo">
            <Icon as={ChevronRight} size={16} strokeWidth={2} />
          </Button>
          <Button size="sm" onPress={() => onOpenChange(false)}>
            <Text className="text-primary-foreground">Đóng</Text>
          </Button>
        </View>
      </BottomSheetContent>
    </Dialog>
  );
}
