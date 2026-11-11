import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { connectSessionClient, restoreSession, signOut } from '../session';
import { useAuthStore } from '../store/auth.store';

export function useSessionBootstrap() {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const disconnect = connectSessionClient(queryClient);
    void restoreSession();
    return disconnect;
  }, [queryClient]);

  return {
    status: Platform.OS === 'web' ? 'signed-out' : status,
    error,
    retry: restoreSession,
    signOut,
  };
}
