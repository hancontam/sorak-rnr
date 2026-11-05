# Sorak RNR — quy ước làm việc

## Quy trình cộng tác

- Làm từng bước nhỏ. Trước khi sửa code, giải thích mục tiêu, các file sẽ sửa/thêm, luồng dữ liệu và lý do chọn cách làm; chờ người dùng đồng ý với bước đó. Nếu người dùng đã cho phép rõ ràng chính bước đang làm, tiếp tục mà không hỏi lại.
- Không tự mở rộng phạm vi, dựng sẵn nhiều feature, đổi kiến trúc hoặc cài thêm thư viện ngoài bước đã được duyệt.
- Sau khi hoàn thành một bước đã duyệt, giải thích thay đổi và cách đã kiểm tra, rồi commit và push theo quy trình dự án. Không commit bản nháp khi người dùng yêu cầu xem trước.
- Commit/push code thông thường lên `main` không đồng nghĩa với phát hành bản tester. Chỉ merge/cập nhật và push `release/tester`, hoặc chạy thủ công workflow Build Tester, khi người dùng yêu cầu rõ ràng cho lượt phát hành đó (ví dụ “merge main sang release/tester để build” hoặc “lên bản mới cho tester”). Không tự lặp lại việc phát hành sau mỗi lần sửa/commit dựa vào yêu cầu build trước đó.
- Người dùng tự đánh dấu trạng thái trong backlog; không tự sửa Google Sheet.
- Không tạo test file, test framework hoặc bộ test mới trừ khi người dùng đổi yêu cầu.
- Giữ nguyên thay đổi chưa commit của người dùng. Không reset, ghi đè hoặc xóa code của họ khi chưa trao đổi.
- Khi một screen giữ hook và logic trạng thái/dữ liệu trực tiếp trong file screen, cập nhật bảng tại `docs/screen-hooks.md`. Chỉ ghi các screen thuộc trường hợp này; screen chỉ hiển thị/điều hướng hoặc chỉ gọi custom hook riêng thì không cần ghi. Không ghi báo cáo từng màn vào `AGENTS.md`.

## Stack đã thống nhất

- Expo + React Native + Expo Router; source do dự án viết dùng JavaScript (`.js`) và JSX (`.jsx`). Không tạo `.ts`/`.tsx` cho source mới. File type được công cụ sinh trong `.expo/` không thuộc source dự án.
- UI dùng React Native Reusables (RNR) và NativeWind. Ưu tiên dùng lại `components/ui` trước khi tạo UI component riêng.
- Icon Lucide trong UI dùng `strokeWidth={2}` theo quy ước hiện tại.
- Màu xanh Sorak được khai báo theo Sáng/Tối trong `global.css` và ánh xạ thành `brand` trong `tailwind.config.js`; dùng class token `bg-brand`, `text-brand-link`, `text-brand-foreground` thay vì mã màu xanh viết trực tiếp trong màn hình/component.
- Zustand quản lý trạng thái phía app cần chia sẻ, như phiên đăng nhập. TanStack Query quản lý dữ liệu từ server và trạng thái request. Axios là lớp gửi HTTP. Các thư viện này là lựa chọn kiến trúc; chỉ cài và nối vào app trong bước được duyệt.
- Token phiên lưu bằng Expo SecureStore qua lớp storage riêng. Không lưu token trong Zustand như nơi lưu bền vững.
- Tùy chọn giao diện của thiết bị lưu bằng AsyncStorage qua `shared/storage/preferences.storage.js`; Zustand chỉ giữ lựa chọn hiện tại trong bộ nhớ. Màn Ngôn ngữ hiện chỉ có UI Tiếng Việt/English, chưa thực hiện đổi ngôn ngữ.

## Ranh giới code

