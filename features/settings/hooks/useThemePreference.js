import { usePreferencesStore } from '@/features/settings/store/preferences.store';
import { readThemeMode, saveThemeMode } from '@/shared/storage/preferences.storage';
import { colorScheme } from 'nativewind';
import * as React from 'react';

export function useRestoreThemePreference() {
  React.useEffect(() => {
    let active = true;

    async function restore() {
      let themeMode = 'system';
      try {
        themeMode = await readThemeMode();
      } catch {
        // Nếu storage không đọc được, tiếp tục theo giao diện của thiết bị.
      }
      if (!active) return;
      try {
        colorScheme.set(themeMode);
      } catch {
        themeMode = 'system';
      }
      usePreferencesStore.getState().restoreThemeMode(themeMode);
    }

    restore();
    return () => {
      active = false;
    };
  }, []);
}

export function useThemePreference() {
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const [isSaving, setIsSaving] = React.useState(false);

  async function chooseThemeMode(nextMode) {
    if (nextMode === themeMode || isSaving) return;

    const previousMode = themeMode;
    setIsSaving(true);
    try {
      colorScheme.set(nextMode);
      setThemeMode(nextMode);
      await saveThemeMode(nextMode);
    } catch (error) {
      try {
        colorScheme.set(previousMode);
      } catch {
        // Giữ UI ở trạng thái cũ khi hệ điều hành từ chối đổi giao diện.
      }
      setThemeMode(previousMode);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }

  return { themeMode, isSaving, chooseThemeMode };
}
