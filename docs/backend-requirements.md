# Yêu Cầu Hỗ Trợ Backend (Backend Support Requirements)
**Hệ thống Quản lý Mầm non Sorak**  
*Môi trường Staging mục tiêu:* `https://test2mamnonhontre.sorak.io.vn/api`  
*Ngày cập nhật:* 04/11/2026 (Đã chuẩn hóa phạm vi: Nghiệp vụ hệ thống chỉ có Đơn ủy quyền đưa đón, KHÔNG CÓ đơn xin nghỉ học)  
*Căn cứ phân tích:* Codebase API (`C:\Users\HCT\Desktop\Code\sorak-api`), Web (`C:\Users\HCT\Desktop\Code\sorak-web`), và Mobile React Native (`sorak-rnr`).

---

## 📌 Làm Rõ Nghiệp Vụ Đơn Từ (Scope Clarification)
- **Hệ thống Sorak chỉ quản lý Đơn ủy quyền đưa đón trẻ (Pickup Authorization)**, hoàn toàn không có luồng nghiệp vụ "Đơn xin nghỉ học".
- **Bottom Navigation (icon bên trái trang Home):**
  - **Phụ huynh (`PARENT_PH`):** Chạm vào icon mở màn hình tạo đơn ủy quyền đưa đón trẻ (`/request/new`). Backend đã hỗ trợ đầy đủ các API:
    - `GET /parent/requests` (Lấy danh sách đơn)
    - `POST /parent/requests/pickup` (Tạo đơn ủy quyền mới)
    - `POST /parent/requests/pickup/:requestId/cancel` (Hủy đơn khi còn ở trạng thái PENDING)
  - **Giáo viên (`TEACHER_GV`):** Chạm vào icon mở màn hình duyệt đơn ủy quyền đưa đón của lớp (`/request/approval`). Backend đã hỗ trợ:
    - `GET /attendance/classes/:classId/authorizations` (Danh sách đơn của lớp)
    - `PATCH /attendance/classes/:classId/authorizations/:authId/approve` (Duyệt đơn)
    - `PATCH /attendance/classes/:classId/authorizations/:authId/reject` (Từ chối đơn)
- **Trạng thái hiện tại:** Luồng nghiệp vụ ủy quyền đưa đón trên Mobile đã hoàn thành 100% và kết nối API thật trên Staging `test2`.

---

## 1. Loại Bỏ Mock Cứng 5 Lĩnh Vực Đánh Giá Học Kỳ (`GET /parent/good-behavior`)

### Cần làm gì?
- Tại file `sorak-api/src/services/parent.service.js` (dòng 1245–1251):
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
- Khi backend trả về điểm số tĩnh (95, 92, 98, 96, 90), mọi học sinh dù chưa được giáo viên đánh giá đều hiển thị giống hệt nhau, làm sai lệch kết quả giáo dục thực tế.

---

## 2. Bổ Sung Thống Kê `stats.pendingCount` Trong API `GET /parent/requests`

### Cần làm gì?
- Cập nhật API `GET /parent/requests` để trả về thêm object thống kê:
  ```json
  "data": {
    "requests": [ ... ],
    "student": { ... },
    "siblings": [ ... ],
    "stats": {
      "pendingCount": 1,
      "approvedCount": 3,
      "totalCount": 4
    }
  }
  ```
  Trong đó `pendingCount` là số lượng đơn ủy quyền của học sinh đang ở trạng thái `PENDING`.

### Để làm gì?
- Đồng bộ cấu trúc với API phía giáo viên (`GET /attendance/classes/:classId/authorizations` vốn đã có `stats: { pendingCount }`).
- Giúp Badge số lượng màu đỏ trên icon "Đơn ủy quyền" ở thanh Bottom Bar (Home) của Phụ huynh hiển thị chính xác số đơn đang chờ cô giáo duyệt (thay vì phải filter mảng client-side).

### Vì sao phải làm vậy?
- Chuẩn hóa response theo RESTful API thống nhất giữa luồng Phụ huynh và Giáo viên, giúp client hiển thị badge thông báo tức thời, chính xác và tối ưu hiệu năng.
