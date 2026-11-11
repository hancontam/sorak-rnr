import { Smartphone } from 'lucide-react-native';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function TurnstileChallenge() {
  const t = useTranslation();
  return (
    <Alert icon={Smartphone}>
      <AlertTitle className="text-sm leading-5">{t('Xác minh trên điện thoại')}</AlertTitle>
      <AlertDescription className="text-xs leading-4">
        {t('Mở ứng dụng Sorak trên iOS hoặc Android để tiếp tục.')}
      </AlertDescription>
    </Alert>
  );
}
