# Yêu cầu backend cho Sorak Mobile

Ngày 05/11/2026, môi trường test2. Tập trung yêu cầu/nghiệm thu, không thay backlog Google Sheet. Schema mong muốn là đề xuất, chưa phải contract xác nhận. Người dùng chuyển yêu cầu cho team; agent không tự gửi tin nhắn.

## BE-01 — Thông báo theo tài khoản và thiết bị

**Trạng thái 11/11:** GET hộp thông báo dùng được cho cả GV/PH trên test2. 6A dùng số chưa đọc server trả và contract đánh dấu đọc của web. Push đã nối client theo guide và còn chờ cấu hình thiết bị để nghiệm thu có phiên.

**Cần gì:**

1. Xác nhận phân trang, thứ tự, thời gian có timezone và loại thông báo của hộp hiện có.
2. Tổng unreadCount tài khoản độc lập trang hiện tại. Trả cùng danh sách hoặc API thống kê đều được, không bắt tạo endpoint mới nếu hiện tại đủ.
3. Guide đã mô tả Expo Push Token, API đăng ký/gỡ và test push. Cần nghiệm thu các API này có phiên, gồm việc ngừng nhận push sau đăng xuất và hành vi khi phiên hết hạn.
4. API tùy chọn nhận thông báo/email nếu có. Mobile không dùng switch local để giả ngừng email server.

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

## Mẫu yêu cầu mới

Vai trò/flow bị chặn; cần gì/vì sao; bằng chứng ngày/môi trường; endpoint hiện có và phần thiếu; request/response đề xuất; quyền/empty/error; dữ liệu test; nghiệm thu; ảnh hưởng thời hạn; phản hồi BE. Không ghi bug client, nghiệp vụ đã bỏ (xin nghỉ/ghi học kỳ GV) hoặc điều chưa điều tra thành lỗi BE chắc chắn.
