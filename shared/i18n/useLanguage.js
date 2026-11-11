import { useCallback, useEffect } from 'react';
import { create } from 'zustand';

import { readLanguage, writeLanguage } from '@/shared/storage/preferences.storage';

import { english } from './english';

const useLanguageStore = create(() => ({ language: 'vi', ready: false, saving: false, error: '' }));

export function translate(language, message, values) {
  const text = language === 'en' && Object.hasOwn(english, message) ? english[message] : message;
  return values ? text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match) : text;
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  return useCallback((message, values) => translate(language, message, values), [language]);
}

export function useLocale() {
  return useLanguageStore((state) => (state.language === 'en' ? 'en-US' : 'vi-VN'));
}

export function useRestoreLanguage() {
  useEffect(() => {
    let active = true;
    readLanguage().then(
      (language) => active && useLanguageStore.setState({ language, ready: true }),
      () =>
        active &&
        useLanguageStore.setState({ ready: true, error: 'Chưa đọc được ngôn ngữ đã lưu.' })
    );
    return () => {
      active = false;
    };
  }, []);
}

export function useLanguagePreference() {
  const state = useLanguageStore();

  async function chooseLanguage(language) {
    const current = useLanguageStore.getState();
    if (!current.ready || current.saving || (current.language === language && !current.error))
      return;
    useLanguageStore.setState({ saving: true, error: '' });
    try {
      await writeLanguage(language);
      useLanguageStore.setState({ language });
    } catch {
      useLanguageStore.setState({ error: 'Chưa lưu được ngôn ngữ. Hãy thử lại.' });
    } finally {
      useLanguageStore.setState({ saving: false });
    }
  }

  return { ...state, chooseLanguage };
}