- `app/`: route, layout và điều hướng của Expo Router; giữ route mỏng và trỏ tới màn hình trong feature.
- `features/<feature>/screens/`: đặt mọi màn hình nghiệp vụ của feature tại đây (ví dụ `features/auth/screens/LoginScreen.jsx`, `WelcomeScreen.jsx`). Không đặt screen ngang cấp với `api/` hoặc `hooks/`.
- `features/<feature>/`: nhóm màn hình, hook, API và store theo nghiệp vụ như `auth`, `settings`, `teacher`, `parent`. Chỉ tạo thư mục con khi có code thực sự cần đặt vào đó; không tạo file hoặc thư mục rỗng cho đủ mẫu.
- `features/<feature>/api/`: đặt file chứa các hàm gọi endpoint của feature (ví dụ `features/auth/api/auth.api.js`). Các hàm này dùng Axios client chung từ `shared/api/client.js`; không gọi HTTP trực tiếp trong screen.
- `features/<feature>/store/`: đặt Zustand store giữ trạng thái trong bộ nhớ của feature (ví dụ `features/auth/store/auth.store.js`). Store không thay thế nơi lưu token bền vững trên thiết bị.
- Trong `features/<feature>/screens/*.jsx`, screen đơn giản có thể gọi trực tiếp hook của React hoặc TanStack Query (`useQuery`, `useMutation`). Khi cần gom nhiều bước xử lý, nhiều trạng thái, phân quyền hoặc logic dùng lại, đặt custom hook tự viết trong `features/<feature>/hooks/*.js` (ví dụ `features/auth/hooks/useLogin.js`) rồi gọi từ screen. Không tạo hook chỉ để chuyển tiếp một hàm hay để mỗi màn đều có hook; Welcome chỉ hiển thị và chuyển màn thì chỉ cần `features/auth/screens/WelcomeScreen.jsx`, không cần `useWelcome.js`.
- `shared/api/client.js`: cấu hình Axios dùng chung, gồm base URL và xử lý HTTP chung. `shared/storage/`: wrapper cho SecureStore (phiên đăng nhập) và AsyncStorage (tùy chọn giao diện).
- `components/ui/`: nơi đặt toàn bộ component UI được tách khỏi screen, gồm RNR primitives và component tự viết, kể cả khi component chỉ phục vụ một feature. Đặt các file component ngang cấp trong `components/ui/`, không tạo thư mục con theo feature. Ưu tiên dùng lại RNR; không tạo `features/<feature>/components/`.
- `assets/images/`: đặt các ảnh và SVG của app trực tiếp cùng cấp trong thư mục này; không tạo thư mục con theo màn hình như `welcome/`.
- Luồng gọi backend: route → screen → custom hook (nếu cần) → hàm API → Axios client → backend. TanStack Query giữ trạng thái request và dữ liệu server; Zustand giữ trạng thái app cần chia sẻ; screen đọc các trạng thái đó để hiển thị.
- Không tạo Context/SessionProvider riêng cho auth nếu Zustand đã đảm nhận trạng thái phiên. `QueryClientProvider` của TanStack Query được gắn ở root layout khi bắt đầu dùng Query.

## Hợp đồng API

- Trước khi viết hoặc sửa một nhóm endpoint, đọc Swagger tại `https://mamnonhontre.sorak.io.vn/docs.json` (cách dùng trong `C:\Users\HCT\Desktop\Code\SWAGGER_USAGE_GUIDE.md`) để biết method, path và schema dự kiến. Swagger là tài liệu tham khảo, có thể chưa khớp server staging.
- Đọc phần liên quan trong `C:/Users/HCT/Desktop/Code/sorak-web` và `C:/Users/HCT/Desktop/Code/sorak-api` để hiểu request, response và luồng nghiệp vụ. Code context có thể cũ; không lấy riêng Swagger hoặc code context làm bằng chứng endpoint đang chạy trên staging.
- Sau khi viết mỗi endpoint hoặc nhóm endpoint, gửi request đến `https://testmamnonhontre.sorak.io.vn/api` bằng Postman và đối chiếu status, request/response, header, lỗi với code mobile. Khi làm việc bằng terminal theo yêu cầu của người dùng, request HTTP tương đương Postman cũng được. Dùng tài khoản/dữ liệu thử nghiệm, che mật khẩu và token; không thử trên production. Chỉ coi endpoint chạy được khi đã xác nhận hành vi cần dùng trên staging. Nếu cần OTP, inbox hoặc dữ liệu chưa có, ghi rõ phần chưa kiểm chứng, không đánh dấu hoàn tất.
- Khi Swagger sai hoặc thiếu so với staging, ghi **chỉ điểm sai/thiếu** vào `docs/contract-audit.md` chung cho mọi feature: ngày kiểm tra, method/path, Swagger ghi gì, staging trả gì, cách kiểm tra và phần còn chưa xác nhận. Dùng hành vi đã kiểm chứng trên staging để code cho staging; không đoán field còn thiếu từ tên endpoint hoặc response lỗi. Đọc lại ghi chú cũ khi backend cập nhật Swagger.
- Với auth mobile, đọc thêm `C:/Users/HCT/Desktop/Code/MOBILE_AUTH_INTEGRATION_GUIDE.md` về `X-Client-Platform`, CAPTCHA và lưu/đổi refresh token; vẫn đối chiếu các chi tiết đó với staging. API của app lấy base URL staging từ cấu hình môi trường, không dùng domain của Swagger UI làm base URL.

## Phạm vi sản phẩm và API

- Mobile phục vụ giáo viên và phụ huynh. Nếu tài khoản ban giám hiệu đăng nhập, hiển thị thông báo dùng dashboard web; không xây flow ban giám hiệu trên mobile.
- Request auth mobile cần `X-Client-Platform` theo hệ điều hành. Refresh trên staging đã được xác nhận trả access token và refresh token mới; phải lưu đè cả hai vì refresh token được xoay vòng.
