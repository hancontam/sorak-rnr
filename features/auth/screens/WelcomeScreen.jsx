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
import { useAuthTypography } from '../hooks/useAuthTypography';
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
  const typography = useAuthTypography();
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
            branding={<SorakBrand typography={typography} />}
            typography={typography}
            paused={!focused || roleSheetOpen || Platform.OS === 'web'}
          />
          <View className="gap-3 px-5">
            {hasAccounts ? (
              <Button size="sm" variant="outline" onPress={() => router.push('/accounts')}>
                <Text className="text-xs">{t('Tài khoản đã lưu')}</Text>
              </Button>
            ) : null}
            {notice ? (
              <Alert icon={CircleAlert}>
                <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
                  {t('Phiên đăng nhập')}
                </AlertTitle>
                <AlertDescription className="text-xs leading-4" style={typography.regular}>
                  {t(notice)}
                </AlertDescription>
              </Alert>
            ) : null}
            {Platform.OS === 'web' ? (
              <Alert icon={Smartphone}>
                <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
                  {t('Đăng nhập trên điện thoại')}
                </AlertTitle>
                <AlertDescription className="text-xs leading-4" style={typography.regular}>
                  {t('Mở ứng dụng Sorak trên iOS hoặc Android để tiếp tục.')}
                </AlertDescription>
              </Alert>
            ) : (
              <Button className="h-10 rounded-xl" onPress={() => setRoleSheetOpen(true)}>
                <Text className="text-xs" style={typography.semiBold}>
                  {t('Tiếp tục')}
                </Text>
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
      <RoleSheet
        visible={roleSheetOpen}
        typography={typography}
        selectedRole={lastRole}
        onClose={() => setRoleSheetOpen(false)}
        onSelect={selectRole}
      />
    </SafeAreaView>
  );
}
