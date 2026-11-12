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

## Thời khóa biểu 5A — 09/11/2026

- Swagger public đã có `GET /parent/schedule` và `GET /attendance/classes/{classId}/timetable`, nhưng response chỉ mô tả `success` và `data: object`; chưa mô tả trường chi tiết hoặc query ngày/tuần. Không dùng schema chung này để kết luận toàn bộ contract đã đúng.
- Đọc bundle web test2 đang deploy `assets/index-BHkvSIxm.js`: PH gọi `/parent/schedule` với `weekId`, `startDate`, `endDate`, thêm `classId` khi có. Bản mobile chọn tuần theo ngày thực, gửi `date/startDate/endDate`; không truyền lớp tùy chọn cho PH. Context `parent.service.js` có nhận các query ngày này.
- Web PH có mục đích, chuẩn bị, tổ chức hoạt động và đánh giá trẻ, nhưng chèn đoạn văn mẫu khi thiếu nội dung; web cũng chặn T7/CN ở PH trong khi GV xét có lịch cuối tuần. Người dùng duyệt mobile chỉ dùng nội dung trả về và cho cả hai vai trò xem hoạt động cuối tuần thật.
- Emulator Android với phiên GV thật: màn lịch tải được dữ liệu ngày 02/11, có nhiều hoạt động cùng ngày; mở đúng hoạt động đã chọn lên stack, hiển thị mục tiêu, mục đích, chuẩn bị và tiến trình. Đây là kiểm chứng qua UI/request của app, chưa phải bản chụp đầy đủ response HTTP hoặc kiểm tra PH/iOS.
- Sau khi người dùng đăng nhập PH trên cùng emulator: `/parent/schedule` qua hook/API của app trả dữ liệu qua kiểm tra đúng học sinh, lớp và các danh sách. UI hiện lớp Mầm 2, các ngày 26/10, 02/11, 03/11 và 09/11 chưa có hoạt động. Ngày 07/11 hiện trạng thái chưa có lịch, không tự gọi là ngày nghỉ. Chưa kiểm chứng mở detail PH có dữ liệu, kết quả có dữ liệu hoặc đầy đủ payload HTTP; không coi nhánh rỗng là đủ nghiệm thu tất cả.
- Bổ sung cùng ngày với tài khoản PH khác do người dùng cấp, đăng nhập native Turnstile: lịch trả đúng lớp Nhà Trẻ 1. Ngày 02/11/2026 có hoạt động, mở stack **Hoạt động của con** hiển thị đúng tên/ngày, mục tiêu, mục đích, chuẩn bị và tiến trình. Cuộn đến kết quả trong ngày thấy mức **Đạt** cùng lời nhận xét. Back giữ ngày 02/11; đổi sang 03/11 và 04/11 không giữ lại slot của 02/11. Màn PH không có thao tác ghi. Đây là kiểm chứng UI native trên dữ liệu thật; chưa thu/đối chiếu toàn bộ payload HTTP và chưa xác nhận khóa nối kết quả với từng slot, nên vẫn giữ nhóm kết quả theo ngày.
- Context API: `timetable.weeklyActivities[]` có `id`, `isoDate`, `routineSlot`, nội dung hoạt động; `slotAssessments[]` có ID của bản đánh giá, ngày, khung và tên hoạt động, nhưng chưa thấy ID liên kết tới lịch/hoạt động. Không coi hai trường `id` là cùng loại. Mobile tạm trình bày kết quả theo ngày, ghi rõ phạm vi, không nối bằng tên hay chỉ khung giờ. Cần xác minh payload PH mới nhất trước khi chốt cần sửa backend; xem BE-03.
- Giờ khung GV là nhãn tham chiếu từ web, không phải hoạt động giả. Số đo/trạng thái/kết quả không được điền mặc định. 5A chưa gửi mutation điểm danh, sức khỏe, đón trẻ hoặc đánh giá HĐGD.

## Ghi nhận trong ngày và ủy quyền (5B–5C)

