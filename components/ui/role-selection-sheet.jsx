import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RoleSelectionSheet({ open, onOpenChange, onSelectRole }) {
  const insets = useSafeAreaInsets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="items-end justify-end bg-foreground/35 p-0"
        className="mx-0 w-full max-w-full gap-0 rounded-b-none rounded-t-[36px] border-border bg-card px-6 pt-7 shadow-lg shadow-black/20"
        style={{ paddingBottom: Math.max(insets.bottom, 26) }}>
        <DialogTitle className="sr-only">Chọn loại tài khoản</DialogTitle>
        <Button variant="secondary" className="w-full" onPress={() => onSelectRole('PARENT_PH')}>
          <Text>Tiếp tục với tài khoản Phụ huynh</Text>
        </Button>
        <Button
          variant="secondary"
          className="mt-2.5 w-full"
          onPress={() => onSelectRole('TEACHER_GV')}>
          <Text>Tiếp tục với tài khoản Nhà trường</Text>
        </Button>
        <Text className="mt-[30px] text-center text-[11px] font-semibold leading-4 text-muted-foreground">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <Text className="text-[11px] font-semibold text-muted-foreground underline">Điều khoản sử dụng</Text>{' '}
          và{' '}
          <Text className="text-[11px] font-semibold text-muted-foreground underline">Chính sách bảo mật</Text>{' '}
          của Sorak.
        </Text>
      </DialogContent>
    </Dialog>
  );
}
