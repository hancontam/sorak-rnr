# Yêu cầu backend cho Sorak Mobile

Ngày 05/11/2026, môi trường test2. Tập trung yêu cầu/nghiệm thu, không thay backlog Google Sheet. Schema mong muốn là đề xuất, chưa phải contract xác nhận. Người dùng chuyển yêu cầu cho team; agent không tự gửi tin nhắn.

## BE-01 — Thông báo theo tài khoản và thiết bị

**Trạng thái 11/11:** GET hộp thông báo dùng được cho cả GV/PH trên test2. 6A dùng số chưa đọc server trả và contract đánh dấu đọc của web. Push đã nối client theo guide và còn chờ cấu hình thiết bị để nghiệm thu có phiên.

**Cần gì:**

1. Xác nhận phân trang, thứ tự, thời gian có timezone và loại thông báo của hộp hiện có.
2. Tổng unreadCount tài khoản độc lập trang hiện tại. Trả cùng danh sách hoặc API thống kê đều được, không bắt tạo endpoint mới nếu hiện tại đủ.
3. Guide đã mô tả Expo Push Token, API đăng ký/gỡ và test push. Cần nghiệm thu các API này có phiên, gồm việc ngừng nhận push sau đăng xuất và hành vi khi phiên hết hạn.
4. API tùy chọn nhận thông báo/email nếu có. 12/11: backend chỉ gửi email OTP, chưa có email theo loại thông báo hay API tùy chọn; web đang lưu công tắc email vào localStorage. Nếu làm email thông báo, cần API đọc/ghi tùy chọn theo tài khoản để web và mobile dùng chung. Mobile không dùng switch local để giả ngừng email server.
5. API đọc danh sách thiết bị đã đăng ký push của tài khoản (hoặc trả trạng thái trong response POST/DELETE) để xác nhận lại sau khi bật/tắt thông báo trên máy.

**Vì sao:** cần dữ liệu thật, badge đúng, mở nội dung đúng quyền. Backend gửi push đến thiết bị đã đăng ký; mobile xin quyền và xử lý khi bấm. Logout/đổi tài khoản phải xử lý liên kết thiết bị để không gửi nhầm dữ liệu.

**Bằng chứng:** GET `/parent/notifications` trả 200 cho hai vai trò. Context đếm trong 30 bản ghi. Chưa có mẫu đủ nhiều để đối chiếu tổng trên deploy.

**Contract cần làm rõ:** response mẫu danh sách/badge/read/read-all, cách cập nhật mới (refetch/poll, socket, push). Push nếu có cần notification id/type và định danh nghiệp vụ hợp lệ; không coi URL tùy ý là route tin cậy. Xác định preference nào theo tài khoản, cái nào theo thiết bị.

**Quyền/nghiệm thu:** chỉ đọc/đánh dấu thông báo mình; read lặp không sai count; tổng đúng dù nhiều trang; lỗi không giả count=0. Nếu có push: nền/đóng app, bấm mở đúng màn sau auth, logout/đổi tài khoản không lộ dữ liệu. Badge icon hệ điều hành là yêu cầu riêng, khác badge chuông trong app.

**Dữ liệu cần:** GV/PH có thông báo đọc/chưa đọc, đủ kiểm tra phân trang và tổng; thiết bị với bản build hỗ trợ push để nghiệm thu 6B.

## BE-02 — Học kỳ riêng của học sinh PH

**Trạng thái 11/11:** test2 trả học kỳ riêng của con, mẫu đang là bản nháp. Mobile chỉ hiển thị khi đã công bố.

**Cần gì:** contract test2 phần học kỳ của `GET /parent/good-behavior`, mẫu học sinh có dữ liệu thật, query chọn học kỳ/năm học, ý nghĩa lĩnh vực/mức đánh giá, chưa có kết quả, phân biệt thiếu dữ liệu với số 0.

**Vì sao:** mẫu rỗng trước đó không kiểm chứng được màn có kết quả. Mobile không tạo điểm hoặc lấy API lớp rồi lọc con.