- Android test2, phiên GV, ngày 02/11/2026. Đã mở Điểm danh và Sức khỏe từ lịch, mở Đón trẻ từ `GET /attendance/classes/{classId}/dismissal?date=…`, mở Đánh giá hoạt động từ một slot thật qua `GET /assessment/classes/{classId}/records` với ngày, slotId và activityId. Đã thử đổi trạng thái trong bản nháp điểm danh và Back hiện xác nhận bỏ thay đổi.
- Form sức khỏe đọc số đo đúng ngày từ `GET /attendance/classes/{classId}/timetable`. Code context của API tổng quan sức khỏe trả số đo gần nhất và có thể điền số mẫu nếu chưa đo, nên không dùng response đó để khởi tạo form theo ngày.
- Android test2 đã tải màn danh sách đơn bằng `GET /attendance/classes/{classId}/authorizations` và `GET /parent/requests`. Hai mẫu kiểm tra đều rỗng. PH mở form tạo đơn cho đúng học sinh của phiên. Chưa xác minh dữ liệu có đơn chờ duyệt và số badge khác 0 trong lượt này.
- Các payload ghi dựa trên audit main, Swagger và API context. Đón trẻ gửi `checkOutTime` theo timestamp có múi giờ, cùng người đón và ghi chú. PH gửi trường snake_case cho `POST /parent/requests/pickup`, hủy bằng `POST /parent/requests/pickup/{id}/cancel`. GV dùng PATCH approve/reject và `{ reason }` khi từ chối. App đọc lại bản ghi/trạng thái sau khi server nhận. Chưa gửi các thao tác ghi từ bản dựng lại trên staging trong lượt này.

## Rà lại bước 5 theo nghiệp vụ chốt — 09/11/2026

Các kết luận dưới đây thay các mô tả tạm ở 5A/5B–5C bên trên khi có khác biệt. Không thêm test file hoặc mã đăng nhập thử vào app.

- Gọi HTTP trực tiếp test2 bằng phiên GV/PH do người dùng cung cấp. Login thường trả 200 với `username/password/role` và header Android, không gửi bypass. Đây không phải bằng chứng kiểm chứng Turnstile native; luồng app vẫn dùng WebView.
- GV: timetable phải truyền `date/startDate/endDate` để lấy phạm vi tuần. `/dismissal?date=…` trả lớp/ngày, student UUID, `isAttendanceRecorded`, `attendanceStatus`, `isPresent`, `isDismissed`, người thân và ủy quyền theo ngày. Mobile dùng cờ đã ghi này, không suy từ giờ vào lớp. Ngày 02/11 có cả PRESENT và EXCUSED_ABSENCE; ngày 09/11 mẫu có 4 học sinh chưa điểm danh. Số lượng là mẫu kiểm tra, không hardcode.
- PH: `/parent/schedule` ngày 02/11 có đúng học sinh phiên, hoạt động và kết quả cùng `routineSlot: ARRIVAL_PLAY` và ngày. Khóa nối đã được BE/người dùng xác nhận là routineSlot + ngày, mỗi khung/ngày một HĐGD. Không còn dùng kết quả cả ngày ở detail. `/parent/requests` trả 200 với `student/requests/stats/siblings`; mobile hiện chỉ dùng học sinh của phiên.
- Sức khỏe: đã gửi riêng dòng học sinh vắng bằng null rồi bằng body chỉ studentId. Cả hai trả 200/savedCount=1 và ghi 85 cm/12 kg. Sau mỗi lần thử đã khôi phục số đo trước thử và đọc lại khớp; metadata lần cập nhật có thể thay đổi. Xem BE-04. Mobile tạm gửi mọi bé có mặt đã điền đủ, không gửi dòng vắng và không bịa số đo.
- GV tạo ủy quyền: `POST /attendance/classes/{id}/authorizations` nhận camelCase `studentId/pickupPersonName/pickupPersonPhone/pickupCitizenId/relationship/startDate/endDate/note/photoUrl/status`, với `status: APPROVED`. Đã tạo một đơn kiểm tra ngày 09/11, GET danh sách xác nhận APPROVED, GET dismissal cùng ngày có người được ủy quyền. Không gửi POST dismissal hoặc xác nhận bé đã đón. Đơn kiểm tra còn trên staging, không tự xóa.
- Response tạo đơn GV có cả `id` nội bộ và `publicId`; GET danh sách dùng publicId làm `id`. Riêng `authorization.student.id` trong GET danh sách là ID nội bộ, khác UUID học sinh của dismissal. Mobile đối chiếu đơn bằng publicId, trạng thái và UUID hoặc mã học sinh từ roster thật; không so nhầm hai loại ID.
- Ghi nhận đón và tạo ủy quyền là hai thao tác riêng: UI có trạng thái Chưa điểm danh/Vắng/Chưa đón/Đã đón; nút xác nhận từng bé chỉ được phép khi Có mặt, chọn người hợp lệ và giờ hợp lệ. Tạo đơn không tăng số đã đón. Không triển khai Người đón khác.
- Đã quan sát native Android màn điểm danh ngày 09/11: roster 4 bé, Có mặt mặc định trong draft; chưa bấm Lưu. Chưa nghiệm thu trọn các mutation điểm danh/HĐGD/đón trẻ từ mobile, PH tạo/hủy, GV duyệt/từ chối và upload ảnh từ camera. Không coi việc endpoint đọc trả 200 là hoàn thành các ca này.
- Android, màn Đón trẻ sau khi sửa: ngày 09/11 hiện 0/4 đã đón và 4 bé chưa điểm danh, khóa nút xác nhận. Mở tạo đơn từ một bé điền đúng học sinh và ngày. Nhập nháp rồi Back hiện xác nhận bỏ thay đổi. Ngày 02/11 hiện 4/5 đã đón, 1 vắng. Mở danh sách người đón và đối chiếu người/giờ đã ghi trên một bản ghi thật. Không bấm lưu đón trẻ trong lượt kiểm tra này.

