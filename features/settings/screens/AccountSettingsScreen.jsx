import { useRouter } from 'expo-router';
import {
  CircleAlert,
  KeyRound,
  LogOut,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow } from '../components/SettingsRow';
import { useDeviceSessions } from '../hooks/useAccountSettings';
import { settingsError } from '../utils/settings-errors';

const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

function SessionCard({ session, current }) {
  const lastActive = session.lastActiveAt || session.lastActive;
  const date = lastActive ? new Date(lastActive) : null;
  const time = date && Number.isFinite(date.getTime()) ? dateFormat.format(date) : '';
  return (
    <Card className="rounded-xl py-2.5 shadow-none">
      <CardContent className="flex-row items-center gap-2.5 px-3">
        <Icon as={session.deviceType === 'mobile' ? Smartphone : Monitor} size={17} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-xs font-semibold">
            {session.deviceDisplay || session.deviceInfo || 'Thiết bị đăng nhập'}
          </Text>
          {time ? (
            <Text className="text-[11px] text-muted-foreground">Hoạt động {time}</Text>
          ) : null}
        </View>
        {current ? (
          <Badge variant="brand">
            <Text className="text-[10px]">Thiết bị này</Text>
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AccountSettingsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { sessions, revokeAll } = useDeviceSessions();
  const current = sessions.data?.find((session) => session.isCurrent === true);
  const others = sessions.data?.filter((session) => session !== current) ?? [];
  const canUseTwoFactor = user?.role === AUTH_ROLES.teacher && Boolean(user.email);
  const loadError = settingsError(sessions.error, 'Chưa tải được danh sách phiên đăng nhập.');

  return (
    <SettingsContent>
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase text-muted-foreground">Bảo mật</Text>
        <Card className="rounded-xl py-0 shadow-none">
          <CardContent className="px-1 py-1">
            <SettingsRow
              icon={KeyRound}
              label="Đổi mật khẩu"
              onPress={() => router.push('/settings/change-password')}
            />
            {canUseTwoFactor ? (
              <SettingsRow
                icon={ShieldCheck}
                label="Xác thực hai bước qua email"
                detail={user.is_2fa_enabled ? 'Đang bật' : 'Đang tắt'}
                onPress={() => router.push('/settings/two-factor')}
              />
            ) : null}
          </CardContent>
        </Card>
      </View>

      <View className="gap-2.5 border-t border-border pt-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="text-sm font-semibold">Phiên đăng nhập</Text>
            <Text className="text-[11px] text-muted-foreground">
              Thiết bị và lần hoạt động gần nhất
            </Text>
          </View>
          <Button
            size="sm"
            variant="ghost"
            onPress={() => sessions.refetch()}
            disabled={sessions.isFetching || revokeAll.isPending}>
            {sessions.isFetching ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon as={RefreshCw} size={13} />
            )}
            <Text className="text-xs">Làm mới</Text>
          </Button>
        </View>
        {sessions.isError ? (
          <Alert icon={CircleAlert}>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        ) : null}
        {sessions.data ? (
          <>
            {current ? (
              <>
                <Text className="text-xs font-semibold">Phiên hiện tại</Text>
                <SessionCard session={current} current />
              </>
            ) : null}
            {others.length ? (
              <>
                <Text className="text-[11px] font-semibold uppercase text-muted-foreground">
                  {current ? 'Các phiên đăng nhập khác' : 'Các phiên đăng nhập'} ({others.length})
                </Text>
                {others.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </>
            ) : (
              <Text className="text-xs text-muted-foreground">
                {current
                  ? 'Không có phiên đăng nhập khác.'
                  : 'Chưa có phiên đăng nhập nào trong danh sách.'}
              </Text>
            )}
          </>
        ) : null}
      </View>

      {sessions.isSuccess ? (
        <View className="gap-2 border-t border-border pt-4">
          <Text className="text-xs text-muted-foreground">Bao gồm thiết bị đang sử dụng.</Text>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={revokeAll.isPending}>
                {revokeAll.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Icon as={LogOut} size={14} />
                )}
                <Text className="text-xs">Đăng xuất tất cả thiết bị</Text>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Đăng xuất tất cả thiết bị?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tất cả phiên của tài khoản sẽ bị thu hồi, kể cả trên thiết bị này.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Hủy</Text>
                </AlertDialogCancel>
                <AlertDialogAction onPress={() => revokeAll.mutate()}>
                  <Text>Đăng xuất tất cả</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {revokeAll.isError ? (
            <Alert icon={CircleAlert}>
              <AlertDescription>
                {settingsError(revokeAll.error, 'Chưa đăng xuất được tất cả thiết bị.')}
              </AlertDescription>
            </Alert>
          ) : null}
        </View>
      ) : null}
    </SettingsContent>
  );
}
