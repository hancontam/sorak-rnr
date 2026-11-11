export function settingsError(error, fallback, badRequest = fallback) {
  const status = error?.response?.status;
  if (status === 401) return 'Phiên không còn hợp lệ. Hãy đăng nhập lại.';
  if (status === 403) return 'Tài khoản chưa được phép thực hiện thao tác này.';
  if (status === 429) return 'Bạn đã thử quá nhiều lần. Hãy chờ rồi thử lại.';
  if (status === 400) return badRequest;
  if (error?.isAxiosError && !error.response) return 'Chưa kết nối được máy chủ. Hãy thử lại.';
  return fallback;
}
