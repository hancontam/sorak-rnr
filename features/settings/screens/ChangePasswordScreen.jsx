import { CheckCircle2, CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { PasswordField } from '../components/PasswordField';
import { SettingsContent } from '../components/SettingsContent';
import { useChangePassword } from '../hooks/useAccountSettings';
import { settingsError } from '../utils/settings-errors';

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/])/;

export default function ChangePasswordScreen() {
  const t = useTranslation();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const pending = changePassword.isPending;

  async function submit() {
    if (pending || !currentPassword || !newPassword || !confirmation) return;
    setSuccess(false);
    if (newPassword.length < 8 || !PASSWORD_RULE.test(newPassword)) {
      setError(t('Mật khẩu mới cần ít nhất 8 ký tự, có chữ hoa, chữ số và ký tự đặc biệt.'));
      return;
    }
    if (currentPassword === newPassword) {
      setError(t('Mật khẩu mới phải khác mật khẩu hiện tại.'));
      return;
    }
    if (confirmation !== newPassword) {
      setError(t('Xác nhận mật khẩu chưa khớp.'));
      return;
    }

    setError('');
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      setSuccess(true);
    } catch (err) {
      setError(
        settingsError(
          err,
          t('Chưa đổi được mật khẩu.'),
          t('Kiểm tra mật khẩu hiện tại và thử lại.')
        )
      );
    } finally {
      changePassword.reset();
    }
  }

  return (
    <SettingsContent>
      <PasswordField
        label={t('Mật khẩu hiện tại')}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        editable={!pending}
        autoComplete="current-password"
      />
      <PasswordField
        label={t('Mật khẩu mới')}
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!pending}
        autoComplete="new-password"
        maxLength={100}
      />
      <PasswordField
        label={t('Xác nhận mật khẩu mới')}
        value={confirmation}
        onChangeText={setConfirmation}
        editable={!pending}
        autoComplete="new-password"
        maxLength={100}
        onSubmitEditing={submit}
      />
      <Text className="text-[11px] text-muted-foreground">
        {t('Tối thiểu 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt.')}
      </Text>
      {error ? (
        <Alert icon={CircleAlert}>
          <AlertDescription>{t(error)}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert icon={CheckCircle2}>
          <AlertDescription>{t('Đã đổi mật khẩu.')}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        size="sm"
        disabled={pending || !currentPassword || !newPassword || !confirmation}
        onPress={submit}>
        {pending ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text className="text-xs">{t('Cập nhật mật khẩu')}</Text>
        )}
      </Button>
    </SettingsContent>
  );
}
