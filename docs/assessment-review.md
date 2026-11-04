# Review luồng đánh giá mobile

Ngày rà soát: 04/11/2026. Branch `feat/assessment-tabs`, commit được rà soát `10f343c`.

## Trạng thái

- Đã dựng menu và bốn màn stack cho giáo viên/phụ huynh, nối luồng đọc dữ liệu staging theo báo cáo triển khai.
- Người dùng đã xem bản demo và chấp nhận tạm để merge, tiếp tục hoàn thiện chức năng rồi mới chỉnh UI chi tiết. Đây chưa phải xác nhận UI khớp Figma.
- Nhánh lưu lời bình giáo viên và phản hồi phụ huynh với nội dung hợp lệ chưa được kiểm chứng trên staging. Người dùng báo thao tác lưu đánh giá học kỳ hiện bị lỗi; cần lấy lỗi thực tế để xác định nguyên nhân.

## Nhận xét UI và nghiệp vụ từ lần xem demo

- Avatar học sinh chưa lấy/hiển thị được ảnh thật.
- Cấu trúc code theo quy ước dự án, nhưng các component tự viết chưa giống Figma; cần kiểm tra lại component RNR có sẵn trước khi tự dựng hoặc chỉnh UI.
- Sổ bé ngoan giáo viên còn thiếu menu dropdown ở header với hai action **Cấu hình tặng hoa** và **Tặng hoa nhanh**. Cần hoàn thành cấu hình gợi ý trước khi nối thao tác tặng hoa nhanh.
- Phần tổng kết tháng cần đối chiếu quy tắc hoa sen với backend: tháng 5 tuần cần ít nhất 4 hoa, tháng 4 tuần cần đủ 4 hoa. Lời bình/ý kiến phản hồi cần được phân biệt theo vai trò và hiển thị dạng bottom sheet đúng frame Figma; hiện flow và UI chưa được phân tích/chốt đầy đủ.
- Lưu đánh giá học kỳ hiện lỗi khi người dùng thao tác. Chưa có mã lỗi/response được ghi nhận; không đoán nguyên nhân từ giao diện.

## Quyết định tạm thời cho demo và việc cần backend hỗ trợ

**Đã được người dùng chấp thuận cho demo mobile trên staging và merge bản hiện tại:** giữ cách gọi hiện tại để trình diễn màn đánh giá học kỳ của phụ huynh, vì backend chưa hỗ trợ endpoint phụ huynh trả 5 lĩnh vực thật. Đây là giải pháp tạm cho demo, không phải contract đích. Sau khi backend xem demo mobile, yêu cầu backend làm endpoint riêng cho kết quả học kỳ của phụ huynh; mobile sẽ chuyển sang endpoint đó trước khi dùng với dữ liệu thật.

**Rủi ro còn nguyên — mức cao:**

`ParentSemesterScreen` gọi `GET /assessment/classes/{classId}/semester` rồi lọc `students` theo `user.student.id` trên thiết bị. Theo lần kiểm tra staging của nhánh này, token phụ huynh nhận HTTP 200 cùng dữ liệu cả lớp. Màn hình chỉ hiển thị con mình, nhưng response đã mang dữ liệu của học sinh khác xuống thiết bị. Cần backend xác nhận và giới hạn quyền truy cập ở server; lọc trên mobile không thay thế kiểm tra quyền.

Swagger hiện có `GET /parent/good-behavior`, nhưng không có endpoint phụ huynh riêng cho 5 lĩnh vực học kỳ. Web hiện lấy `semesterAssessments` từ `/parent/good-behavior`; code backend context trả `semesterAssessments[].domains` bằng các số cố định 90–98, nên không dùng các số đó làm kết quả thật.

**Yêu cầu đề xuất cho backend sau demo:** endpoint dành cho phụ huynh phải xác định con từ phiên đăng nhập, trả 5 lĩnh vực được tính từ dữ liệu thật cùng nhận xét học kỳ của đúng con, và không trả danh sách/lời bình của học sinh khác trong lớp. Endpoint theo lớp chỉ dành cho vai trò được cấp quyền. Khi backend hoàn thành, kiểm tra contract và quyền trên staging rồi thay lời gọi tạm ở `ParentSemesterScreen`.

## Các điểm cần kiểm tra/sửa trước khi chốt flow

| Mức | Vị trí | Kết quả rà soát | Bước tiếp theo |
| --- | --- | --- | --- |
| Trung bình | `ParentContactBookScreen.jsx` | `hasMonthRecord` coi `teacherNotes` khác rỗng là đã có phiếu, trong khi backend context điền câu “Chưa có nhận xét cho tháng này.” cả khi chưa có phiếu. Có thể hiện nút phản hồi và gửi ra 404. | Kiểm tra tháng trống trên staging và nhận diện phiếu từ dữ liệu thật, không dựa vào câu mặc định. |
| Trung bình | `TeacherSemesterScreen.jsx` | Bộ lọc bỏ `teacherNotes === ''` trước khi gửi, nên xóa trắng lời bình cũ không thể lưu. Mỗi lần lưu còn gửi lại toàn bộ lời bình khác rỗng, kể cả lời bình không sửa, có thể ghi đè thay đổi đồng thời. Backend context cho phép upsert chuỗi rỗng, nhưng nhánh ghi thật chưa được thử trên staging. | Chỉ gửi học sinh có lời bình thay đổi, kể cả khi nội dung mới rỗng; kiểm chứng bằng dữ liệu test được phép sửa. |
| Thấp | `TeacherGoodChildScreen.jsx` | Tổng kết luôn hiện `/5` hoa; `classInfo.totalWeeks` có thể bằng 4. | Dùng số tuần của tháng đang xem. |
| Chờ quyết định | `ParentSemesterScreen.jsx` | Figma có vùng nhận xét của phụ huynh và nút lưu, code hiện chỉ xem. Chưa xác định endpoint lưu nhận xét học kỳ cho phụ huynh. | Chốt nghiệp vụ và contract với backend trước khi nối nút lưu. |

Các file `sorak-api` và `sorak-web` trong `C:/Users/HCT/Desktop/Code/` là bản context có thể cũ; kết luận về hành vi server cần dựa trên staging mới nhất.
