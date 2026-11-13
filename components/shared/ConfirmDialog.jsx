import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';

/**
 * Hộp xác nhận chung (AlertDialog của showcase). `request` null thì đóng; khi mở gồm
 * { title, description, confirmLabel, cancelLabel, destructive, onConfirm }.
 */
export function ConfirmDialog({ request, onClose }) {
  return (
    <AlertDialog open={Boolean(request)} onOpenChange={(open) => !open && onClose()}>
      {request ? (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{request.title}</AlertDialogTitle>
            {request.description ? (
              <AlertDialogDescription>{request.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>{request.cancelLabel}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              variant={request.destructive ? 'destructive' : 'default'}
              onPress={() => {
                onClose();
                request.onConfirm();
              }}>
              <Text>{request.confirmLabel}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : null}
    </AlertDialog>
  );
}
