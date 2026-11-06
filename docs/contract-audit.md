# Contract audit — bản làm lại

Khởi tạo 05/11/2026. Môi trường đích `https://test2mamnonhontre.sorak.io.vn/api`.

Chưa có endpoint nghiệp vụ được gọi lại từ bản làm lại. Không đánh dấu kiểm chứng chỉ vì main cũ từng chạy. Không lưu credentials/token/OTP hoặc thông tin cá nhân đầy đủ.

## Kết nối HTTP nền — 05/11/2026

| Endpoint/môi trường | Swagger | Quan sát thực tế | Giới hạn |
| --- | --- | --- | --- |
| `GET https://test2mamnonhontre.sorak.io.vn/api/health`, không token | Path `/health` mô tả 200, không khai báo security ở operation hoặc root trong JSON đã đọc | Axios client nhận HTTP 401, JSON `code: UNAUTHORIZED`, `message: Missing access token` | Xác nhận request tới server và lỗi HTTP được giữ nguyên; không coi health hoạt động công khai hoặc auth đã được kiểm chứng. Chưa thử có token vì bước auth chưa triển khai. |

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
