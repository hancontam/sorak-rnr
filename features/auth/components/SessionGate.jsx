import { CircleAlert } from 'lucide-react-native';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

export function SessionGate({ status, error, onRetry, onSignOut, children }) {
  const t = useTranslation();
  if (status === 'signed-in' || status === 'signed-out') return children;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="mx-auto w-full max-w-md grow justify-center gap-4 p-4">
        {status === 'restore-error' ? (
          <>
            <Alert icon={CircleAlert} variant="destructive">
              <AlertTitle className="text-sm leading-5">{t('Chưa thể mở phiên')}</AlertTitle>
              <AlertDescription className="text-xs leading-4">{t(error)}</AlertDescription>
            </Alert>
            <Button size="sm" onPress={onRetry}>
              <Text className="text-xs">{t('Thử lại')}</Text>
            </Button>
            <Button variant="outline" size="sm" onPress={onSignOut}>
              <Text className="text-xs">{t('Thoát phiên trên thiết bị')}</Text>
            </Button>
          </>
        ) : (
          <>
            <ActivityIndicator size="small" />
            <Text className="text-center text-xs text-muted-foreground">
              {status === 'restoring'
                ? t('Đang khôi phục phiên')
                : status === 'switching'
                  ? t('Đang chuyển tài khoản')
                  : t('Đang đăng xuất')}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
