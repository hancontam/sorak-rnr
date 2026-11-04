# Nhật ký rà soát và merge Worktree vào Main

Tài liệu tổng hợp ghi nhận xét, đánh giá từ các lần demo và rà soát khi merge các nhánh tính năng từ Git Worktree vào nhánh `main`. Không tách thành nhiều file review nhỏ lẻ để duy trì sự nhất quán và tiện tra cứu lịch sử.

---

## 1. Nhánh `feat/assessment-tabs` (Đánh giá giai đoạn / Kết quả đánh giá)

- **Ngày rà soát:** 04/11/2026
- **Branch:** `feat/assessment-tabs`
- **Commit được rà soát:** `10f343c` (và merge tại `05a6cff`)

### Trạng thái
- Đã dựng menu và bốn màn stack cho giáo viên/phụ huynh, nối luồng đọc dữ liệu staging theo báo cáo triển khai.
- Người dùng đã xem bản demo và chấp nhận tạm để merge, tiếp tục hoàn thiện chức năng rồi mới chỉnh UI chi tiết. Đây chưa phải xác nhận UI khớp Figma.
- Nhánh lưu lời bình giáo viên và phản hồi phụ huynh với nội dung hợp lệ chưa được kiểm chứng trên staging. Người dùng báo thao tác lưu đánh giá học kỳ hiện bị lỗi; cần lấy lỗi thực tế để xác định nguyên nhân.

### Nhận xét UI và nghiệp vụ từ lần xem demo
- Avatar học sinh chưa lấy/hiển thị được ảnh thật.
- Cấu trúc code theo quy ước dự án, nhưng các component tự viết chưa giống Figma; cần kiểm tra lại component RNR có sẵn trước khi tự dựng hoặc chỉnh UI.
- Sổ bé ngoan giáo viên còn thiếu menu dropdown ở header với hai action **Cấu hình tặng hoa** và **Tặng hoa nhanh**. Cần hoàn thành cấu hình gợi ý trước khi nối thao tác tặng hoa nhanh.
- Phần tổng kết tháng cần đối chiếu quy tắc hoa sen với backend: tháng 5 tuần cần ít nhất 4 hoa, tháng 4 tuần cần đủ 4 hoa. Lời bình/ý kiến phản hồi cần được phân biệt theo vai trò và hiển thị dạng bottom sheet đúng frame Figma; hiện flow và UI chưa được phân tích/chốt đầy đủ.
- Lưu đánh giá học kỳ hiện lỗi khi người dùng thao tác. Chưa có mã lỗi/response được ghi nhận; không đoán nguyên nhân từ giao diện.

### Quyết định tạm thời cho demo và việc cần backend hỗ trợ
**Đã được người dùng chấp thuận cho demo mobile trên staging và merge bản hiện tại:** giữ cách gọi hiện tại để trình diễn màn đánh giá học kỳ của phụ huynh, vì backend chưa hỗ trợ endpoint phụ huynh trả 5 lĩnh vực thật. Đây là giải pháp tạm cho demo, không phải contract đích. Sau khi backend xem demo mobile, yêu cầu backend làm endpoint riêng cho kết quả học kỳ của phụ huynh; mobile sẽ chuyển sang endpoint đó trước khi dùng với dữ liệu thật.

**Rủi ro còn nguyên — mức cao:**
`ParentSemesterScreen` gọi `GET /assessment/classes/{classId}/semester` rồi lọc `students` theo `user.student.id` trên thiết bị. Theo lần kiểm tra staging của nhánh này, token phụ huynh nhận HTTP 200 cùng dữ liệu cả lớp. Màn hình chỉ hiển thị con mình, nhưng response đã mang dữ liệu của học sinh khác xuống thiết bị. Cần backend xác nhận và giới hạn quyền truy cập ở server; lọc trên mobile không thay thế kiểm tra quyền.

Swagger hiện có `GET /parent/good-behavior`, nhưng không có endpoint phụ huynh riêng cho 5 lĩnh vực học kỳ. Web hiện lấy `semesterAssessments` từ `/parent/good-behavior`; code backend context trả `semesterAssessments[].domains` bằng các số cố định 90–98, nên không dùng các số đó làm kết quả thật.

