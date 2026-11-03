# Hook dùng trực tiếp trong screen

File này giúp người đọc biết screen nào giữ hook và logic trạng thái/dữ liệu ngay trong file screen, thay vì tách toàn bộ sang custom hook. Đây là báo cáo về code đã làm, không phải nơi đặt source code.

Khi hoàn thành hoặc sửa một screen thuộc trường hợp này, thêm hoặc cập nhật một dòng trong bảng. Ghi rõ tên hook được gọi trực tiếp, nó quản lý gì, file API liên quan nếu có và lý do giữ logic trong screen. Sửa hoặc bỏ dòng khi code thay đổi để báo cáo khớp với source.

| Feature | Screen | Hook gọi trực tiếp trong screen | State/logic giữ trong screen | File API liên quan | Lý do giữ trong screen |
| --- | --- | --- | --- | --- | --- |

Không ghi screen chỉ hiển thị/điều hướng hoặc chỉ gọi custom hook đã đặt ở `features/<feature>/hooks/`. Không ghi hook nằm bên trong `components/ui/` vào đây.
