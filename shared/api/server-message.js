// Câu backend gửi kèm lỗi 4xx đã viết cho người dùng (vd. "Tài khoản hoặc mật khẩu không chính xác",
// "Mã OTP không chính xác. Bạn còn 3 lần thử"), nên hiện đúng câu đó thay cho câu chung của app.
// Trả '' khi lỗi mạng, lỗi 5xx, không có message hoặc message kỹ thuật tiếng Anh (vd. "Route … not
// found") để nơi gọi dùng câu riêng của màn.
const VIETNAMESE = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

export function serverMessage(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  if (!status || status >= 500 || typeof message !== 'string') return '';
  const text = message.trim();
  return text && VIETNAMESE.test(text) ? text : '';
}
