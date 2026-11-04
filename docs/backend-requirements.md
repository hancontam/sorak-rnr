# Yêu Cầu Hỗ Trợ Backend (Backend Support Requirements)
**Hệ thống Quản lý Mầm non Sorak**  
*Môi trường Staging mục tiêu:* `https://test2mamnonhontre.sorak.io.vn/api`  
*Ngày lập:* 04/11/2026  
*Căn cứ phân tích:* Codebase API (`C:\Users\HCT\Desktop\Code\sorak-api`), Web (`C:\Users\HCT\Desktop\Code\sorak-web`), và Mobile React Native (`sorak-rnr`).

---

## 1. Bổ sung Endpoint Đơn Xin Nghỉ Học Cho Phụ Huynh & Duyệt Đơn Giáo Viên

### Cần làm gì?
1. **Phía Phụ huynh:**
   - Bổ sung endpoint `POST /parent/requests/leave` cho phép phụ huynh tạo đơn xin nghỉ học:
     ```json
     {
       "startDate": "2026-11-05",
       "endDate": "2026-11-06",
       "session": "ALL_DAY", // "ALL_DAY" | "MORNING" | "AFTERNOON"
       "reason": "Bé bị sốt phát ban cần theo dõi tại nhà",
       "note": "Gia đình đã đưa đi khám, xin phép cô cho bé nghỉ 2 ngày."
     }
     ```
   - Bổ sung endpoint `POST /parent/requests/leave/:requestId/cancel` để phụ huynh có thể hủy đơn khi kế hoạch thay đổi (trước khi giáo viên duyệt).
   - Cập nhật endpoint `GET /parent/requests` để trả về cả hai danh mục đơn: `PICKUP` (Đón hộ) và `LEAVE` (Xin nghỉ học), kèm `type` và `status` (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
2. **Phía Giáo viên:**
   - Cập nhật endpoint danh sách đơn của lớp `GET /attendance/classes/:classId/authorizations` (hoặc mở rộng thành `GET /attendance/classes/:classId/requests`):
     - Bao gồm cả danh sách đơn đón hộ và đơn xin nghỉ học.
     - Trả về thống kê số đơn chờ duyệt: `stats: { pendingCount: number, totalCount: number }`.
   - Bổ sung endpoint duyệt/từ chối đơn xin nghỉ:
     - `PATCH /attendance/classes/:classId/requests/leave/:requestId/approve`
     - `PATCH /attendance/classes/:classId/requests/leave/:requestId/reject` (kèm body `{ "reason": "Lý do từ chối" }`).
   - **Tự động hóa dữ liệu:** Khi giáo viên bấm Duyệt đơn nghỉ học (`approve`), backend tự động tạo/cập nhật bản ghi chuyên cần `AttendanceRecord` cho học sinh trong các ngày tương ứng với trạng thái `EXCUSED_ABSENCE` (Nghỉ học có phép).

### Để làm gì?
- Giúp phụ huynh thao tác trực tiếp trên ứng dụng di động để gửi đơn xin nghỉ có phép cho con mà không phải liên hệ thủ công qua tin nhắn/gọi điện riêng.
- Giúp giáo viên quản lý toàn bộ đơn từ (đón hộ và xin nghỉ) tại một nơi duy nhất trên màn hình "Duyệt đơn", kiểm tra nhanh lý do và phê duyệt.
- Tự động hóa cập nhật sổ điểm danh của lớp mà không cần giáo viên phải nhớ tay từng học sinh có đơn xin nghỉ.

### Vì sao phải làm vậy?
- Hiện tại trong `sorak-api/src/routes/parent.routes.js`, hệ thống chỉ mới có endpoint cho đơn đón hộ (`/parent/requests/pickup`).
- Trong mã nguồn Web (`sorak-web/src/features/parent/pages/ParentRequestsPage.jsx` dòng 197–201), khi phụ huynh nhấn nút "Tạo yêu cầu" cho mục Xin nghỉ học, hệ thống chỉ hiển thị thông báo toast: *"Vui lòng liên hệ trực tiếp giáo viên phụ trách hoặc gửi tin nhắn..."*.
- Điều này tạo ra một "lỗ hổng luồng dữ liệu", khiến quy trình điểm danh có phép và báo cáo chuyên cần cuối tháng không có nguồn dữ liệu đối soát chính quy.

---

## 2. Loại bỏ Mock Cứng 5 Lĩnh Vực Đánh Giá Học Kỳ (`GET /parent/good-behavior`)

### Cần làm gì?
- Trong file `sorak-api/src/services/parent.service.js` (dòng 1245–1251):
  - **Hiện trạng:** Backend đang trả mảng tĩnh cho mọi học sinh:
    ```javascript
    domains: [
      { name: 'Phát triển Thể chất', rating: 'Đạt chuẩn', score: 95 },
      { name: 'Phát triển Nhận thức', rating: 'Đạt chuẩn', score: 92 },
      { name: 'Phát triển Ngôn ngữ', rating: 'Xuất sắc', score: 98 },
      { name: 'Tình cảm & Kỹ năng xã hội', rating: 'Xuất sắc', score: 96 },
      { name: 'Phát triển Thẩm mỹ', rating: 'Đạt chuẩn', score: 90 },
    ]
    ```
  - **Cần sửa:** Thay thế mảng hardcode này bằng dữ liệu thực được tính toán từ các bản ghi đánh giá của giáo viên (`SemesterAssessmentCriteria` / `SemesterAssessmentStudent`) đã được lưu qua `POST /assessment/classes/:classId/semester`.
  - Nếu giáo viên chưa chấm điểm các tiêu chí của học sinh đó trong học kỳ được chọn, trường `domains` phải trả về mảng rỗng `[]` hoặc cờ `isEvaluated: false`.

### Để làm gì?
- Đảm bảo tính trung thực và chính xác của kết quả học tập của bé khi phụ huynh tra cứu đánh giá học kỳ trên ứng dụng.
- Phụ huynh chỉ nhìn thấy kết quả khi giáo viên chủ nhiệm đã thực sự chấm điểm và hoàn thành đánh giá cuối kỳ.

### Vì sao phải làm vậy?
- Khi backend trả về điểm số tĩnh (95, 92, 98, 96, 90), mọi học sinh dù chưa được giáo viên đánh giá đều hiển thị giống hệt nhau, gây nhầm lẫn nghiêm trọng cho phụ huynh và làm mất giá trị của quy trình đánh giá thực tế của giáo viên mầm non.

---

## 3. Thống Nhất Chỉ Số Badge Số Lượng Đơn Chờ Duyệt (Home Bottom Bar)

### Cần làm gì?
- Cập nhật API `GET /parent/requests` để trả về thống kê:
  ```json
  "stats": {
    "pendingCount": 1,
    "totalCount": 5
  }
  ```
  (Trong đó `pendingCount` là số đơn đang ở trạng thái `PENDING` của học sinh).
- Đảm bảo API `GET /attendance/classes/:classId/authorizations` trả về `stats.pendingCount` phản ánh số lượng đơn chưa duyệt của giáo viên lớp đó.

### Để làm gì?
- Hiển thị badge số lượng màu đỏ nổi bật trên icon "Đơn từ" ở thanh Bottom Navigation:
  - **Với Phụ huynh:** Báo số lượng đơn của con đang chờ giáo viên xử lý (thay vì đếm tổng số lượng đơn trong lịch sử như trước).
  - **Với Giáo viên:** Báo số đơn mới nhận từ phụ huynh cần phê duyệt gấp.

### Vì sao phải làm vậy?
- Giúp người dùng nắm bắt hành động cần làm ngay lập tức khi mở app, tránh tình trạng bỏ sót đơn đưa đón hoặc đơn xin nghỉ của phụ huynh.
