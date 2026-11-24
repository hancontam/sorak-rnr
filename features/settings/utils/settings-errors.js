import { serverMessage } from '@/shared/api/server-message';

// Ưu tiên câu máy chủ gửi (vd. "Mật khẩu hiện tại không chính xác"); câu riêng của màn khi không có.
export function settingsError(error, fallback, badRequest = fallback) {
  const status = error?.response?.status;
  if (status === 401) return 'Đăng nhập đã hết hạn. Hãy đăng nhập lại.';
  const fromServer = serverMessage(error);
  if (fromServer) return fromServer;
  if (status === 403) return 'Tài khoản chưa được phép thực hiện thao tác này.';
  if (status === 429) return 'Bạn đã thử quá nhiều lần. Hãy chờ rồi thử lại.';
  if (status === 400) return badRequest;
  if (error?.isAxiosError && !error.response) return 'Chưa kết nối được. Hãy thử lại.';
  return fallback;
}
