import { CircleAlert } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function LoginError({ message }) {
  const t = useTranslation();
  if (!message) return null;
  return (
    <Alert icon={CircleAlert} variant="destructive" accessibilityLiveRegion="polite">
      <AlertTitle className="text-sm font-semibold leading-5">{t('Không thể tiếp tục')}</AlertTitle>
      <AlertDescription className="text-xs leading-4">
        {typeof message === 'string' ? t(message) : t(message.text, message.values)}
      </AlertDescription>
    </Alert>
  );
}
