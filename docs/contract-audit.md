# Ghi chú điểm lệch Swagger ↔ staging

Chỉ ghi contract Swagger sai hoặc thiếu so với hành vi đã kiểm tra trên staging. Dùng chung cho mọi feature. Khi backend sửa Swagger, kiểm tra lại endpoint và cập nhật ghi chú; không coi kết quả cũ là vĩnh viễn. Không ghi tài khoản, mật khẩu, OTP hoặc token thật.

Nguồn tham khảo: [OpenAPI JSON](https://mamnonhontre.sorak.io.vn/docs.json), code web và API trong `C:/Users/HCT/Desktop/Code/`. Server kiểm tra: `https://testmamnonhontre.sorak.io.vn/api` (JSON, `X-Client-Platform: android` cho auth mobile). Swagger trên domain production có chọn server staging, nhưng `https://testmamnonhontre.sorak.io.vn/docs.json` hiện trả HTML, không phải OpenAPI JSON.

## Auth — kiểm tra 03/11/2026 (UTC+7)

| Method/path | Swagger sai hoặc thiếu | Staging đã quan sát / cách kiểm tra | Giới hạn |
| --- | --- | --- | --- |
| `POST /auth/login` | `LoginRequest.required` chỉ có `password`; thiếu điều kiện bắt buộc có tên đăng nhập. Response chỉ khai báo 200/400, thiếu 401. | Body rỗng trả 400 vì thiếu mật khẩu **và** tên đăng nhập. Tài khoản giả + mật khẩu giả + `role` + `captchaToken` trả 401. Body hợp lệ theo Swagger mới đã trả 200 với đủ `user`, `accessToken`, `refreshToken`, `accessExpiresAt`, `sessionId`. | Đã kiểm tra nhánh thành công bằng tài khoản thử nghiệm; không lưu thông tin đăng nhập trong tài liệu. |
| `GET /auth/me` | `UserProfileResponse` mô tả `data` là hồ sơ người dùng trực tiếp. | Gọi bằng access token sau login trả 200; `data` chỉ có key `user`, hồ sơ nằm ở `data.user`. | Đã kiểm tra trên tài khoản giáo viên thử nghiệm. |
| `POST /auth/verify-2fa` | Request ghi `tempToken`, `totpCode`. | Staging yêu cầu `{ "tempToken": "...", "otp": "..." }`. Đã bật 2FA trên tài khoản thử nghiệm, login nhận `requires2FA`, `tempToken`, `emailMasked`; dùng OTP mới xác minh trả 200 cùng phiên đăng nhập. Code web context cũng gửi `otp`. | Đã kiểm tra nhánh thành công; không ghi mã hay token thật. |
| `POST /auth/2fa/request-enable`, `/auth/2fa/confirm-enable`, `/auth/2fa/disable` | Request/response chỉ ghi object chung, thiếu field cụ thể. | Staging nhận request bật không body, xác nhận bật với `{ "otp": "..." }`, tắt với `{ "password": "..." }`; cả ba trả 200 trên tài khoản thử nghiệm. Login sau khi tắt trả access token trực tiếp, không yêu cầu OTP. | Chỉ kiểm tra trên tài khoản giáo viên thử nghiệm. |
| `POST /auth/forgot-password` | Request chỉ ghi `email` bắt buộc; response `data` là object chung. | Body `{ "identifier": "<mã cán bộ test>" }` trả 200, `data.hasEmail = true`, có email nhận mã được che; OTP đã đến hộp thư test. Mã tài khoản không tồn tại trả 404 `NOT_FOUND` sau validation. Body rỗng báo cần mã học sinh, tên đăng nhập hoặc email. | Đã kiểm tra nhánh giáo viên có email liên kết. |
| `POST /auth/verify-otp` | Field `email` ghi format email, không mô tả mã tài khoản; response `data` là object chung. | Gửi field `email` bằng mã cán bộ và OTP thật trả 200; `data` có `resetToken`, `email`, `message`. Mã cán bộ giả + OTP giả đi qua validation field rồi bị từ chối vì OTP không hợp lệ. | Đã kiểm tra nhánh thành công một lần, không ghi OTP/token thật. |
| `POST /auth/reset-password` | Request ghi `resetToken`, `newPassword`; response `data` là object chung. | Staging yêu cầu **`email`** (có thể là mã cán bộ), **`resetToken`**, **`password`**. Dùng reset token thật trả 200; login lại bằng mật khẩu test hiện tại trả 200. Code web context cũng gửi bộ field đó. | Đã kiểm tra trên tài khoản test và giữ nguyên giá trị mật khẩu test. |
| `POST /auth/refresh` | Response `data` chỉ là object chung; thiếu status 401. | Gửi refresh token từ login trả 200 với `accessToken`, `refreshToken`, `accessExpiresAt`, `sessionId`; refresh token mới khác token cũ. Không gửi token trả 401. | Đã kiểm tra vòng login → refresh → logout bằng phiên thử nghiệm. |
| `POST /auth/logout` | Request/response chỉ là object chung. | Gửi refresh token mới và Bearer access token trả 200, `data.message`. | Swagger chưa mô tả field cụ thể. |
| Các endpoint Auth có lỗi | `ErrorResponse` ghi `{ success, error: { code, message, details } }`. | Lỗi 400/401 thực tế có `{ success: false, code, message, details?, traceId, timestamp, path }`; `code` và `message` ở cấp đầu. | Đã quan sát trên các request validation và auth lỗi, chưa khẳng định mọi lỗi của mọi feature đều giống vậy. |
| `GET /health` | Chỉ mô tả 200. | Không gửi Bearer token trả 401 `UNAUTHORIZED` (`Missing access token`). | Chưa kiểm tra health với token hợp lệ. |

## Báo cáo học sinh — kiểm tra 04/11/2026 (UTC+7)

| Method/path | Swagger sai hoặc thiếu | Staging đã quan sát / cách kiểm tra | Giới hạn |
| --- | --- | --- | --- |
| `GET /classes/{id}/students` | Khai báo `page` và `limit` (mặc định 20) nhưng không mô tả rằng staging trả toàn bộ danh sách, bỏ qua giới hạn trang. Response `data` chỉ ghi `object`, thiếu `class` và `students`. | Giáo viên test gọi lớp được phân công trả 200 với `data.class` và 25 mục trong `data.students`. Gọi thêm `?page=1&limit=1` vẫn trả 25 mục; `?search=<chuỗi không khớp>` trả 0 mục. Mobile lọc danh sách đã tải tại chỗ theo tên/mã. | Chỉ kiểm tra lớp của tài khoản giáo viên test. |
| `GET /students/{id}` | Response `data` chỉ ghi `object`, thiếu cấu trúc hồ sơ học sinh. | Giáo viên và phụ huynh test đều nhận 200; `data` là hồ sơ trực tiếp, gồm `id`, `studentCode`, `fullName`, `dateOfBirth`, `gender`, `currentClass`, `parents` và các trường sức khỏe nền. | Đã kiểm tra học sinh thuộc lớp/quyền của hai tài khoản test. |
| `GET /classes/{id}/student-report` | Thiếu query `studentId` và cấu trúc `data` (chỉ ghi `object`). | Gọi `?studentId=<id học sinh>` bằng giáo viên và phụ huynh test trả 200; `data` gồm `student`, `health`, `attendance`, `assessments`, `authorizations`, `classInfo`, `semesterInfo`. `health.history` có ngày đo, chiều cao, cân nặng, z-score để dựng biểu đồ. | Chưa kiểm tra các trường hợp lỗi hoặc học sinh ngoài lớp. |

## Thông báo — kiểm tra 04/11/2026 (UTC+7)

| Method/path | Swagger sai hoặc thiếu | Staging đã quan sát / cách kiểm tra | Giới hạn |
| --- | --- | --- | --- |
| `GET /parent/notifications` | Swagger chỉ mô tả route dưới nhóm Parent, thiếu mô tả cấu trúc `data.unreadCount` và `data.notifications`. Thiếu tài liệu cho vai trò Giáo viên. | Staging cho phép cả Phụ huynh và Giáo viên test gọi và nhận 200; `data` có `{ unreadCount, notifications }` lọc theo `account_id` của tài khoản đăng nhập. | Tài khoản test hiện có `unreadCount: 0` và danh sách rỗng. |
| `PATCH /parent/notifications/{id}/read` | Response `data` chỉ ghi `object`. | Staging nhận publicId của thông báo và cập nhật `is_read = true`, trả 200. | Chưa có endpoint riêng `/teachers/notifications` hay `/teacher/notifications` (trả 404), mobile dùng endpoint `/parent/notifications` chung. |
