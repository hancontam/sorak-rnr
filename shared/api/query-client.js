import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: false,
      },
      mutations: {
        // Không tự gửi lại thao tác ghi dữ liệu khi chưa biết server đã xử lý hay chưa.
        retry: false,
      },
    },
  });
}
