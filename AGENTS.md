# Sorak RNR — quy ước làm việc

## Quy trình cộng tác

- Làm từng bước nhỏ. Trước khi sửa code, giải thích mục tiêu, các file sẽ sửa/thêm, luồng dữ liệu và lý do chọn cách làm; chờ người dùng đồng ý với bước đó. Nếu người dùng đã cho phép rõ ràng chính bước đang làm, tiếp tục mà không hỏi lại.
- Không tự mở rộng phạm vi, dựng sẵn nhiều feature, đổi kiến trúc hoặc cài thêm thư viện ngoài bước đã được duyệt.
- Sau khi hoàn thành một bước đã duyệt, giải thích thay đổi và cách đã kiểm tra, rồi commit và push theo quy trình dự án. Không commit bản nháp khi người dùng yêu cầu xem trước.
- Người dùng tự đánh dấu trạng thái trong backlog; không tự sửa Google Sheet.
- Không tạo test file, test framework hoặc bộ test mới trừ khi người dùng đổi yêu cầu.
- Giữ nguyên thay đổi chưa commit của người dùng. Không reset, ghi đè hoặc xóa code của họ khi chưa trao đổi.
- Khi một screen giữ hook và logic trạng thái/dữ liệu trực tiếp trong file screen, cập nhật bảng tại `docs/screen-hooks.md`. Chỉ ghi các screen thuộc trường hợp này; screen chỉ hiển thị/điều hướng hoặc chỉ gọi custom hook riêng thì không cần ghi. Không ghi báo cáo từng màn vào `AGENTS.md`.

## Stack đã thống nhất

- Expo + React Native + Expo Router; source do dự án viết dùng JavaScript (`.js`) và JSX (`.jsx`). Không tạo `.ts`/`.tsx` cho source mới. File type được công cụ sinh trong `.expo/` không thuộc source dự án.
- UI dùng React Native Reusables (RNR) và NativeWind. Ưu tiên dùng lại `components/ui` trước khi tạo UI component riêng.
- Zustand quản lý trạng thái phía app cần chia sẻ, như phiên đăng nhập. TanStack Query quản lý dữ liệu từ server và trạng thái request. Axios là lớp gửi HTTP. Các thư viện này là lựa chọn kiến trúc; chỉ cài và nối vào app trong bước được duyệt.
- Token phiên lưu bằng Expo SecureStore qua lớp storage riêng. Không lưu token trong Zustand như nơi lưu bền vững.

## Ranh giới code

- `app/`: route, layout và điều hướng của Expo Router; giữ route mỏng và trỏ tới màn hình trong feature.
- `features/<feature>/screens/`: đặt mọi màn hình nghiệp vụ của feature tại đây (ví dụ `features/auth/screens/LoginScreen.jsx`, `WelcomeScreen.jsx`). Không đặt screen ngang cấp với `api/` hoặc `hooks/`.
- `features/<feature>/`: nhóm màn hình, hook và API theo nghiệp vụ như `auth`, `settings`, `teacher`, `parent`. Chỉ tạo thêm `hooks/` và `api/` khi có code thực sự cần đặt vào đó; không tạo file hoặc thư mục rỗng cho đủ mẫu.
- `features/<feature>/api/`: đặt file chứa các hàm gọi endpoint của feature (ví dụ `features/auth/api/auth.api.js`). Các hàm này dùng Axios client chung từ `shared/api/client.js`; không gọi HTTP trực tiếp trong screen.
- Trong `features/<feature>/screens/*.jsx`, screen đơn giản có thể gọi trực tiếp hook của React hoặc TanStack Query (`useQuery`, `useMutation`). Khi cần gom nhiều bước xử lý, nhiều trạng thái, phân quyền hoặc logic dùng lại, đặt custom hook tự viết trong `features/<feature>/hooks/*.js` (ví dụ `features/auth/hooks/useLogin.js`) rồi gọi từ screen. Không tạo hook chỉ để chuyển tiếp một hàm hay để mỗi màn đều có hook; Welcome chỉ hiển thị và chuyển màn thì chỉ cần `features/auth/screens/WelcomeScreen.jsx`, không cần `useWelcome.js`.
- `shared/api/client.js`: cấu hình Axios dùng chung, gồm base URL và xử lý HTTP chung. `shared/storage/`: wrapper cho SecureStore.
- `components/ui/`: nơi đặt toàn bộ component UI được tách khỏi screen, gồm RNR primitives và component tự viết, kể cả khi component chỉ phục vụ một feature. Đặt các file component ngang cấp trong `components/ui/`, không tạo thư mục con theo feature. Ưu tiên dùng lại RNR; không tạo `features/<feature>/components/`.
- Luồng gọi backend: route → screen → custom hook (nếu cần) → hàm API → Axios client → backend. TanStack Query giữ trạng thái request và dữ liệu server; Zustand giữ trạng thái app cần chia sẻ; screen đọc các trạng thái đó để hiển thị.
- Không tạo Context/SessionProvider riêng cho auth nếu Zustand đã đảm nhận trạng thái phiên. `QueryClientProvider` của TanStack Query được gắn ở root layout khi bắt đầu dùng Query.

## Phạm vi sản phẩm và API

- Mobile phục vụ giáo viên và phụ huynh. Nếu tài khoản ban giám hiệu đăng nhập, hiển thị thông báo dùng dashboard web; không xây flow ban giám hiệu trên mobile.
- Với auth mobile, tham khảo `C:/Users/HCT/Desktop/Code/MOBILE_AUTH_INTEGRATION_GUIDE.md` và hợp đồng API đã được backend xác nhận. Code backend trong thư mục context có thể chưa cập nhật kịp.
- Request auth mobile cần `X-Client-Platform` theo hệ điều hành. Login/refresh nhận `accessToken` và `refreshToken` trong JSON; khi refresh thành công phải lưu đè cả hai token vì refresh token được xoay vòng.
