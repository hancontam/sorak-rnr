# Ghi chú điểm lệch Swagger ↔ staging

Chỉ ghi contract Swagger sai hoặc thiếu so với hành vi đã kiểm tra trên staging. Dùng chung cho mọi feature. Khi backend sửa Swagger, kiểm tra lại endpoint và cập nhật ghi chú; không coi kết quả cũ là vĩnh viễn. Không ghi tài khoản, mật khẩu, OTP hoặc token thật.

Nguồn tham khảo: [OpenAPI JSON](https://mamnonhontre.sorak.io.vn/docs.json), code web và API trong `C:/Users/HCT/Desktop/Code/`. Server kiểm tra: `https://testmamnonhontre.sorak.io.vn/api` (JSON, `X-Client-Platform: android` cho auth mobile). Swagger trên domain production có chọn server staging, nhưng `https://testmamnonhontre.sorak.io.vn/docs.json` hiện trả HTML, không phải OpenAPI JSON.

## Auth — kiểm tra 03/11/2026 (UTC+7)

| Method/path | Swagger sai hoặc thiếu | Staging đã quan sát / cách kiểm tra | Giới hạn |
| --- | --- | --- | --- |
| `POST /auth/login` | `LoginRequest.required` chỉ có `password`; thiếu điều kiện bắt buộc có tên đăng nhập. Response chỉ khai báo 200/400, thiếu 401. | Body rỗng trả 400 vì thiếu mật khẩu **và** tên đăng nhập. Tài khoản giả + mật khẩu giả + `role` + `captchaToken` trả 401. Body hợp lệ theo Swagger mới đã trả 200 với đủ `user`, `accessToken`, `refreshToken`, `accessExpiresAt`, `sessionId`. | Đã kiểm tra nhánh thành công bằng tài khoản thử nghiệm; không lưu thông tin đăng nhập trong tài liệu. |
| `POST /auth/verify-2fa` | Request ghi `tempToken`, `totpCode`. | Gửi `{ "tempToken": "invalid", "totpCode": "000000" }` bị báo thiếu **`otp`**. Đổi thành `otp` thì qua validation và bị báo phiên giả/hết hạn. Code web context cũng gửi `otp`. | Chưa có phiên 2FA thật để kiểm tra response thành công. |
| `POST /auth/forgot-password` | Request chỉ ghi `email` bắt buộc; response `data` là object chung. | Body chỉ có `identifier` giả cũng trả 200, như body chỉ có `email` giả. `data` có `hasEmail`, `contactTeacher`, `message`. Body rỗng báo cần mã học sinh, tên đăng nhập hoặc email. | Chưa kiểm tra email/OTP thật được gửi. |
| `POST /auth/reset-password` | Request ghi `resetToken`, `newPassword`. | Hai field đó bị báo thiếu **`email`** và **`password`**. `{ "email": "nobody@example.invalid", "resetToken": "invalid", "password": "Example@2026" }` qua validation và bị báo phiên giả/hết hạn. Code web context cũng gửi `email`, `resetToken`, `password`. | Chưa dùng reset token thật và chưa đổi mật khẩu. |
| `POST /auth/refresh` | Response `data` chỉ là object chung; thiếu status 401. | Gửi refresh token từ login trả 200 với `accessToken`, `refreshToken`, `accessExpiresAt`, `sessionId`; refresh token mới khác token cũ. Không gửi token trả 401. | Đã kiểm tra vòng login → refresh → logout bằng phiên thử nghiệm. |
| `POST /auth/logout` | Request/response chỉ là object chung. | Gửi refresh token mới và Bearer access token trả 200, `data.message`. | Swagger chưa mô tả field cụ thể. |
| Các endpoint Auth có lỗi | `ErrorResponse` ghi `{ success, error: { code, message, details } }`. | Lỗi 400/401 thực tế có `{ success: false, code, message, details?, traceId, timestamp, path }`; `code` và `message` ở cấp đầu. | Đã quan sát trên các request validation và auth lỗi, chưa khẳng định mọi lỗi của mọi feature đều giống vậy. |
| `GET /health` | Chỉ mô tả 200. | Không gửi Bearer token trả 401 `UNAUTHORIZED` (`Missing access token`). | Chưa kiểm tra health với token hợp lệ. |
