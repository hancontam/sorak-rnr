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
## Đánh giá giai đoạn / Kết quả đánh giá — kiểm tra 04/11/2026 (UTC+7)

| Method/path | Swagger sai hoặc thiếu | Staging đã quan sát / cách kiểm tra | Giới hạn |
| --- | --- | --- | --- |
| `GET /assessment/classes/{classId}/semester` | Thiếu query `semester`, `year`; response `data` chỉ ghi `object`, không mô tả `classInfo`, `stats`, `students`. | Giáo viên gọi lớp được phân công trả 200 với `data.classInfo` (có `semesterDates`, `calculatedUntilVN`, `totalSchoolDays`, `isStarted/isOngoing/isCompleted`), `data.stats` (`totalStudents`, `completedCount`, `pendingCount`), `data.students`. Mỗi học sinh có `id`, `code`, `name`, `attendance{presentDays,totalDays,rate}`, `domains`, `domainBreakdown{rate,achieved,total,targetTotal}`, `totalGoals`, `health{status,examLabel,examDate}`, `teacherNotes`, `isEvaluated`. Query `?semester=SEMESTER_2` trả `classInfo.isStarted = false`. | Chỉ kiểm tra lớp được phân công của tài khoản giáo viên thử nghiệm. |
| `GET /assessment/classes/{classId}/monthly` | Thiếu query `month`, `year`; response `data` chỉ ghi `object`. | Gọi không tham số trả 200 với `data.classInfo` (`month`, `year`, `monthLabel`, `isEnded`, `totalWeeks`, `latestEvaluatedMonth`) và `data.students`; mỗi học sinh có `week1Rose`…`week5Rose`, `rosesCount`, `isLotus`, `teacherNotes`, `parentFeedback`, `weeklyStats.week1..5` gồm `attendanceRate`, `goalsRate`, `healthStatus`, `healthExamDate`. Số tuần nằm ở `classInfo.totalWeeks` (tháng 9 là 4, tháng 10 là 5); response **không** có `monthWeeks` như endpoint của phụ huynh. | Chưa kiểm tra tháng hoàn toàn chưa có bản ghi. |
| `POST /assessment/classes/{classId}/semester` | Request trỏ `SaveSemesterAssessmentBatchRequest`; schema khai báo `records[].studentId`, `overallResult` (`DAT_CHUAN`/`CHUA_DAT`), `summaryNote`, **không** giống body staging thực sự đọc. | Body `{ "semester": "SEMESTER_1", "records": [] }` trả 200 với `data.savedCount = 0`. Dịch vụ chỉ upsert `teacher_notes` và `updated_at`, nên records phải ở dạng `{ studentId, teacherNotes }` và `studentId` nhận cả id số lẫn `public_id` UUID. Gửi records có phần tử (cả body Swagger `overallResult`/`summaryNote` và body `teacherNotes`) đều trả **500** — xem mục lỗi chặn bên dưới. | **Không lưu được trên staging**, chưa xác nhận nhánh lưu thành công. |
| `POST /assessment/classes/{classId}/monthly` | Request trỏ `SaveMonthlyAssessmentBatchRequest`; schema khai báo `records[].studentId`, `awardedStar`, `teacherNote`, `criteriaScores` — **không** giống body staging thực sự đọc. | Dịch vụ đọc `records[].studentId`, `week1Rose`…`week5Rose`, `teacherNotes` và tự tính `roses_count`. Mọi body có phần tử trong `records` đều trả **500** — xem mục lỗi chặn bên dưới. | **Không lưu được trên staging.** |
| `GET /parent/good-behavior` | Response `data` chỉ ghi `object`; thiếu query `month`, `year`, `classId`. | Tài khoản phụ huynh gọi trả 200 với `student`, `classInfo`, `period`, `monthWeeks`, `weeklyStats`, `record`, `historyMonths`, `semesterAssessments`. Tài khoản giáo viên gọi cùng endpoint trả **403**. | `semesterAssessments` rỗng trên cả hai tài khoản thử nghiệm. |
| `GET /parent/good-behavior` — `record.id` | Không được mô tả. | Với tháng đã có phiếu đánh giá, `record.id` vẫn trả `null` trong khi `rosesCount` = 4 và `weeks` có dữ liệu, nên không dùng `record.id` để biết tháng đã được đánh giá. Mobile dựa vào `rosesCount`/`weeks`/`teacherNotes`/`parentFeedback`. | Cần backend xác nhận vì sao `public_id` của phiếu tháng bị null. |
| `GET /parent/good-behavior` — `historyMonths` | Không được mô tả. | Trả các tháng nhưng `isEvaluated` = false và `rosesCount` = 0 cho tháng 9 và 10, không khớp với `record` của chính tháng đó (4 hoa). Không dùng `historyMonths` để suy ra tháng đã đánh giá. | Cần backend xác nhận. |
| `POST /parent/good-behavior/feedback` | Request/response chỉ ghi object chung. | Gửi `feedback` rỗng trả 400. Dịch vụ dùng `month`, `year`, `feedback`; trả 404 khi tháng đó chưa có phiếu đánh giá của giáo viên. | Chưa gửi phản hồi hợp lệ để tránh ghi đè dữ liệu staging. |
| Học kỳ của phụ huynh | Swagger không mô tả. | Phụ huynh gọi được `/assessment/classes/{classId}/semester` của lớp con và nhận cả lớp, nên mobile lọc đúng học sinh của mình. `semesterAssessments[].domains` trong `/parent/good-behavior` là 5 mục điểm cố định 90–98 trong `parent.service.js`, không tính từ dữ liệu thật, nên mobile không hiển thị các số đó. | Cần backend xác nhận trước khi hiển thị điểm học kỳ dạng này cho phụ huynh. |

