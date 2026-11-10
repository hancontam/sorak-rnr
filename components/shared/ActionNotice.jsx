import { CircleAlert, CircleCheck } from 'lucide-react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';

export function ActionNotice({ message }) {
  if (!message) return null;
  return (
    <Alert
      icon={message.error ? CircleAlert : CircleCheck}
      variant={message.error ? 'destructive' : 'default'}
      accessibilityLiveRegion="polite">
      <AlertDescription className="text-xs">{message.text}</AlertDescription>
    </Alert>
  );
}
