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
2. **Yêu cầu & Đơn từ đón hộ / ủy quyền (`features/request`):**
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
- **Kiểm tra build:** Babel parse các file đổi, xuất web 25 route và Android Hermes bytecode thành công. Lần đầu Hermes trên Windows báo `permission denied` với thư mục Temp mặc định; đặt `TEMP`/`TMP` vào `.expo/temp` trong worktree rồi xuất Android thành công. Chưa xác minh Turnstile hoàn tất và login thật trên emulator/máy, nên không đánh dấu auth production đã hoàn thành.
- **Bước tiếp theo:** chạy app native, xác minh challenge hiển thị, token đến app, đăng nhập thường và 2FA thành công; kiểm tra bản release Android/iOS.

---

## 5. Rà soát Setting sau khi merge

**Kết luận:** cấu trúc sheet → stack và phần lớn UI đã có cho giáo viên/phụ huynh; chưa thể gọi là full flow chức năng.

| Mục | Hiện trạng code | Còn cần làm |
| --- | --- | --- |
| Mở Setting, hồ sơ, điều hướng stack, đăng xuất | Có route và UI; hồ sơ đọc từ phiên đăng nhập. | Kiểm tra chuyển màn, quay lại và đăng xuất trên bản release. |
| Giao diện Sáng/Tối/Tự động | Có `useThemePreference`, đổi NativeWind và lưu AsyncStorage. | QA màu và trạng thái sau khởi động lại trên Android/iOS. |
| Ngôn ngữ | Màn chỉ hiện Tiếng Việt và English; chưa chọn/dịch. Đây là phần người dùng chủ động hoãn. | Chốt phạm vi dịch rồi triển khai nếu cần. |
| Thông báo trong Setting | Hai cấp stack có UI, nhưng `SettingsSwitchRow` đặt `disabled` cho mọi công tắc. | Chốt cách lưu tùy chọn/contract với backend trước khi nối; phân biệt với danh sách thông báo đã có. |
| Quản lý tài khoản | Bật/tắt 2FA qua email có hook/API. Hàng “Đổi mật khẩu” chưa có `onPress` dù Swagger có `/auth/change-password`. | Đối chiếu staging rồi làm form đổi mật khẩu; QA OTP/2FA trên thiết bị. |
| Giới thiệu | Có UI, nhưng phiên bản đang ghi cứng `v1.0.0`; hàng pháp lý/tài liệu chưa mở nội dung. | Lấy phiên bản app thật và nối link/nội dung được sản phẩm xác nhận. |

**Thứ tự trao đổi từng bước:** (1) QA Setting hiện có trên máy, (2) đổi mật khẩu, (3) quyết định tùy chọn thông báo, (4) xử lý pháp lý/tài liệu, (5) dịch hai ngôn ngữ khi được duyệt. Không tự mở rộng sang chức năng ngôn ngữ đang hoãn.

## 6. Chẩn đoán Turnstile chặn đăng nhập — 04/11/2026

**Trạng thái:** người dùng xác nhận “vào được rồi” sau khi reload bản sửa qua Metro và thử đăng nhập trên thiết bị đang gặp lỗi. App giữ base URL test2 và lấy token từ callback Turnstile, không thêm bypass/token giả. Đây là xác nhận cho lần thử này, chưa bao phủ hai vai trò, 2FA hoặc APK release. Ghi chú cũ “đã kiểm thử thành công test2” trước lần chẩn đoán này không có đủ bằng chứng native. Backlog chỉ theo dõi ở Google Sheet; bỏ hai bản sao `docs/backlog-status.md` và `docs/sheet_export.csv`.

**Đối chiếu server:** GET `/api/auth/mobile-challenge` trên `testmamnonhontre.sorak.io.vn` và `test2mamnonhontre.sorak.io.vn` đều trả 200, cùng HTML 3438 ký tự, sitekey và CSP. Web đang deploy cũng dùng cùng sitekey; code context mô tả Invisible mode. Invisible mode không có widget hiển thị nên ảnh trắng trong trình duyệt riêng lẻ không chứng minh challenge thất bại hoặc thành công. Trang hiện không đổi nội dung sau success. Không tự đổi base URL của app: đổi host còn đổi môi trường tài khoản/dữ liệu và chưa chứng minh giải quyết được challenge.

