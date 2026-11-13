import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useState } from 'react';

import { useTranslation } from '@/shared/i18n/useLanguage';

/**
 * Chặn rời màn khi còn thay đổi chưa lưu và hỏi bằng ConfirmDialog (AlertDialog của app),
 * không dùng Alert hệ thống. Màn gọi hook phải hiển thị `<ConfirmDialog {...dialog} />`.
 */
export function useUnsavedChanges(dirty, saving) {
  const navigation = useNavigation();
  const t = useTranslation();
  const [request, setRequest] = useState(null);

  function confirmDiscard(onDiscard) {
    if (saving) return;
    if (!dirty) {
      onDiscard();
      return;
    }
    setRequest({
      title: t('Thay đổi chưa lưu'),
      description: t('Bạn muốn bỏ thay đổi và quay lại?'),
      cancelLabel: t('Ở lại'),
      confirmLabel: t('Bỏ thay đổi'),
      destructive: true,
      onConfirm: onDiscard,
    });
  }

  usePreventRemove(dirty || saving, ({ data }) =>
    confirmDiscard(() => navigation.dispatch(data.action))
  );

  return { confirmDiscard, dialog: { request, onClose: () => setRequest(null) } };
}
