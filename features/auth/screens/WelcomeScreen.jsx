import { useRouter } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { CircleAlert, Smartphone } from 'lucide-react-native';
import { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { RoleSheet } from '../components/RoleSheet';
import { SorakBrand } from '../components/SorakBrand';
import { WelcomeCarousel } from '../components/WelcomeCarousel';
import { useSession } from '../hooks/useSession';
import { useAuthStore } from '../store/auth.store';
import { AUTH_ROLES } from '../utils/auth-roles';

export default function WelcomeScreen() {
  const t = useTranslation();
  const router = useRouter();
  const focused = useIsFocused();
  const { notice } = useSession();
  const hasAccounts = useAuthStore((state) =>
    state.linkedAccounts.some((account) => account.role === AUTH_ROLES.parent)
  );
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [lastRole, setLastRole] = useState(AUTH_ROLES.teacher);

  function selectRole(role) {
    setLastRole(role);
    setRoleSheetOpen(false);
    router.push({ pathname: '/auth/login', params: { role } });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView bounces={false} contentContainerClassName="grow">
        <View className="mx-auto w-full max-w-md grow gap-2 pb-4 pt-3">
          <WelcomeCarousel
            branding={<SorakBrand />}
            paused={!focused || roleSheetOpen || Platform.OS === 'web'}
          />
          <View className="gap-3 px-5">
            {hasAccounts ? (
              <Button variant="outline" onPress={() => router.push('/accounts')}>
                <Text>{t('Tài khoản đã lưu')}</Text>
              </Button>
            ) : null}
            {notice ? (
              <Alert icon={CircleAlert}>
                <AlertTitle>{t('Phiên đăng nhập')}</AlertTitle>
                <AlertDescription>{t(notice)}</AlertDescription>
              </Alert>
            ) : null}
            {Platform.OS === 'web' ? (
              <Alert icon={Smartphone}>
                <AlertTitle>{t('Đăng nhập trên điện thoại')}</AlertTitle>
                <AlertDescription>
                  {t('Mở ứng dụng Sorak trên iOS hoặc Android để tiếp tục.')}
                </AlertDescription>
              </Alert>
            ) : (
              <Button size="lg" onPress={() => setRoleSheetOpen(true)}>
                <Text>{t('Tiếp tục')}</Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
      <RoleSheet
        visible={roleSheetOpen}
        selectedRole={lastRole}
        onClose={() => setRoleSheetOpen(false)}
        onSelect={selectRole}
      />
    </SafeAreaView>
  );
}
