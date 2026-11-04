import {
  DEFAULT_FLOWER_CRITERIA,
  normalizeCriteria,
} from '@/features/assessment/lib/flower-criteria';
import {
  readFlowerCriteria,
  saveFlowerCriteria,
} from '@/shared/storage/assessment-criteria.storage';
import * as React from 'react';

// Tiêu chí gợi ý tặng hoa: đọc/ghi AsyncStorage trên thiết bị, giữ trong state của hook.
// Backend chưa có endpoint lưu tiêu chí nên không gọi API.
export function useFlowerCriteria() {
  const [criteria, setCriteria] = React.useState(DEFAULT_FLOWER_CRITERIA);
  const [isReady, setIsReady] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    async function restore() {
      let stored = null;
      try {
        stored = await readFlowerCriteria();
      } catch {
        stored = null;
      }
      if (!active) return;
      setCriteria(normalizeCriteria(stored));
      setIsReady(true);
    }
    restore();
    return () => {
      active = false;
    };
  }, []);

  async function persist(nextCriteria) {
    const normalized = normalizeCriteria(nextCriteria);
    setIsSaving(true);
    setError('');
    try {
      await saveFlowerCriteria(normalized);
      setCriteria(normalized);
      return normalized;
    } catch (storageError) {
      setError(storageError.message || 'Không lưu được tiêu chí.');
      throw storageError;
    } finally {
      setIsSaving(false);
    }
  }

  return { criteria, isReady, isSaving, error, setError, persist };
}
