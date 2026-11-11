import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Alert, Platform } from 'react-native';

import { useTranslation } from '@/shared/i18n/useLanguage';

export function useUnsavedChanges(dirty, saving) {
  const navigation = useNavigation();
  const t = useTranslation();
  function confirmDiscard(onDiscard) {
    if (saving) return;
    if (!dirty) {
      onDiscard();
      return;
    }
    if (Platform.OS === 'web') {
      if (globalThis.confirm(t('Bỏ thay đổi chưa lưu?'))) onDiscard();
      return;
    }
    Alert.alert(t('Thay đổi chưa lưu'), t('Bạn muốn bỏ thay đổi và quay lại?'), [
      { text: t('Ở lại'), style: 'cancel' },
      {
        text: t('Bỏ thay đổi'),
        style: 'destructive',
        onPress: onDiscard,
      },
    ]);
  }
  usePreventRemove(dirty || saving, ({ data }) =>
    confirmDiscard(() => navigation.dispatch(data.action))
  );
  return confirmDiscard;
}