**Bằng chứng:** mẫu test2 có `isPublished: false`, `isDraft: true` nhưng response vẫn chứa nhận xét và kết quả từng lĩnh vực. Mobile bỏ bản nháp khỏi cache. Backend cần áp dụng quy tắc công bố ngay ở API PH để dữ liệu nháp không đến client.

**Quyền/nghiệm thu:** chỉ dữ liệu con gắn với phiên, không cả lớp; nguồn đánh giá thật; đổi kỳ không lẫn dữ liệu; rỗng hợp lệ khác server lỗi. BE cung cấp tài khoản test qua kênh riêng, không ghi mật khẩu trong docs.

**Ảnh hưởng:** không coi nhánh học kỳ có dữ liệu hoàn tất trước khi deploy bản sửa và kiểm tra native. Không đề nghị endpoint mới nếu endpoint hiện có đủ sau sửa.

## BE-03 — Liên kết kết quả HĐGD với slot lịch của PH

**Trạng thái:** đã rõ nghiệp vụ và khóa nối; không cần yêu cầu endpoint mới.

Backend và người dùng xác nhận một `routineSlot` trong một ngày chỉ có một HĐGD. Nối `slotAssessments[]` với hoạt động bằng `routineSlot` + ngày lịch `YYYY-MM-DD`, không dùng tên hay coi ID bản đánh giá là ID lịch. Học sinh vắng vẫn được GV đánh giá HĐGD; PH vẫn xem kết quả nếu có.

Ngày 09/11 gọi lại `GET /parent/schedule` trên test2 cho ngày 02/11: response đúng con của phiên, có hoạt động và kết quả cùng ngày, cùng `ARRIVAL_PLAY`. Mobile đã áp dụng khóa nối ở chi tiết. Giả định cũ “hai hoạt động trong cùng khung/ngày” không thuộc nghiệp vụ Sorak, đã bỏ.

## BE-04 — Không tạo số đo mặc định cho học sinh vắng

**Trạng thái:** đã tái hiện trên test2 ngày 09/11; cần backend sửa để khớp nghiệp vụ đã chốt.

**Endpoint:** `POST /student-health/classes/{classId}/records`, body `{date, records}`. Với học sinh có điểm danh `EXCUSED_ABSENCE`, cả dòng `{studentId, height: null, weight: null, note: ""}` và dòng `{studentId}` đều trả HTTP 200, `savedCount: 1`; đọc lại lịch thấy số đo **85 cm / 12 kg**, thay vì bỏ qua bé vắng. Hai ca đã khôi phục số đo trước thử và đọc lại xác nhận; không khẳng định metadata lần cập nhật không đổi.

**Cần gì/vì sao:** backend kiểm tra điểm danh của đúng học sinh/ngày, bỏ qua học sinh vắng và không biến số đo thiếu thành dữ liệu mẫu. Mobile không thể gửi full danh sách kèm dòng vắng an toàn theo hành vi hiện tại.

**Cách mobile xử lý tạm:** vẫn hiển thị đủ danh sách, bắt buộc đủ chiều cao/cân nặng hợp lệ cho tất cả bé có mặt, nhưng chỉ gửi các bé có mặt. Không gửi 0/null/giá trị mẫu cho bé vắng. Đọc lại từng studentId để xác nhận số đo đã lưu và số đo bé vắng không bị thay đổi. Không xóa số đo vắng đã tồn tại trên server.

**Nghiệm thu BE:** xác nhận cách biểu diễn dòng vắng trong payload full danh sách; dòng vắng không tạo/cập nhật số đo, thiếu số đo ở bé có mặt trả lỗi rõ, `savedCount` phản ánh số bản ghi thực lưu. Cần kiểm tra bé vắng có và chưa có số đo cũ. Sau khi BE sửa, xác minh lại trước khi bỏ xử lý tạm trên mobile.

## BE-05 — Trả avatar học sinh ở lịch và kết quả đánh giá (ưu tiên thấp)

**Trạng thái:** đề xuất; mobile đã có cách xử lý tạm.

