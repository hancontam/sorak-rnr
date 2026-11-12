import { Bell, Mail, Settings2, Volume2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { toast } from 'sonner-native';

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
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { usePushSettings } from '@/features/notification/hooks/usePushPreference';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { SettingsContent } from '../components/SettingsContent';
import { SettingsRow, SettingsSection } from '../components/SettingsRow';

export default function NotificationSettingsScreen() {
  const t = useTranslation();
  const user = useAuthStore((state) => state.user);
  const push = usePushSettings();
  const [blocked, setBlocked] = useState(false);
  const isParent = user?.role === AUTH_ROLES.parent;
  const systemBlocked = push.permission && !push.permission.granted && !push.permission.canAskAgain;

  async function togglePush(next) {
    try {
      if (!next) {
        await push.disable();
        toast.success(t('Đã tắt thông báo trên máy này'));
        return;
      }
      const result = await push.enable();
      if (result === 'enabled') toast.success(t('Đã bật thông báo trên máy này'));
      else if (result === 'blocked') setBlocked(true);
      else if (result === 'denied') toast(t('Chưa bật thông báo vì máy chưa được cấp quyền.'));
    } catch {
      toast.error(
        next
          ? t('Chưa bật được thông báo. Hãy thử lại.')
          : t('Chưa tắt được thông báo trên máy chủ. Hãy thử lại.')
      );
    }
  }

  function pushDetail() {
    if (!push.supported) return t('Bản cài này chưa hỗ trợ thông báo đẩy (Expo Go hoặc web).');
    if (systemBlocked) return t('Thông báo đang bị tắt trong cài đặt của máy.');
    if (push.enabled)
      return isParent
        ? t('Áp dụng cho các tài khoản phụ huynh đã thêm trên máy này.')
        : t('Nhận thông báo mới của Sorak trên máy này.');
    return t('Bật để nhận thông báo ngay khi nhà trường cập nhật.');
  }

  return (
    <SettingsContent>
      <SettingsSection
        title={t('Trên điện thoại')}
        footer={t('Tùy chỉnh các thông báo bạn muốn nhận trong Sorak.')}>
        <SettingsRow
          icon={Bell}
          label={t('Thông báo đẩy')}
          detail={pushDetail()}
          disabled={!push.supported || !push.ready}
          right={
            push.busy ? (
              <ActivityIndicator size="small" />
            ) : (
              <Switch
                checked={push.enabled}
                onCheckedChange={togglePush}
                disabled={!push.supported || !push.ready}
                accessibilityLabel={t('Thông báo đẩy')}
              />
            )
          }
        />
        {systemBlocked ? (
          <Button size="sm" variant="outline" onPress={push.openSystemSettings}>
            <Icon as={Settings2} size={14} />
            <Text>{t('Mở cài đặt của máy')}</Text>
          </Button>
        ) : null}
        <SettingsRow
          icon={Volume2}
          label={t('Âm thanh')}
          detail={t('Phát âm thanh khi có thông báo lúc Sorak đang mở.')}
          disabled={!push.enabled}
          right={
            <Switch
              checked={push.sound}
              disabled={!push.enabled}
              accessibilityLabel={t('Âm thanh')}
              onCheckedChange={(next) =>
                push.setSound(next).catch(() => toast.error(t('Chưa lưu được lựa chọn âm thanh.')))
              }
            />
          }
        />
      </SettingsSection>

      {user?.email ? (
        <SettingsSection title={t('Email')}>
          <SettingsRow
            icon={Mail}
            label={t('Mã xác thực')}
            detail={t('Mã đăng nhập và đặt lại mật khẩu luôn được gửi tới {email}.', {
              email: user.email,
            })}
          />
        </SettingsSection>
      ) : null}

      <AlertDialog open={blocked} onOpenChange={setBlocked}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Thông báo đang bị tắt')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('Mở Cài đặt của máy, chọn Sorak rồi bật Thông báo để nhận tin từ nhà trường.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>{t('Để sau')}</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={push.openSystemSettings}>
              <Text>{t('Mở cài đặt')}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsContent>
  );
}
