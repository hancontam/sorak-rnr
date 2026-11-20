import { useRouter } from 'expo-router';
import {
  CircleAlert,
  KeyRound,
  LogOut,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
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
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES, roleLabel } from '@/features/auth/utils/auth-roles';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';
import { useDeviceSessions } from '../hooks/useAccountSettings';
import { settingsError } from '../utils/settings-errors';

function sessionTime(session, locale) {
  const lastActive = session.lastActiveAt || session.lastActive;
  const date = lastActive ? new Date(lastActive) : null;
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(date)
    : '';
}

// Phiên từ app Sorak (User-Agent "Sorak/x (Android 16; Pixel 7)") hiện "Ứng dụng Sorak · Android 16 ·
// Pixel 7"; backend chỉ nhận trình duyệt nên tự ghi "Trình duyệt Web" cho các phiên này.
const APP_AGENT = /^Sorak\/[\w.]+ \(([^)]*)\)/;

function sessionLabel(session, t) {
  const app = APP_AGENT.exec(session.deviceInfo || '');
  if (app) {
    const parts = app[1]
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part && part !== 'iPhone' && part !== 'iPad');
    return [t('Ứng dụng Sorak'), ...parts].join(' · ');
  }
  return session.deviceDisplay || session.deviceInfo || t('Thiết bị đăng nhập');
}

function SessionRow({ session, current }) {
  const t = useTranslation();
  const locale = useLocale();
  const time = sessionTime(session, locale);
  const mobile = session.deviceType === 'mobile' || APP_AGENT.test(session.deviceInfo || '');
  return (
    <SettingsRow
      icon={mobile ? Smartphone : Monitor}
      label={sessionLabel(session, t)}
      detail={time ? t('Hoạt động {time}', { time }) : undefined}
      right={
        current ? (
          <Badge variant="secondary">
            <Text>{t('Thiết bị này')}</Text>
          </Badge>
        ) : null
      }
    />
  );
}

export default function AccountSettingsScreen() {
  const t = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { sessions, revokeAll } = useDeviceSessions();
  const current = sessions.data?.find((session) => session.isCurrent === true);
  const others = sessions.data?.filter((session) => session !== current) ?? [];
  const canUseTwoFactor = user?.role === AUTH_ROLES.teacher && Boolean(user.email);
  const loadError = settingsError(sessions.error, t('Chưa tải được danh sách thiết bị đăng nhập.'));
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  return (
    <SettingsContent>
      <SettingsSection title={t('Vai trò')}>
        <SettingsRow icon={UserRound} label={t(roleLabel(user?.role))} />
      </SettingsSection>

      <SettingsSection title={t('Bảo mật')}>
        <SettingsRow
          icon={KeyRound}
          label={t('Đổi mật khẩu')}
          onPress={() => router.push('/settings/change-password')}
        />
        {canUseTwoFactor ? (
          <SettingsRow
            icon={ShieldCheck}
            label={t('Xác thực hai bước qua email')}
            detail={t('Yêu cầu mã OTP mỗi lần đăng nhập mới')}
            value={user.is_2fa_enabled ? t('Đang bật') : t('Đang tắt')}
            onPress={() => router.push('/settings/two-factor')}
          />
        ) : null}
      </SettingsSection>

      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2 px-1">
          <Text className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {t('Thiết bị đang đăng nhập')}
          </Text>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            accessibilityLabel={t('Làm mới')}
            onPress={() => sessions.refetch()}
            disabled={sessions.isFetching || revokeAll.isPending}>
            {sessions.isFetching ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon as={RefreshCw} size={14} />
            )}
            <Text>{t('Làm mới')}</Text>
          </Button>
        </View>
        {sessions.isError ? (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertDescription>{t(loadError)}</AlertDescription>
          </Alert>
        ) : null}
        {sessions.data ? (
          <>
            {current ? <SessionRow session={current} current /> : null}
            {others.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
            {!others.length ? (
              <Text className="px-1 text-2xs text-muted-foreground">
                {current
                  ? t('Không có thiết bị nào khác đang đăng nhập.')
                  : t('Chưa có thiết bị nào đang đăng nhập.')}
              </Text>
            ) : null}
          </>
        ) : null}

        {sessions.isSuccess ? (
          <SettingsRow
            icon={LogOut}
            label={t('Đăng xuất tất cả thiết bị')}
            destructive
            disabled={revokeAll.isPending}
            onPress={() => setConfirmRevoke(true)}
          />
        ) : null}
        <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('Đăng xuất tất cả thiết bị?')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('Tài khoản sẽ bị đăng xuất trên mọi thiết bị, kể cả máy này.')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>{t('Hủy')}</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={() => revokeAll.mutate()}>
                <Text>{t('Đăng xuất tất cả')}</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {revokeAll.isError ? (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertDescription>
              {t(settingsError(revokeAll.error, 'Chưa đăng xuất được tất cả thiết bị.'))}
            </AlertDescription>
          </Alert>
        ) : null}
      </View>
    </SettingsContent>
  );
}
