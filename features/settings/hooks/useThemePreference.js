import { colorScheme as nativeWindTheme, useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { create } from 'zustand';

import { readThemeMode, writeThemeMode } from '@/shared/storage/preferences.storage';

const useThemeStore = create(() => ({
  mode: 'system',
  ready: false,
  saving: false,
  error: '',
}));

export function useRestoreThemePreference() {
  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const mode = await readThemeMode();
        if (!active) return;
        nativeWindTheme.set(mode);
        useThemeStore.setState({ mode, ready: true });
      } catch {
        if (active)
          useThemeStore.setState({
            ready: true,
            error: 'Chưa đọc được giao diện đã lưu.',
          });
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, []);
}

export function useThemePreference() {
  const state = useThemeStore();
  const { colorScheme } = useColorScheme();

  async function chooseMode(mode) {
    const previous = useThemeStore.getState();
    if (!previous.ready || previous.saving || (previous.mode === mode && !previous.error)) return;
    useThemeStore.setState({ saving: true, error: '' });
    try {
      nativeWindTheme.set(mode);
      await writeThemeMode(mode);
      useThemeStore.setState({ mode });
    } catch {
      nativeWindTheme.set(previous.mode);
      useThemeStore.setState({ error: 'Chưa lưu được giao diện. Hãy thử lại.' });
    } finally {
      useThemeStore.setState({ saving: false });
    }
  }

  return { ...state, colorScheme, chooseMode };
}