### Lỗi chặn: không lưu được đánh giá tháng và học kỳ — kiểm tra 04/11/2026 (UTC+7)

**Triệu chứng:** mọi `POST` có ít nhất một phần tử trong `records` đều trả **500**; body rỗng (`records: []`) vẫn 200 với `savedCount = 0`.

| Điều kiện thử | Kết quả |
| --- | --- |
| `POST .../semester`, records `[{ studentId, teacherNotes }]` | 500 `INTERNAL_ERROR` |
| `POST .../monthly`, records `[{ studentId, week1Rose…week5Rose, teacherNotes }]` | 500 `INTERNAL_ERROR` |
| `POST .../semester` với body đúng Swagger (`overallResult`, `summaryNote`, `classId`, `year`) | 500, cùng thông báo |
| `POST .../monthly` với body đúng Swagger (`awardedStar`, `teacherNote`) | 500, cùng thông báo |
| Cùng thao tác bằng tài khoản giáo viên thứ hai (UUID khác trong `sub`) | 500, cùng lỗi với UUID của tài khoản đó |
| `records: []` | 200 `savedCount = 0` |

**Response thực tế** (giữ nguyên hình dạng, đã che giá trị):

```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "message": "Cannot convert <UUID trong claim sub của JWT> to a BigInt",
  "traceId": "…",
  "timestamp": "…",
  "path": "/api/assessment/classes/<classId>/semester"
}
```

**Nguyên nhân:** `assessment.controller.js` lấy `evaluatedBy = req.user?.sub || req.user?.accountId || req.user?.id`, mà `sub` của JWT là `public_id` dạng UUID. Hai hàm `saveMonthlyAssessments` và `saveSemesterAssessments` gọi thẳng `BigInt(evaluatedBy || 40)` nên ném lỗi ở bản ghi đầu tiên. `saveAssessmentRecords` không bị vì đã có khối `evalAccountId` đổi UUID → `account_id` trước khi ghi.

**Vì sao không sửa ở mobile:** lỗi xảy ra bên trong service khi ghi `evaluated_by`; client không có tham số nào bỏ qua bước đó, và cả hai dạng body đều dẫn tới cùng lỗi.

**Cần backend:** dùng cách xử lý của `saveAssessmentRecords` (nhận số hoặc `public_id` → `account_id`) cho cả `saveMonthlyAssessments` và `saveSemesterAssessments`.

**Chưa xác nhận:** nhánh lưu thành công trên staging, và body thật sự đúng là `teacherNotes`/`weekNRose` (theo service) hay `overallResult`/`awardedStar` (theo Swagger) — cả hai đều 500 trước khi tới bước đọc field.

**Dữ liệu thử:** mọi lần thử đều 500 nên không tạo hay sửa bản ghi nào trên staging.