**Yêu cầu đề xuất cho backend sau demo:** endpoint dành cho phụ huynh phải xác định con từ phiên đăng nhập, trả 5 lĩnh vực được tính từ dữ liệu thật cùng nhận xét học kỳ của đúng con, và không trả danh sách/lời bình của học sinh khác trong lớp. Endpoint theo lớp chỉ dành cho vai trò được cấp quyền. Khi backend hoàn thành, kiểm tra contract và quyền trên staging rồi thay lời gọi tạm ở `ParentSemesterScreen`.

### Các điểm cần kiểm tra/sửa trước khi chốt flow
| Mức | Vị trí | Kết quả rà soát | Bước tiếp theo |
| --- | --- | --- | --- |
| Trung bình | `ParentContactBookScreen.jsx` | `hasMonthRecord` coi `teacherNotes` khác rỗng là đã có phiếu, trong khi backend context điền câu “Chưa có nhận xét cho tháng này.” cả khi chưa có phiếu. Có thể hiện nút phản hồi và gửi ra 404. | Kiểm tra tháng trống trên staging và nhận diện phiếu từ dữ liệu thật, không dựa vào câu mặc định. |
| Trung bình | `TeacherSemesterScreen.jsx` | Bộ lọc bỏ `teacherNotes === ''` trước khi gửi, nên xóa trắng lời bình cũ không thể lưu. Mỗi lần lưu còn gửi lại toàn bộ lời bình khác rỗng, kể cả lời bình không sửa, có thể ghi đè thay đổi đồng thời. Backend context cho phép upsert chuỗi rỗng, nhưng nhánh ghi thật chưa được thử trên staging. | Chỉ gửi học sinh có lời bình thay đổi, kể cả khi nội dung mới rỗng; kiểm chứng bằng dữ liệu test được phép sửa. |
| Thấp | `TeacherGoodChildScreen.jsx` | Tổng kết luôn hiện `/5` hoa; `classInfo.totalWeeks` có thể bằng 4. | Dùng số tuần của tháng đang xem. |
| Chờ quyết định | `ParentSemesterScreen.jsx` | Figma có vùng nhận xét của phụ huynh và nút lưu, code hiện chỉ xem. Chưa xác định endpoint lưu nhận xét học kỳ cho phụ huynh. | Chốt nghiệp vụ và contract với backend trước khi nối nút lưu. |

---

## 2. Nhánh `feat/notifications-leave-journal` (Thông báo, Đơn từ & Nhật ký ngày)

- **Ngày rà soát & merge:** 04/11/2026
- **Branch:** `feat/notifications-leave-journal` (Worktree `wt-features`)
- **Commit được rà soát:** `6556861`

### Phạm vi tính năng trong đợt merge
1. **Thông báo (`features/notification`):**
   - Màn hình `NotificationListScreen.jsx`, route `/notifications`.
   - Lọc danh sách Chưa đọc / Đã đọc, hỗ trợ đánh dấu đã đọc từng thông báo hoặc toàn bộ.
   - Nối badge số lượng thông báo chưa đọc vào thanh điều hướng `HomeBottomNav`.
2. **Yêu cầu & Đơn từ đón hộ / Xin nghỉ (`features/request`):**
   - Phụ huynh (`ParentRequestScreen.jsx`, route `/request/new`): Tạo đơn đón hộ/ủy quyền đón trẻ, nhập thông tin người đón, ngày hiệu lực, dặn dò; theo dõi trạng thái đơn và thao tác hủy đơn.
   - Giáo viên (`TeacherApprovalScreen.jsx`, route `/request/approval`): Danh sách đơn ủy thác đón trẻ theo lớp, lọc theo trạng thái (Tất cả, Chưa duyệt, Đã duyệt), thao tác duyệt hoặc hủy đơn kèm lý do.
   - Nối badge số đơn chờ duyệt vào `HomeBottomNav`.