**Cần gì/vì sao:** `GET /attendance/classes/{id}/timetable` (`students[]`) và các endpoint kết quả `assessment` tháng/học kỳ chưa có `avatarUrl`, trong khi danh sách lớp và danh sách đón trẻ đã có. Mobile phải gọi thêm `GET /classes/{id}/students` rồi ghép theo `id` để hiện avatar ở Ghi nhận ngày và Kết quả học tập.

**Đề xuất:** thêm `avatarUrl` (cùng quy tắc dicebear khi chưa có ảnh thật) vào từng học sinh của các response trên. Không đổi trường khác.

**Nghiệm thu:** `avatarUrl` của cùng học sinh giống nhau ở mọi endpoint; khi có, mobile bỏ bước ghép từ danh sách lớp.

## BE-06 — Chặn ghi nhận ngày nghỉ/ngoài ngày và trả ngày nghỉ cho PH

**Trạng thái:** đề xuất ngày 15/11; mobile đã chặn phía app, chờ BE báo xong để kiểm chứng lại. Ngày 19/11: backend mới thêm `makeupDate` (Thứ Bảy dạy bù) nhưng bốn API lưu vẫn chưa kiểm tra ngày nghỉ/ngày hiện tại và `/parent/schedule` vẫn chưa trả `holidays`; khi chặn, ngày dạy bù phải được phép lưu. Ngày 20/11: mục 2 xong — `GET /parent/schedule` (test2, HS26019 lớp Lá, chỉ GET) trả `holidays[]` cùng shape lịch GV (20/11 HOLIDAY không cho dạy; 21/11 mục học bù có `makeupDate` = chính ngày 21/11); mobile dùng chung `dayCalendar` nên PH thấy ngày nghỉ/học bù mà không đổi logic. Mục 1 (chặn lưu) chưa kiểm chứng lại.

**Nghiệp vụ đã chốt:** điểm danh, sức khỏe, đón trẻ và đánh giá HĐGD không có xóa, chỉ tạo/cập nhật trong đúng ngày (đến 23:59 giờ trường). Ngày thuộc `SchoolHoliday` có `is_teaching_allowed = false` và `target_grades` rỗng hoặc chứa khối của lớp thì không ghi nhận gì, kể cả khi GV đã sắp slot; lịch vẫn hiện slot. T7/CN không thuộc ngày nghỉ và có slot (học bù) thì ghi nhận bình thường.

**Bằng chứng (test2, 15/11, chỉ GET):** `GET /attendance/classes/{classId}/timetable` của lớp Lá 1 trả `holidays[]` (`id, name, startDate, endDate, isTeachingAllowed, type, targetGrades`) và `classInfo.ageGroup`; T2 16/11 "Ngày Nghỉ" (`isTeachingAllowed: false`) vẫn có 5 slot. Đọc code `sorak-api`: `updateAttendance`, `POST /student-health/classes/{id}/records`, `POST /attendance/classes/{id}/dismissal`, `POST /assessment/classes/{id}/records` không kiểm tra ngày nghỉ hay ngày hiện tại. `GET /parent/schedule` không trả `holidays`.

**Cần gì:**
1. Bốn endpoint lưu trên từ chối ngày nghỉ áp dụng cho khối của lớp và ngày khác hôm nay (giờ trường), trả 4xx với `code` riêng (ví dụ `DAY_LOCKED_HOLIDAY`, `DAY_LOCKED_DATE`) để mobile hiện đúng lý do.
2. `GET /parent/schedule` trả `holidays[]` cùng shape với lịch GV (đã lọc theo khối của con) để PH thấy nhãn ngày nghỉ.

**Nghiệm thu:** lưu vào 16/11 (Lá 1) bị từ chối, đọc lại không đổi dữ liệu; ngày nghỉ chỉ áp cho khối khác thì lớp Lá vẫn lưu được; T7 học bù có slot lưu được; ngày hôm qua bị từ chối. Lịch PH của bé lớp Lá có mục 16/11.

## BE-07 — Đăng nhập mobile không Turnstile ở production

