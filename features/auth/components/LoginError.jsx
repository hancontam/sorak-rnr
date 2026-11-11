import { CircleAlert } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function LoginError({ message, typography }) {
  const t = useTranslation();
  if (!message) return null;
  return (
    <Alert icon={CircleAlert} variant="destructive" accessibilityLiveRegion="polite">
      <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
        {t('Không thể tiếp tục')}
      </AlertTitle>
      <AlertDescription className="text-xs leading-4" style={typography.regular}>
        {typeof message === 'string' ? t(message) : t(message.text, message.values)}
      </AlertDescription>
    </Alert>
  );
}