3. **Nhật ký ngày (`features/daily`):**
   - Tab Home "Nhật ký ngày" (`DailyTimetableScreen.jsx`): Điều hướng theo ngày trong tuần (T2–CN), hiển thị thời khóa biểu sinh hoạt theo vai trò giáo viên / phụ huynh.
   - Ba màn hình ghi nhận nghiệp vụ độc lập:
     + `AttendanceRecordScreen.jsx` (route `/daily/attendance`): Điểm danh học sinh (Có mặt, Có phép, Không phép), ghi chú và lưu về staging.
     + `PickupRecordScreen.jsx` (route `/daily/pickup`): Ghi nhận người đón trẻ, thời gian đón, dặn dò phụ huynh.
     + `HealthRecordScreen.jsx` (route `/daily/health`): Đo thể chất chiều cao, cân nặng, tính BMI real-time, ghi chú y tế.
4. **CI/CD Build Tester Pipeline (`.github/workflows/tester-build.yml`):**
   - Cấu hình pipeline tự động build tester package cho Android APK và iOS IPA (unsigned cho Sideloadly) khi push vào nhánh `release/tester`.

### Nhận xét của người dùng (Feedback từ User)
- **Chấp nhận merge vào `main`:**
  - Nhận xét: Agent đã chủ động triển khai cả các chức năng chưa được giao trực tiếp nhưng nhìn chung đã hiểu đúng cấu trúc layout theo Figma của dự án.
  - Đồng ý merge nhánh tính năng vào `main` để tiếp tục luồng phát triển và kiểm thử tổng thể.
  - Thống nhất UI hiện tại sẽ được sửa và tinh chỉnh lại sau.
- **Đánh giá về flow Nhật ký ngày (Daily):**
  - Phần flow nhật ký ngày có vẻ chưa đúng dữ liệu, hiện đang lấy cứng (hardcoded mock data) hoặc chưa thật sự lấy đúng dữ liệu từ backend.
  - Một số component mới chỉ là UI cứng, chưa hiểu đúng ý đồ và hành vi mong muốn của người dùng.
  - Kế hoạch: Sau khi merge sẽ cùng thảo luận chi tiết để làm lại và hoàn thiện flow cũng như các component này.

### Kế hoạch hành động tiếp theo
1. Trao đổi và thảo luận chi tiết với người dùng để làm rõ ý đồ thiết kế, luồng dữ liệu và tương tác của các component trong flow Nhật ký ngày.
2. Kiểm tra lại toàn bộ dữ liệu backend thật trên staging cho các màn hình timetable, điểm danh, đón trẻ và thể chất; loại bỏ triệt để các dữ liệu mock/cứng.
3. Rà soát và chỉnh sửa lại giao diện người dùng (UI) theo đúng thiết kế Figma, tận dụng tối đa các component từ thư viện React Native Reusables (RNR) có sẵn của dự án.

---

## 3. Tích hợp tiếp `feat/assessment-tabs` vào `main`

- **Ngày rà soát:** 04/11/2026. **Commit được rà soát:** `c0fedbe`, `f440ef1`, `0d8b210`, `fd76ce8`.
- **Phạm vi mới:** menu cấu hình/tặng hoa nhanh, tiêu chí lưu trên thiết bị, bản nháp sổ bé ngoan, tổng kết tháng và sheet phản hồi, avatar thật từ danh sách lớp, sửa bản nháp lời bình học kỳ và thông báo lỗi 5xx.
- **Nhận xét UI:** bản demo được chấp nhận để tiếp tục phát triển, chưa được xác nhận khớp Figma. Cần kiểm tra lại khoảng cách, avatar và sheet trên máy thật; ưu tiên component RNR sẵn có trước khi tự dựng.
- **Sửa trong lúc tích hợp:** chuyển hàm HTTP lấy avatar ra khỏi hook vào `features/assessment/api/assessment.api.js`; lưu tháng chỉ gửi học sinh có bản nháp thay đổi để tránh upsert cả lớp khi sửa một học sinh. Hai chỉnh sửa này chưa thay đổi contract.
- **Chưa hoàn tất:** chưa kiểm tra UI trên máy của người dùng sau bốn commit; không xác nhận được lưu tháng/học kỳ thành công vì staging trả 500 khi `records` có phần tử. Sau khi backend sửa, cần thử trên dữ liệu test được phép thay đổi, rồi xác nhận body và luồng lưu. Parent semester feedback vẫn chỉ là UI.