### Hủy ghi nhận đón trẻ

- Swagger công khai khai báo DELETE với hai tham số path `classId` và `studentId` nhưng thiếu query `date`. Bundle web đang deploy trên test2 dùng cùng đường dẫn và truyền query qua `params`. Gọi DELETE test2 không có phiên với ID giả trả `401 UNAUTHORIZED`; phép thử này chỉ xác nhận nhánh thiếu phiên.

- Network web test2 do người dùng cung cấp ghi nhận HTTP 200 cho `DELETE /attendance/classes/{classId}/dismissal/{studentId}?date=YYYY-MM-DD`. Web gửi ID học sinh từ danh sách đón trẻ. Backend tham chiếu xóa các trường giờ đón, người đón, ảnh và dặn dò trong bản ghi của đúng học sinh/ngày, giữ điểm danh và đơn ủy quyền.
- Mobile đọc lại danh sách sau DELETE, kiểm tra đã bỏ trạng thái và thông tin đón của đúng học sinh, rồi làm mới lịch và báo cáo. Trên Android test2 ngày 02/11, đã quan sát hộp xác nhận đúng học sinh/ngày và kết quả sau xác nhận trên thiết bị: bé về Chưa đón, người/giờ đón được xóa, tổng đã đón giảm từ 3/5 xuống 2/5. Bằng chứng HTTP 200 trong ảnh Network là từ web.

## Kết quả học tập và thông báo 6A trên test2 — 11/11/2026

- GET tháng và học kỳ của GV trả 200, khớp UUID lớp, có `students` và `stats`. Kỳ 2 trả `isStarted: false`. GET `/parent/good-behavior` khớp con của phiên và trả đúng `period.month/year` khi truyền query. Mẫu PH tháng 9–11 chưa có `record.id`; không thể thử lưu phản hồi thật trên mẫu này.
- Mẫu PH trả học kỳ 1 có 5 lĩnh vực với `isPublished: false` và `isDraft: true`. Bản 6A lọc bản nháp trước khi đưa kết quả vào cache. Backend vẫn gửi bản nháp trong response; ẩn ở mobile không thay quyền đọc của API. Chưa có mẫu học kỳ đã công bố.
- Cả GV lẫn PH gọi GET `/parent/notifications` trả 200, có `unreadCount` và `notifications`. Mẫu GV có 3 mục chưa đọc, PH rỗng. GET `/notifications` trả 404. PATCH `/parent/notifications/{id}/read` và ID `all` theo web/backend tham chiếu. Chưa gửi PATCH thay đổi dữ liệu staging trong lượt này. Context backend đếm trong 30 thông báo mới nhất; chưa có mẫu test2 đủ lớn để xác minh giới hạn thực tế.
- Guide Expo push được dùng để xác định phạm vi 6B. Ba đường dẫn token/test-push trả 401 khi thiếu phiên. Chưa đăng ký thiết bị hay gửi push thử.
- Bundle JavaScript Android qua. Emulator nối Metro của `wt-rebuild` hiển thị Sổ bé ngoan của PH, các tháng và tuần theo API, cùng trạng thái chưa có phiếu. Chưa kiểm tra ghi phản hồi hoặc đánh dấu đọc từ app.
- Đối chiếu bộ chọn tháng của web test2 và trường năm học trong API: GV/PH đều trả năm học 2026–2027. Bộ chọn mobile liệt kê tháng 9–5 theo năm học và chỉ mở tháng đã kết thúc. API GV trả khoảng ngày HK1 05/09/2026–15/01/2027, tính đến 11/11/2026 (48 ngày), và HK2 16/01/2027–31/05/2027 chưa bắt đầu. App hiển thị các giá trị từ response.

