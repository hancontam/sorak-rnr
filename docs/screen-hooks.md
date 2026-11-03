# Hook dùng trực tiếp trong screen

File này giúp người đọc biết screen nào giữ hook và logic trạng thái/dữ liệu ngay trong file screen, thay vì tách toàn bộ sang custom hook. Đây là báo cáo về code đã làm, không phải nơi đặt source code.

Khi hoàn thành hoặc sửa một screen thuộc trường hợp này, thêm hoặc cập nhật một dòng trong bảng. Ghi rõ tên hook được gọi trực tiếp, nó quản lý gì, file API liên quan nếu có và lý do giữ logic trong screen. Sửa hoặc bỏ dòng khi code thay đổi để báo cáo khớp với source.

| Feature | Screen | Hook gọi trực tiếp trong screen | State/logic giữ trong screen | File API liên quan | Lý do giữ trong screen |
| --- | --- | --- | --- | --- | --- |
| Auth | `features/auth/screens/WelcomeScreen.jsx` | `useState` | Mở/đóng bottom sheet chọn vai trò; chọn xong chuyển sang màn nhập tài khoản. | Không có | Trạng thái chỉ thuộc màn Welcome, không cần custom hook. |
| Auth | `features/auth/screens/AccountScreen.jsx` | `useState` | Giá trị tài khoản và lỗi nhập rỗng trước khi chuyển sang màn mật khẩu. | Không có | Trạng thái form một bước, không cần custom hook. |
| Auth | `features/auth/screens/PasswordScreen.jsx` | `useState`, `useMutation` | Giá trị mật khẩu, hiện/ẩn mật khẩu, thông báo; email và OTP của sheet quên mật khẩu; gửi và xác thực OTP. Đăng nhập qua `useLogin`. | `features/auth/api/auth.api.js` trực tiếp cho quên mật khẩu, qua `useLogin` cho đăng nhập. | State UI và hai request đơn giản thuộc riêng màn này; logic phiên đăng nhập ở hook riêng. |

Không ghi screen chỉ hiển thị/điều hướng hoặc chỉ gọi custom hook đã đặt ở `features/<feature>/hooks/`. Không ghi hook nằm bên trong `components/ui/` vào đây.