**Trạng thái:** đề xuất ngày 19/11; app đã bỏ WebView Turnstile theo quyết định của nhóm.

**Cần gì/vì sao:** app gửi `/auth/login` không có `captchaToken`, kèm `X-Client-Platform: android|ios`. Backend chỉ bỏ qua Turnstile cho trường hợp này khi `NODE_ENV !== 'production'` hoặc `ALLOW_MOBILE_BYPASS=true`, nên môi trường production phải bật biến này trước khi phát hành bản mobile mới, nếu không đăng nhập sẽ trả 400 `botBlocked`.

**Rủi ro cần BE xem lại:** `verifyCaptchaToken` chấp nhận các token cố định (`sorak-mobile-bypass`, `sorak-mobile-test`, `test-token-playwright`, `sorak-link-child-bypass`) ở mọi môi trường và mọi client, kể cả web; header `X-Client-Platform` cũng do client tự đặt. Đề xuất giới hạn token cố định ngoài production và thay Turnstile bằng giới hạn tần suất đăng nhập theo tài khoản/IP cho mobile.

**Nghiệm thu:** trên môi trường phát hành, login mobile không token trả 200; web không token vẫn bị chặn; token cố định bị từ chối ở production.

## BE-08 — Nhận diện phiên đăng nhập từ app Sorak

**Trạng thái:** đề xuất ngày 20/11; mobile đã tự xử lý phần hiển thị trong app.

**Cần gì/vì sao:** `_parseUserAgent` (auth.service.js) chỉ nhận trình duyệt và hệ điều hành; User-Agent mặc định của React Native (`okhttp/...`) không khớp gì nên phiên trên điện thoại hiện "Trình duyệt Web · Thiết bị". Từ 20/11 app gửi `User-Agent: Sorak/<version> (Android <ver>; <model>)` hoặc `(iPhone; iOS <ver>; <model>)`, nên backend đã nhận đúng Android/iOS và loại thiết bị di động, nhưng `browser` vẫn là "Trình duyệt Web". Mobile tự đổi nhãn thành "Ứng dụng Sorak · Android 17 · <model>" từ `deviceInfo`; web (danh sách thiết bị của tài khoản) vẫn hiện "Trình duyệt Web · Android".

**Đề xuất:** khi User-Agent bắt đầu bằng `Sorak/`, trả `browser: 'Ứng dụng Sorak'` và `deviceDisplay: 'Ứng dụng Sorak · <hệ điều hành> · <model>'`.

**Bằng chứng:** test2, 20/11, đăng nhập HS26019 trên emulator Android 17 sau khi đổi User-Agent; `GET /auth/sessions` trả `deviceType: 'mobile'`, `os: 'Android'`.

**Nghiệm thu:** phiên từ app hiện "Ứng dụng Sorak · Android · <model>" trên cả web và mobile; phiên trình duyệt không đổi.

## BE-09 — Hộp thông báo PH bị cắt ở 30 mục

**Trạng thái:** đề xuất ngày 20/11; mobile GV đã tự lấy nhiều trang, PH chờ backend.

**Cần gì/vì sao:** `GET /parent/notifications` (`parent.service.js` `getNotifications`) cố định `take: 30` và đếm `unreadCount` trong 30 mục đó. Bản tin trường (`data.batch_id`) thường cũ hơn thông báo hoạt động lớp nên bị đẩy khỏi 30 mục; số chưa đọc cũng thấp hơn thực tế. Mobile tách hai tab Bản tin trường / Hoạt động lớp như web, nên tab bản tin của PH thiếu mục.

**Đề xuất:** nhận `page`/`limit` và trả `pagination` như `GET /notifications/my`, hoặc `unreadCount` đếm trên toàn bộ hộp thư.

**Bằng chứng:** test2, 20/11, HS26011: `/notifications/my?limit=50` trả 33 mục, 5 bản tin, `unreadCount` 33; `/parent/notifications` trả 30 mục, 3 bản tin, `unreadCount` 30.

**Nghiệm thu:** PH thấy đủ 5 bản tin và `unreadCount` 33 với cùng dữ liệu.

