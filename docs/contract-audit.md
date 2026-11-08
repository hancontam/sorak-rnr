# Contract audit — bản làm lại

Khởi tạo 05/11/2026. Môi trường đích `https://test2mamnonhontre.sorak.io.vn/api`.

Chỉ ghi nhận các hành vi đã quan sát trong từng mục. Không đánh dấu kiểm chứng chỉ vì main cũ từng chạy. Không lưu credentials/token/OTP hoặc thông tin cá nhân đầy đủ.

## Kết nối HTTP nền — 05/11/2026

| Endpoint/môi trường | Swagger | Quan sát thực tế | Giới hạn |
| --- | --- | --- | --- |
| `GET https://test2mamnonhontre.sorak.io.vn/api/health`, không token | Path `/health` mô tả 200, không khai báo security ở operation hoặc root trong JSON đã đọc | Axios client nhận HTTP 401, JSON `code: UNAUTHORIZED`, `message: Missing access token` | Xác nhận request tới server và lỗi HTTP được giữ nguyên; không coi health hoạt động công khai hoặc auth đã được kiểm chứng. Chưa thử có token vì bước auth chưa triển khai. |

## Auth 2A trên test2 — 08/11/2026

| Endpoint | Quan sát với header `X-Client-Platform: android` | Giới hạn |
| --- | --- | --- |
| `GET /auth/mobile-challenge` | 200 HTML, có script Cloudflare và sự kiện `TURNSTILE_TOKEN` / `TURNSTILE_ERROR` | Cần thử widget và token thật trên thiết bị |
| `POST /auth/login` | Gửi sai kiểu trả 400, nêu `username`, `password`, `captchaToken` | Payload thành công tham chiếu guide và code main. Chưa xác nhận luồng native trên bản làm lại |
| `POST /auth/verify-2fa` | Body rỗng trả 400, yêu cầu `tempToken` và `otp`. Swagger khai báo `totpCode` | Chưa gửi OTP thật trong lượt này |
| `GET /auth/me`, `POST /auth/refresh` | Không có token trả 401 | Restore, refresh rotation và logout với token thật cần kiểm tra sau đăng nhập native |

## Auth 2B trên test2 — 08/11/2026

- Với mã tài khoản không tồn tại và header Android, `POST /auth/forgot-password` nhận `identifier` và trả 404. `POST /auth/verify-otp` nhận `email` và `otp` rồi từ chối mã không hợp lệ. `POST /auth/reset-password` nhận `email`, `resetToken`, `password` rồi từ chối token giả. Đây là kiểm tra contract nhánh lỗi.
- Nhánh thành công trên `main` từng xác nhận mã cán bộ có thể truyền trong trường `email` ở hai bước cuối. Context API cho thấy cooldown gửi lại 60 giây, OTP có hạn 5 phút và tối đa 5 lần thử. Bản làm lại dùng mốc cooldown đó và xử lý phản hồi chờ/hết hạn từ server. Chưa kiểm chứng gửi email và đổi mật khẩu thật từ bản làm lại.

## Shell/Settings trên test2 — 09/11/2026

- Android, phiên giáo viên thật: `GET /auth/sessions` trả 200 với hai phiên. Cookie `sorak_refresh` từ refresh token hiện tại cho đúng một phiên có `isCurrent: true`; giá trị đối chứng sai cho không phiên nào khớp. Cookie chỉ được gắn vào request này trên native, kể cả khi client gửi lại sau refresh.
- Android, phiên phụ huynh thật qua Turnstile: app hiển thị hồ sơ chỉ đọc và form đổi mật khẩu, ẩn mục 2FA dành cho giáo viên. Danh sách phiên hiển thị đúng một phiên **Thiết bị này** và hai phiên khác. Sau **Làm mới**, app vẫn nhận diện phiên hiện tại. Kiểm tra xác nhận đăng xuất tất cả bằng nút **Hủy**. Sau khi tắt và mở lại Expo Go, app khôi phục phiên và giao diện Tối. Cuối lượt kiểm tra, chỉ đăng xuất phiên thử nghiệm vừa tạo.
- Với phiên giáo viên thật, `POST /auth/change-password`, `POST /auth/2fa/confirm-enable` và `POST /auth/2fa/disable` trả 400 với body rỗng. Tên trường và đường dẫn theo Swagger, web và code backend tham chiếu. Chưa thử đổi mật khẩu thành công, gửi OTP, bật/tắt 2FA hoặc thu hồi tất cả phiên. Chưa kiểm chứng danh sách phiên trên iOS.

