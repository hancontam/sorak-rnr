import { CircleAlert, CircleCheck, LogOut, UserRound } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { PanResponder, ScrollView, View } from 'react-native';
import { FadeInDown, FadeOutUp, ReduceMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { Text } from '@/components/ui/text';

import { useAuthTypography } from '../hooks/useAuthTypography';
import { useSession } from '../hooks/useSession';
import { roleLabel } from '../utils/auth-roles';

const toastEnter = FadeInDown.duration(200).reduceMotion(ReduceMotion.System);
const toastExit = FadeOutUp.duration(160).reduceMotion(ReduceMotion.System);

export default function SessionScreen() {
  const { user, notice, signOut, loginSucceeded, dismissLoginSuccess } = useSession();
  const typography = useAuthTypography();
  if (!user) return null;

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-background">
      <View className="flex-1">
        <View className="min-h-12 justify-center border-b border-border px-4 py-2.5">
          <Text role="heading" className="text-xl leading-6" style={typography.semiBold}>
            Tài khoản
          </Text>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-md gap-4 p-4">
          <Card className="rounded-2xl py-4">
            <CardContent className="flex-row items-center gap-3 px-4">
              <View className="size-10 items-center justify-center rounded-full bg-muted">
                <Icon as={UserRound} size={18} />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-sm leading-5" style={typography.semiBold}>
                  {user.fullName || user.username || 'Tài khoản Sorak'}
                </Text>
                <Badge variant="secondary" className="self-start">
                  <Text className="text-[11px] leading-[14px]" style={typography.medium}>
                    {roleLabel(user.role)}
                  </Text>
                </Badge>
              </View>
            </CardContent>
          </Card>
          {notice ? (
            <Alert icon={CircleAlert}>
              <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
                Phiên đăng nhập
              </AlertTitle>
              <AlertDescription className="text-xs leading-4" style={typography.regular}>
                {notice}
              </AlertDescription>
            </Alert>
          ) : null}
          <Button variant="outline" size="sm" onPress={signOut}>
            <Icon as={LogOut} size={14} />
            <Text className="text-xs" style={typography.medium}>
              Đăng xuất
            </Text>
          </Button>
        </ScrollView>
        <View
          className="absolute inset-x-0 top-3 items-center px-4"
          style={{ zIndex: 12, elevation: 12 }}
          pointerEvents="box-none">
          {loginSucceeded ? (
            <LoginSuccessToast typography={typography} onDismiss={dismissLoginSuccess} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function LoginSuccessToast({ typography, onDismiss }) {
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) => dy < -8 && -dy > Math.abs(dx),
        onPanResponderRelease: (_, { dy, vy }) => {
          if (dy < -28 || (dy < -12 && vy < -0.65)) onDismiss();
        },
      }),
    [onDismiss]
  );

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <NativeOnlyAnimatedView
      {...swipe.panHandlers}
      entering={toastEnter}
      exiting={toastExit}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityActions={[{ name: 'dismiss', label: 'Tắt thông báo' }]}
      onAccessibilityAction={({ nativeEvent }) => {
        if (nativeEvent.actionName === 'dismiss') onDismiss();
      }}
      onAccessibilityEscape={onDismiss}
      className="w-full max-w-md flex-row items-center gap-3 rounded-2xl border border-primary bg-primary p-3.5 shadow-lg shadow-black/20">
      <View className="size-7 items-center justify-center rounded-full bg-brand">
        <Icon as={CircleCheck} size={16} className="text-brand-foreground" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-xs leading-4 text-primary-foreground" style={typography.semiBold}>
          Đăng nhập hoàn tất!
        </Text>
        <Text
          className="text-[11px] leading-4 text-primary-foreground/85"
          style={typography.regular}>
          Bạn đã kết nối với Sorak.
        </Text>
      </View>
    </NativeOnlyAnimatedView>
  );
}