### Rủi ro còn lại khi merge

| Mức | Vấn đề | Việc tiếp theo |
| --- | --- | --- |
| Chặn chức năng | `POST /assessment/classes/{classId}/monthly` và `/semester` với `records` không rỗng trả 500 do UUID `req.user.sub` bị ép `BigInt` trong service. `records: []` trả 200 nhưng không lưu gì. | Backend đổi UUID sang `account_id` trước khi ghi `evaluated_by`; kiểm tra lại body và `savedCount > 0` trên staging. |
| Cao, quyền riêng tư | Phụ huynh gọi được `GET /assessment/classes/{classId}/semester` và nhận cả lớp; mobile chỉ lọc con mình sau khi đã tải dữ liệu. Cách này đã được người dùng cho phép tạm để demo. | Backend giới hạn route lớp theo vai trò và làm endpoint chỉ trả học kỳ của con. Mobile chuyển sang endpoint mới trước khi dùng dữ liệu thật. |
| Trung bình | Tiêu chí tặng hoa lưu bằng AsyncStorage trên một thiết bị; không đồng bộ giữa giáo viên/thiết bị. | Backend xác nhận tiêu chí là cá nhân hay cấp lớp; nếu cần đồng bộ, thêm API đọc/lưu tiêu chí. |
| Trung bình | Query đánh giá nạp lại bản nháp khi dữ liệu server đổi; refetch nền có thể làm mất chỉnh sửa chưa lưu. | Khi backend sửa lưu, kiểm tra và bảo vệ bản nháp trong lúc refetch. |
| Chờ contract | Chưa có đường lưu nhận xét học kỳ của phụ huynh; `GET /parent/good-behavior` có `record.id = null` và `historyMonths` không nhất quán với tháng đang xem. | Backend xác nhận nghiệp vụ, trả trạng thái bản ghi đúng và cung cấp endpoint nếu lời bình phụ huynh được phép lưu. |

### Đề nghị backend cho mobile

1. **Ưu tiên 0 — sửa ghi đánh giá:** áp dụng cùng bước quy đổi `public_id` UUID → `account_id` đang có ở `saveAssessmentRecords` cho `saveMonthlyAssessments` và `saveSemesterAssessments`. Bằng chứng request/response đã che dữ liệu nằm trong `docs/contract-audit.md`. Tiêu chí nhận: giáo viên được phân công gửi một bản ghi hợp lệ nhận 2xx và `savedCount > 0`; GET lại phản ánh thay đổi. Sau đó thống nhất request schema thực tế (`teacherNotes`, `week1Rose`…`week5Rose`) với Swagger, vì hiện cả body theo service lẫn Swagger đều dừng ở 500.
2. **Ưu tiên 0 — tách dữ liệu học kỳ phụ huynh:** endpoint theo phiên đăng nhập, chỉ trả năm lĩnh vực, kết quả và lời bình của đúng con; route theo lớp cần từ chối token phụ huynh nếu trả danh sách cả lớp. Không dùng số lĩnh vực 90–98 cố định trong code context làm kết quả thật.
3. **Ưu tiên 1 — phản hồi phụ huynh:** xác nhận có cho phụ huynh lưu nhận xét học kỳ không. Nếu có, cung cấp endpoint đọc/ghi theo con và học kỳ, quyền, body, lỗi và điều kiện sửa; màn mobile hiện chưa nối nút lưu vì chưa có contract.
4. **Ưu tiên 1 — trạng thái sổ liên lạc:** làm rõ/sửa `record.id` và `historyMonths.isEvaluated`/`rosesCount` của `GET /parent/good-behavior` để mobile xác định tháng đã có phiếu mà không đoán từ lời bình mẫu.
5. **Settings — cần xác nhận phạm vi:** Swagger hiện có `/auth/change-password`, nên mobile sẽ nối sau khi kiểm tra staging; Swagger chưa thấy API lưu tùy chọn thông báo. Backend xác nhận công tắc thông báo là tùy chọn cá nhân trên server hay chỉ UI. Theme lưu trên thiết bị; đổi ngôn ngữ đang được hoãn theo quyết định sản phẩm.

