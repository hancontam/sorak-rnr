import { useNavigation, useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { toast } from 'sonner-native';

import { OtpCodeInput } from '@/components/shared/OtpCodeInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
        <Text className="px-1 text-xs text-muted-foreground">
          {t('Tài khoản chưa hỗ trợ xác thực hai bước qua email.')}
        </Text>
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

  // onSubmitEditing truyền event, onComplete của ô OTP truyền chuỗi mã vừa nhập đủ.
  async function submit(code) {
    const input = typeof code === 'string' ? code : value;
    if (pending || (enabled ? !input : !sent || input.length !== 6)) return;
    setError('');
    try {
      await update.mutateAsync({ enabled, value: input });
      toast.success(enabled ? t('Đã tắt xác thực hai bước') : t('Đã bật xác thực hai bước'));
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
      <Text className="px-1 text-xs leading-5 text-muted-foreground">
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
          <Button variant="outline" onPress={requestCode} disabled={pending || Boolean(seconds)}>
            {sendCode.isPending ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text>
                {seconds
                  ? t('Gửi lại sau {seconds}s', { seconds })
                  : sent
                    ? t('Gửi lại mã')
                    : t('Gửi mã xác thực')}
              </Text>
            )}
          </Button>
          {sent ? (
            <View className="items-center py-1">
              <OtpCodeInput
                otp={value}
                onChange={setValue}
                onSubmit={submit}
                pending={pending}
                autoFocus
              />
            </View>
          ) : null}
        </>
      )}
      {error ? (
        <Alert icon={CircleAlert} variant="destructive">
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      ) : null}
      {enabled || sent ? (
        <Button onPress={submit} disabled={pending || (enabled ? !value : value.length !== 6)}>
          {update.isPending ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text>{enabled ? t('Tắt xác thực hai bước') : t('Bật xác thực hai bước')}</Text>
          )}
        </Button>
      ) : null}
    </SettingsContent>
  );
}
