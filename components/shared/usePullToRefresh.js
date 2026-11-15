import { useEffect, useRef, useState } from 'react';

/**
 * Vòng xoay "kéo để tải lại" chỉ hiện khi người dùng tự kéo, không hiện khi app tự tải lại ngầm
 * (mở lại màn, dữ liệu cũ). Truyền `refresh` là undefined để tắt kéo tải lại.
 */
export function usePullToRefresh(refresh) {
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }

  return { refreshing, onRefresh: refresh ? onRefresh : undefined };
}