### Thứ tự hoàn thiện sau merge

1. Người dùng kiểm tra UI/điều hướng assessment trên máy; ghi lỗi cụ thể, chỉnh từng màn theo Figma.
2. Backend sửa hai POST 500; mobile thử lại lưu một bản ghi test và làm rõ schema.
3. Backend trả endpoint học kỳ riêng cho phụ huynh; mobile bỏ cách lọc cả lớp trên thiết bị.
4. Hoàn thiện Setting: đổi mật khẩu theo contract đã xác nhận, rồi bàn và nối tùy chọn thông báo/ngôn ngữ khi chốt nghiệp vụ.

---

## 4. Chuyển đăng nhập mobile sang Turnstile WebView

- **Branch:** `feat/native-captcha-and-backend-brief`.
- **Thay đổi:** cài `react-native-webview` theo phiên bản Expo SDK 56; mở challenge từ API base URL qua `/auth/mobile-challenge`; nhận `TURNSTILE_TOKEN` bằng `postMessage` rồi đưa token vào `useLogin` → `POST /auth/login`. Bỏ chuỗi bypass cố định. Mỗi lần đăng nhập thử lại đều mở challenge mới; token không lưu vào storage và không ghi log. Nền web dùng iframe cùng trang challenge để bundle/web preview hoạt động.
- **Contract đã kiểm tra:** GET `https://testmamnonhontre.sorak.io.vn/api/auth/mobile-challenge` trả 200, HTML có bridge `window.ReactNativeWebView.postMessage` cho `TURNSTILE_TOKEN` và `TURNSTILE_ERROR`. Body login giữ `username`, `password`, `role`, `captchaToken` như staging đã xác nhận.
- **Kiểm tra build:** Babel parse các file đổi, xuất web 25 route và Android JavaScript bundle thành công. Xuất Android Hermes bytecode trên máy Windows hiện báo `permission denied` khi tạo `index.hbc` trong thư mục Temp ở hai lần thử; chưa xác định là cấu hình máy hay pipeline. Chưa xác minh Turnstile hoàn tất và login thật trên emulator/máy, nên không đánh dấu auth production đã hoàn thành.
- **Bước tiếp theo:** chạy app native, xác minh challenge hiển thị, token đến app, đăng nhập thường và 2FA thành công; kiểm tra bản release Android/iOS. Nếu build Hermes trên CI cũng lỗi thì xử lý môi trường build trước khi phát hành.

---

## 4. Chuyển đăng nhập từ CAPTCHA bypass sang Turnstile WebView

- **Branch:** `feat/native-captcha-and-backend-brief`. **Ngày rà soát:** 04/11/2026.
- Màn mật khẩu mở trang `GET /auth/mobile-challenge` trên cùng host với `EXPO_PUBLIC_API_URL`, nhận `TURNSTILE_TOKEN` qua `postMessage`, chuyển token một lần vào `useLogin` → `POST /auth/login`. Đã bỏ chuỗi bypass khỏi source; token không được ghi vào storage hoặc log. Có nút đóng/thử lại khi challenge lỗi. Cài `react-native-webview` bằng `npx expo install` theo Expo SDK 56.
- Endpoint challenge staging đã trả HTML 200 và có bridge `ReactNativeWebView.postMessage`. Bundle web xuất được. Lần xuất Android đầu đi qua Metro nhưng Hermes trên Windows không ghi được file tạm (`permission denied`); đây chưa phải xác nhận app chạy trên thiết bị. Cần kiểm tra đăng nhập giáo viên, phụ huynh và nhánh 2FA trên máy Android/iOS trước release.
- Phần Setting hiện có UI và điều hướng profile, theme, language, notification, about, account. Theme và 2FA có xử lý; đổi ngôn ngữ được hoãn, công tắc tùy chọn thông báo chỉ là UI, đổi mật khẩu chưa nối dù Swagger có endpoint. Vì vậy **Setting flow chưa hoàn tất về chức năng**; backlog ghi trạng thái theo từng màn, không gộp thành Done.