## Tổng quan lớp trên test2 — 09/11/2026

- Phiên GV native có đúng một lớp. `GET /classes/{id}/students` trả 200 với hai học sinh trong mẫu. `GET /classes/{id}/student-report?studentId=…&semester=SEMESTER_1` trả 200 cho cả hai. Swagger chỉ khai báo path `id`, thiếu hai query trên.
- Mỗi báo cáo mẫu trả ba đợt sức khỏe (`health.history` có ngày, chiều cao, cân nặng và z-score), 23 bản ghi đánh giá hoạt động (`assessments.history` có ngày, tên hoạt động, mục tiêu, kết quả, ghi chú), 11 bản ghi điểm danh và danh sách ủy quyền rỗng. Đây là số liệu mẫu tại thời điểm kiểm tra, không phải quy tắc sản phẩm.
- Endpoint riêng `GET /parent/student-report` có bằng chứng 200 trong audit cũ và chưa có trên Swagger đã đọc. Chưa gọi lại bằng phiên PH trong lượt này.
- Trong bản Android kiểm tra riêng, báo cáo trả đúng học sinh đã chọn qua `id/publicId`; học kỳ 1 có dữ liệu, chuyển `SEMESTER_2` trả các mảng lịch sử rỗng và `selectedSemester` tương ứng. Chưa kiểm chứng đủ UI năm mục/biểu đồ trên cả hai vai trò hoặc iOS; không xem bundle thành công là nghiệm thu native.

## Nguồn và lịch sử

- Swagger https://mamnonhontre.sorak.io.vn/docs.json ; hướng dẫn `C:/Users/HCT/Desktop/Code/SWAGGER_USAGE_GUIDE.md`.
- Web/API context trong `C:/Users/HCT/Desktop/Code/` có thể cũ; auth đọc thêm `MOBILE_AUTH_INTEGRATION_GUIDE.md`.
- Audit cũ giữ nguyên trong Git: `git show 5318a02:docs/contract-audit.md`. Trích từng contract khi làm feature, giữ ngày/môi trường/giới hạn. Audit cũ có phần lỗi thời như API lớp cho PH, ghi học kỳ/tháng GV, test1; không áp dụng vào phạm vi mới.

## Quan sát lập kế hoạch, không phải test nghiệp vụ

| Ngày | Nguồn | Quan sát | Giới hạn |
| --- | --- | --- | --- |
| 05/11/2026 | Public Swagger domain chính | Có `/parent/notifications` và `/parent/notifications/{id}/read`; response schema thiếu chi tiết | Chưa xác nhận live test2/quyền GV |
| 05/11/2026 | `https://test2mamnonhontre.sorak.io.vn/docs.json` | Trả HTML trang web trong lần đọc | Không suy ra API test2 hỏng; dùng Swagger domain chính làm đầu mối |
| 05/11/2026 | Context `src/services/parent.service.js` | Lấy tối đa 30 thông báo, unreadCount đếm trong 30 đó | Chưa biết deploy mới đã sửa chưa; hỏi tổng unread độc lập phân trang |
| 05/11/2026 | Người dùng xác nhận | Học kỳ PH chỉ xem, BE đang sửa dữ liệu | Cần mẫu có dữ liệu thật; không yêu cầu phản hồi học kỳ |

## Cách bổ sung bằng chứng

Ghi method/path, ngày/môi trường, vai trò không credential, query/body khử dữ liệu nhạy cảm, status và schema/ý nghĩa cần dùng. Nêu Swagger khác thực tế chỗ nào, cách tái hiện, giới hạn và phần cần BE xác nhận. Mutation cần đọc lại dữ liệu; HTTP 200 hoặc savedCount=0 không đủ chứng minh đã lưu thay đổi.

Không tạo response sample giả. Không coi lỗi mạng/HTML/500 là rỗng. Null hợp lệ phải xét theo từng trường, không cấm null toàn bộ response.