## Nhật ký hoạt động và Expo Push trên test2 — 11/11/2026

- `GET /parent/home` trả 200 với tài khoản PH. `data.student.id` khớp bé của phiên. Mảng `data.timeline` có 7 khung với `id/slot/time/title/description/status/objective/badge/isDone/notes`. Không thấy trường `data.routineSlots`. Context backend dùng tên biến `routineSlots` và trả ra dưới khóa `timeline`.
- Mẫu test2 lúc kiểm tra đều `upcoming`, chưa có mục tiêu hoặc kết quả đã ghi. Chưa kiểm chứng ca có nhận xét thật. Context web có timeline mẫu dự phòng. Mobile dùng timeline từ API và hiển thị rỗng khi API trả mảng rỗng.
- Guide push nêu `POST /notifications/device-token` nhận `deviceToken/platform/deviceName`, `DELETE` cùng đường dẫn nhận body `{deviceToken}`. Cả hai trả 401 khi thiếu phiên. Chưa nghiệm thu request có Expo Push Token thật, thao tác gỡ hoặc gửi/nhận trên thiết bị.
- Expo `@hancontam/sorak-rnr` đã liên kết với project ID `35b5c14a-dcd4-400f-8662-e3c5d55b112f`. Firebase `sorak-mobile-test2` có Android app `com.sorak.rnr`. Đã bật FCM API, gắn service account có quyền FCM v1 cho đúng package trên Expo và xác nhận lại credential binding. APK nội bộ đã build/cài và mở trên Android emulator. Các bước cấu hình này chưa xác nhận gửi nhận push thực tế.
- APK kiểm tra có đúng `google_app_id`, sender ID `345751878934` và project `sorak-mobile-test2` trong tài nguyên Android. Lượt thử emulator gặp `FirebaseMessaging SERVICE_NOT_AVAILABLE` và Turnstile hết thời gian chờ trước khi đăng nhập. Chưa xác nhận POST đăng ký thiết bị, nhận push hoặc điều hướng sau chạm; người dùng chọn kiểm tra trên điện thoại thật sau.

### Multi-account PH — nghiệp vụ chốt ngày 11/11/2026

- Mỗi mã HS là account độc lập. Mobile lưu nhiều phiên trên thiết bị, không gọi API tạo quan hệ anh/chị/em. Đổi account dùng token của account đó; dữ liệu PH vẫn lấy từ endpoint theo phiên, không thay studentId của account đang đăng nhập.
- Đăng ký cùng Expo Push Token cho từng account dùng lại POST `/notifications/device-token` theo guide; gỡ riêng account bằng DELETE cùng endpoint và bearer của account đó. Payload push nối account qua studentId/studentCode, không qua tên. Chưa nghiệm thu đăng ký nhiều account, gỡ riêng hoặc push chuyển bé trên thiết bị thật; không coi kiểm tra logic mô phỏng là bằng chứng backend đã xử lý thành công các ca này.

## Cài đặt thông báo và thiết bị push trên test2 — 12/11/2026

- Gọi HTTP trực tiếp test2 bằng tài khoản GV và PH người dùng cung cấp (header `X-Client-Platform: android`, không dùng bypass). Với token Expo giả `ExponentPushToken[sorak-redesign-contract-0001]`: `POST /notifications/device-token` trả 200 cả lần đầu và lần lặp; `DELETE` cùng đường dẫn với body `{deviceToken}` trả 200 cả khi token đã bị gỡ; thiếu `deviceToken` trả 400 `VALIDATION_ERROR`. Đã gỡ token giả và đăng xuất phiên test sau khi kiểm tra.
- Không có API đọc danh sách thiết bị đã đăng ký, nên chưa đọc lại được tác động của POST/DELETE; chưa gửi/nhận push thật trên thiết bị. Không gọi `test-push`.
- Mã nguồn `sorak-api` chỉ gửi email OTP (`sendOtpEmail`); không có email theo loại thông báo, không có bảng/API tùy chọn thông báo. Màn "Cài đặt thông báo" của web lưu công tắc email/push/âm thanh vào `localStorage`, không gọi API, nên các công tắc email trên web hiện không điều khiển email nào. Mobile chỉ làm công tắc push theo thiết bị (đăng ký/gỡ token thật) và âm thanh khi app đang mở (cài đặt cục bộ).

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