**Kiểm tra từ terminal:** Chrome headless trên cả hai server tải được Turnstile API, nhận `TURNSTILE_ERROR` và console `600010`, không nhận token trong khoảng quan sát 15 giây. Trình duyệt tự động có thể bị Cloudflare phát hiện, vì vậy không gán mã này cho thiết bị người dùng. Không log token hay thông tin đăng nhập. Script chẩn đoán mới đã chuyển đúng mã `600010` từ console sang bridge trong lần kiểm tra headless.

**Kiểm tra POST bổ sung:** gửi tài khoản giả không tồn tại, mật khẩu giả và `captchaToken: invalid-audit-token` với header mobile tới cả hai staging đều nhận 401 `UNAUTHORIZED` / tài khoản hoặc mật khẩu không chính xác. Không tạo phiên/OTP hay thay đổi dữ liệu. Code context kiểm tra CAPTCHA trước thông tin đăng nhập và dự kiến trả 400 nếu token sai; hành vi deploy khác hoặc staging đang tắt kiểm tra CAPTCHA. Chưa đủ bằng chứng để khẳng định cờ môi trường nào đang bật/tắt; cần backend xác nhận. Không dùng kết quả này để coi đăng nhập thật qua CAPTCHA đã đạt.

**Phần mobile sửa được:** `captcha-challenge-modal.native.jsx` hiển thị tiến trình, giới hạn chờ 30 giây, thông báo lỗi tải script/trang/HTTP và mã lỗi Turnstile nếu có, cho phép thử lại. Cho phép `about:blank`/`about:srcdoc` theo hướng dẫn Cloudflare và bật third-party cookies. Không giả User Agent, không dùng token giả. Do server đang bỏ mã lỗi, tạm đọc riêng chuỗi mã lỗi công khai của Cloudflare từ console; không chuyển các đối số console hay token ra log. Khi backend sửa callback chính thức, ưu tiên mã `code`/`errorCode` trong bridge và bỏ cách đọc console nếu không còn cần thiết.

**Backend cần hỗ trợ để chốt nguyên nhân:**

1. Trang challenge nhận `errorCode` từ `'error-callback'`, gửi `{ type: 'TURNSTILE_ERROR', code: String(errorCode) }` qua bridge thay vì bỏ đối số như hiện tại. Nhánh `catch` của `turnstile.render` phải gửi lỗi; thêm xử lý script tải thất bại và timeout. Có thể hiển thị trạng thái success/error trên trang để kiểm tra bằng trình duyệt thông thường.
2. Kiểm tra widget trong Cloudflare: sitekey đang dùng, mode và danh sách hostname của hai staging. Mã `110200` mới là bằng chứng hostname chưa được cho phép; `200500` là iframe tải lỗi; họ `600*` là challenge thất bại. Không kết luận sai domain chỉ từ ảnh trắng.
3. Khi POST `/auth/login` nhận token, backend gọi Siteverify với secret riêng của server. Log kết quả `success`, `error-codes`, `hostname`, `action` và traceId theo mức cần thiết; không log secret, token hay mật khẩu. Code context chỉ trả `Boolean(data.success)` nên làm mất lý do Siteverify từ chối. Đây là code context, chưa xác minh log/cách xử lý của bản backend deploy.
4. GET challenge trả 200 chỉ cho biết HTML được phục vụ. Nếu client không nhận token thì chưa gọi POST login; backend sẽ không có log login cho lần chờ đó. Cần mã lỗi từ client trước khi kết luận lỗi cấp token, hoặc log Siteverify khi token đã đến backend.

**Giới hạn kết luận:** lần đăng nhập sau reload thành công nhưng chưa tách riêng tác động của việc cho phép `about:blank`/`about:srcdoc`, cookies (Android vốn mặc định bật third-party cookies) và việc thử lại challenge. Không khẳng định backend hỏng, hostname sai hoặc một prop riêng lẻ đã sửa nguyên nhân. Không đổi staging cũ. Nếu lỗi lặp lại, lấy mã từ modal để xử lý đúng lớp.

**Kiểm tra mã:** Babel parse JSX và JavaScript chẩn đoán hợp lệ; Android Hermes export thành công (4042 modules). Lần export đầu gặp lỗi quyền ghi Temp của Hermes trên Windows; chạy lại với TEMP/TMP trong `.expo/turnstile-temp` thành công. Không tạo test file hoặc thay cấu hình môi trường lâu dài.

Nguồn chính thức: [Cloudflare mobile WebView](https://developers.cloudflare.com/turnstile/get-started/mobile-implementation/), [widget modes](https://developers.cloudflare.com/turnstile/concepts/widget/), [error codes](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/).