## BE-10 — Token push còn hoạt động sau khi phiên bị thu hồi

**Trạng thái:** đề xuất và backend đã sửa trong ngày 21/11; test2 đạt (token gắn phiên, tắt khi đăng xuất hoặc phiên bị đẩy ra, `DELETE` nhận `refreshToken` không cần access token). Bằng chứng ở contract-audit "Token push gắn phiên, BE-10". Còn lại: token đăng ký trước khi đổi (không gắn phiên) vẫn hoạt động, ví dụ HS26019 trên emulator vẫn nhận push sau khi app gỡ token của phiên hiện tại. Đề nghị tắt các token không gắn phiên nào.

**Cần gì/vì sao:** `deviceToken` chỉ gắn với tài khoản, không gắn với phiên. Mobile gỡ token bằng `DELETE /notifications/device-token` khi đăng xuất, nhưng việc này cần phiên còn hiệu lực. Khi phiên bị thu hồi ở nơi khác (giới hạn 3 phiên mỗi tài khoản, "đăng xuất tất cả", đổi mật khẩu) thì app không gỡ được, và máy vẫn nhận push của tài khoản đã rời máy. Ví dụ: máy chỉ còn tài khoản PH nhưng vẫn nhận "Ý kiến phụ huynh" của GV.

**Đề xuất:** lưu token kèm phiên (refresh token) đã đăng ký nó và tắt token khi phiên đó bị thu hồi hoặc hết hạn. Hoặc cho `DELETE /notifications/device-token` nhận refresh token cũ để gỡ, kể cả khi phiên đã bị thay.

**Bằng chứng:** test2, 21/11. Emulator chỉ đăng nhập HS26019/HS26020. `POST /notifications/test-push` bằng CB26001 trả `deliveredCount: 2` và emulator hiện thông báo "Push GV CB26001". HS26019 trả `deliveredCount: 2`, emulator nhận 2 thông báo, tức một máy có hai token đều còn hoạt động.

**Nghiệm thu:** sau khi phiên GV trên máy bị thu hồi, test push của GV không tới máy đó.

## BE-11 — Không duyệt được đơn ủy quyền đã bắt đầu

**Trạng thái:** đề xuất ngày 24/11.

**Cần gì/vì sao:** `PATCH /attendance/classes/:classId/authorizations/:authId/approve` gọi lại `validatePickupQuota` của bước tạo đơn. Hàm này từ chối khi `startDate < hôm nay`. Vì vậy đơn PH gửi trước nhưng GV mở ra duyệt sau ngày bắt đầu (vẫn còn trong thời hạn) không duyệt được, chỉ còn cách từ chối.

**Đề xuất:** khi duyệt, chỉ chặn đơn đã hết hạn (`endDate < hôm nay`). Kiểm tra giới hạn người đón trên các ngày còn lại (từ `max(startDate, hôm nay)` tới `endDate`).

**Bằng chứng:** test2, 24/11, GV CB26001 duyệt đơn PENDING của HS26020 (21/11–29/11): 400 `VALIDATION_ERROR` "Không thể tạo đơn ủy quyền cho ngày trong quá khứ." (traceId `3b827033-0faf-4a40-97df-e7ea58a513d8`); đọc lại vẫn `PENDING`. Người dùng gặp cùng lỗi với đơn 22/11–16/01 của HS26022.

**Nghiệm thu:** duyệt được đơn đang trong thời hạn có ngày bắt đầu đã qua; đơn đã hết hạn vẫn bị từ chối với thông báo rõ.

## Mẫu yêu cầu mới

Vai trò/flow bị chặn; cần gì/vì sao; bằng chứng ngày/môi trường; endpoint hiện có và phần thiếu; request/response đề xuất; quyền/empty/error; dữ liệu test; nghiệm thu; ảnh hưởng thời hạn; phản hồi BE. Không ghi bug client, nghiệp vụ đã bỏ (xin nghỉ/ghi học kỳ GV) hoặc điều chưa điều tra thành lỗi BE chắc chắn.
