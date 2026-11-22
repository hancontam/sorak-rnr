# Sorak Mobile

Ứng dụng di động của hệ thống quản lý Trường Mầm non Sorak, dành cho **giáo viên** và **phụ huynh**. Ban giám hiệu dùng bản web. App dùng chung backend với bản web, và quyền của từng tài khoản do backend quyết định.

## Tính năng

**Giáo viên** (phụ trách một lớp):

- Tổng quan lớp: sĩ số, điểm danh, sức khỏe, đón trẻ trong ngày; hồ sơ, biểu đồ tăng trưởng (WHO) và báo cáo từng bé.
- Thời khóa biểu theo tuần. Ghi nhận trong ngày: điểm danh, số đo sức khỏe, đón trẻ, đánh giá từng hoạt động giáo dục.
- Kết quả học tập của cả lớp (Sổ bé ngoan theo tuần/tháng, kết quả học kỳ) dạng bảng, có tìm kiếm và lọc theo trạng thái.
- Ủy quyền đón trẻ: duyệt hoặc từ chối đơn của phụ huynh, tạo đơn đã duyệt.

**Phụ huynh** (mỗi tài khoản gắn với một bé):

- Hồ sơ trẻ: thông tin, sức khỏe, điểm danh, đánh giá hoạt động theo học kỳ.
- Thời khóa biểu (chỉ xem) và nhật ký hoạt động ở trường.
- Sổ bé ngoan, gửi phản hồi cho giáo viên; kết quả học kỳ đã công bố.
- Tạo và hủy đơn ủy quyền đón con, kèm ảnh người đón.
- Thêm nhiều tài khoản (mỗi bé một tài khoản) và chuyển qua lại trên cùng máy.

**Chung:**

- Đăng nhập, xác thực hai lớp (OTP), đổi mật khẩu, quản lý phiên đăng nhập trên các thiết bị.
- Hộp thông báo chia hai tab Bản tin trường / Hoạt động lớp; thông báo đẩy (push). Bấm vào push sẽ mở đúng tài khoản của bé.
- Giao diện sáng/tối/tự động; tiếng Việt và tiếng Anh.

## Công nghệ

| Phần       | Thư viện                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------- |
| Nền tảng   | Expo SDK 57, React Native 0.86, JavaScript (JSX)                                              |
| Điều hướng | Expo Router: tab riêng cho từng vai trò, Stack cho màn chi tiết                               |
| Giao diện  | React Native Reusables (RNR), NativeWind 4 (Tailwind CSS), Lucide icons                       |
| Dữ liệu    | TanStack Query (dữ liệu từ server, cache), Axios (HTTP), Zustand (trạng thái phiên trong RAM) |
| Lưu trữ    | Expo SecureStore (token đăng nhập), AsyncStorage (tùy chọn giao diện, ngôn ngữ)               |
| Thông báo  | Expo Notifications (Expo Push Token)                                                          |

## Cấu trúc thư mục

```text
app/                  Route của Expo Router: layout, phân quyền theo vai trò, màn mỏng chỉ export screen
  (teacher)/          Nhóm màn của giáo viên
  (parent)/           Nhóm màn của phụ huynh
  auth/, settings/    Đăng nhập và cài đặt
features/<tính năng>/ Mã theo nghiệp vụ: auth, home, daily, report, assessment, pickup, notification, settings
  screens/            Màn hình: bố cục, sự kiện, điều hướng
  components/         Giao diện riêng của tính năng, nhận dữ liệu qua props
  hooks/              Query/mutation và điều phối thao tác
  api/                Gọi endpoint, kiểm tra và chuyển đổi response
  utils/, store/      Hàm thuần và state Zustand của tính năng
components/ui/        Component nền RNR (Button, Card, Badge, Input…)
components/shared/    Component ghép dùng chung (bảng dữ liệu, lịch, bộ lọc…)
shared/api/           Axios client chung, xử lý phiên và làm mới token
shared/storage/       Lớp bọc SecureStore/AsyncStorage
shared/i18n/          Bản dịch tiếng Anh
assets/images/        Ảnh minh họa
```

## Cài đặt và chạy

Yêu cầu: Node.js 20 trở lên, Android Studio (Android SDK, máy ảo hoặc điện thoại bật USB debugging). Chạy trên iOS cần máy Mac có Xcode.

1. Cài thư viện theo lockfile:

   ```bash
   npm ci
   ```

2. Tạo file cấu hình môi trường từ mẫu (file này không đưa lên Git):

   ```bash
   cp .env.example .env.local
   ```

   `EXPO_PUBLIC_API_URL` trỏ tới server thử nghiệm `https://test2mamnonhontre.sorak.io.vn/api`. Biến có tiền tố `EXPO_PUBLIC_` được đóng vào app, vì vậy không đặt mật khẩu hay token trong file này.

3. Build và chạy bản phát triển trên Android:

   ```bash
   npx expo run:android
   ```

   Lệnh này tạo thư mục `android/`, build app rồi cài lên máy ảo hoặc điện thoại. App dùng một số module native (thông báo đẩy, bàn phím, chọn ảnh), nên cần bản build này thay cho Expo Go.

4. Những lần sau chỉ cần khởi động Metro:

   ```bash
   npm run dev
   ```

   Mở app đã cài trên máy, app sẽ tải mã từ Metro. Sau khi đổi `.env.local`, khởi động lại Metro.

Đăng nhập bằng tài khoản giáo viên hoặc phụ huynh mà nhà trường cấp trên server thử nghiệm. Tài khoản Ban giám hiệu sẽ được hướng dẫn dùng bản web.

### Thông báo đẩy

Push chỉ hoạt động trên bản build (không chạy trong Expo Go, web hoặc máy ảo iOS). Expo project ID đã có trong `app.json`. Android dùng cấu hình Firebase trong `google-services.json`. Có thể đổi hai giá trị này bằng `EAS_PROJECT_ID` và `GOOGLE_SERVICES_JSON` trong `.env.local` (xem `.env.example`).
