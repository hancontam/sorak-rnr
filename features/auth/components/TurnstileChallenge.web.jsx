import { Smartphone } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function TurnstileChallenge() {
  return (
    <Alert icon={Smartphone}>
      <AlertTitle className="text-sm leading-5">Xác minh trên điện thoại</AlertTitle>
      <AlertDescription className="text-xs leading-4">
        Mở ứng dụng Sorak trên iOS hoặc Android để tiếp tục.
      </AlertDescription>
    </Alert>
  );
}
