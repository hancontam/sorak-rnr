import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Alert, Platform } from 'react-native';

export function useUnsavedChanges(dirty, saving) {
  const navigation = useNavigation();
  function confirmDiscard(onDiscard) {
    if (saving) return;
    if (!dirty) {
      onDiscard();
      return;
    }
    if (Platform.OS === 'web') {
      if (globalThis.confirm('Bỏ thay đổi chưa lưu?')) onDiscard();
      return;
    }
    Alert.alert('Thay đổi chưa lưu', 'Bạn muốn bỏ thay đổi và quay lại?', [
      { text: 'Ở lại', style: 'cancel' },
      {
        text: 'Bỏ thay đổi',
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
