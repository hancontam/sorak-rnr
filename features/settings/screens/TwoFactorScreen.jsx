import { useNavigation, useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { AUTH_ROLES } from '@/features/auth/utils/auth-roles';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { PasswordField } from '../components/PasswordField';
import { SettingsContent } from '../components/SettingsContent';
import { useTwoFactorSettings } from '../hooks/useAccountSettings';
import { settingsError } from '../utils/settings-errors';

export default function TwoFactorScreen() {
  const t = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { sendCode, update } = useTwoFactorSettings();
  const [sent, setSent] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const enabled = user?.is_2fa_enabled === true;
  const pending = sendCode.isPending || update.isPending;

  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  if (user?.role !== AUTH_ROLES.teacher || !user.email) {
    return (
      <SettingsContent>
        <Text className="text-xs">{t('Tài khoản chưa hỗ trợ xác thực hai bước qua email.')}</Text>
      </SettingsContent>
    );
  }

  async function requestCode() {
    if (pending || seconds) return;
    setError('');
    try {
      await sendCode.mutateAsync();
      setValue('');
      setSent(true);
      setSeconds(60);
    } catch (err) {
      setError(settingsError(err, t('Chưa gửi được mã. Nếu vừa yêu cầu mã, hãy chờ rồi thử lại.')));
    }
  }

  async function submit() {
    if (pending || (enabled ? !value : !sent || value.length !== 6)) return;
    setError('');
    try {
      await update.mutateAsync({ enabled, value });
      if (!navigation.isFocused()) return;
      if (router.canGoBack()) router.back();
      else router.replace('/settings/account');
    } catch (err) {
      setError(
        settingsError(
          err,
          t('Chưa cập nhật được xác thực hai bước.'),
          enabled
            ? t('Kiểm tra mật khẩu hiện tại rồi thử lại.')
            : t('Kiểm tra mã xác thực hoặc yêu cầu mã mới.')
        )
      );
    } finally {
      update.reset();
    }
  }

  return (
    <SettingsContent>
      <Text className="text-xs leading-5 text-muted-foreground">
        {enabled
          ? t('Nhập mật khẩu hiện tại để tắt xác thực hai bước.')
          : t('Sorak gửi mã gồm 6 chữ số tới email liên kết với tài khoản.')}
      </Text>
      {enabled ? (
        <PasswordField
          label={t('Mật khẩu hiện tại')}
          value={value}
          onChangeText={setValue}
          editable={!pending}
          onSubmitEditing={submit}
        />
      ) : (
        <>
          <Button
            size="sm"
            variant="outline"
            onPress={requestCode}
            disabled={pending || Boolean(seconds)}>
            {sendCode.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text className="text-xs">
                {seconds
                  ? t('Gửi lại sau {seconds}s', { seconds })
                  : sent
                    ? t('Gửi lại mã')
                    : t('Gửi mã xác thực')}
              </Text>
            )}
          </Button>
          {sent ? (
            <Input
              accessibilityLabel={t('Mã xác thực')}
              placeholder={t('Mã xác thực')}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              value={value}
              onChangeText={(text) => setValue(text.replace(/\D/g, '').slice(0, 6))}
              editable={!pending}
              onSubmitEditing={submit}
              className="min-h-11 rounded-xl text-xs"
            />
          ) : null}
        </>
      )}
      {error ? (
        <Alert icon={CircleAlert}>
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      ) : null}
      {enabled || sent ? (
        <Button
          size="sm"
          onPress={submit}
          disabled={pending || (enabled ? !value : value.length !== 6)}>
          {update.isPending ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-xs">
              {enabled ? t('Tắt xác thực hai bước') : t('Bật xác thực hai bước')}
            </Text>
          )}
        </Button>
      ) : null}
    </SettingsContent>
  );
}
