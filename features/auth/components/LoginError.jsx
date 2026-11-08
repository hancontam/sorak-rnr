import { CircleAlert } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LoginError({ message, typography }) {
  if (!message) return null;
  return (
    <Alert icon={CircleAlert} variant="destructive" accessibilityLiveRegion="polite">
      <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
        Không thể tiếp tục
      </AlertTitle>
      <AlertDescription className="text-xs leading-4" style={typography.regular}>
        {message}
      </AlertDescription>
    </Alert>
  );
}
