# Hook dùng trực tiếp trong screen

File này giúp người đọc biết screen nào giữ hook và logic trạng thái/dữ liệu ngay trong file screen, thay vì tách toàn bộ sang custom hook. Đây là báo cáo về code đã làm, không phải nơi đặt source code.

Khi hoàn thành hoặc sửa một screen thuộc trường hợp này, thêm hoặc cập nhật một dòng trong bảng. Ghi rõ tên hook được gọi trực tiếp, nó quản lý gì, file API liên quan nếu có và lý do giữ logic trong screen. Sửa hoặc bỏ dòng khi code thay đổi để báo cáo khớp với source.

| Feature | Screen | Hook gọi trực tiếp trong screen | State/logic giữ trong screen | File API liên quan | Lý do giữ trong screen |
| --- | --- | --- | --- | --- | --- |
| Auth | `features/auth/screens/WelcomeScreen.jsx` | `useState`, `useRef`, `useEffect` | Mở/đóng bottom sheet chọn vai trò; đợi sheet đóng rồi chuyển sang màn nhập tài khoản. | Không có | Trạng thái chỉ thuộc màn Welcome, không cần custom hook. |
| Auth | `features/auth/screens/AccountScreen.jsx` | `useState`, `useRef`, `useEffect`, `useNavigation` | Giá trị tài khoản và lỗi nhập rỗng; focus ô tài khoản sau khi chuyển màn kết thúc. | Không có | Trạng thái form và focus chỉ thuộc màn này, không cần custom hook. |
| Auth | `features/auth/screens/PasswordScreen.jsx` | `useState`, `useLogin`, `useLoginOtp`, `usePasswordRecovery` | Giá trị mật khẩu, hiện/ẩn mật khẩu, thông báo và OTP login. Luồng quên mật khẩu nhiều bước nằm trong `usePasswordRecovery`. | `features/auth/api/auth.api.js` qua ba hook. | State nhập liệu và hiển thị chỉ thuộc màn; phiên và recovery nằm trong hook riêng. |
| Home | `features/home/screens/HomeScreen.jsx` | `useAuthStore`, `useRouter` | Đọc người dùng trong phiên để hiển thị tên/avatar và mở setting. | Không có. | Home chỉ dùng trạng thái phiên đã có. |
| Settings | `features/settings/screens/SettingsScreen.jsx` | `useAuthStore`, `useState`, `useRouter` | Đọc hồ sơ trong phiên; giữ trạng thái đăng xuất và chuyển màn. | `features/auth/api/auth.api.js` qua `signOut`. | Trạng thái thao tác và điều hướng chỉ thuộc sheet setting. |
| Settings | `features/settings/screens/AccountSettingsScreen.jsx` | `useAuthStore`, `useTwoFactor`, `useRouter` | Đọc vai trò và trạng thái 2FA để hiển thị; điều hướng về settings. Các bước bật/tắt 2FA và trạng thái request nằm trong `useTwoFactor`. | `features/auth/api/auth.api.js` qua `useTwoFactor`. | Screen chỉ ghép dữ liệu phiên với UI của phần quản lý tài khoản. |

Không ghi screen chỉ hiển thị/điều hướng hoặc chỉ gọi custom hook đã đặt ở `features/<feature>/hooks/`. Không ghi hook nằm bên trong `components/ui/` vào đây.
