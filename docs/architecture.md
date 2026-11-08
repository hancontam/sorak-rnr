# Kiến trúc và kế hoạch Sorak Mobile

Chốt ngày 05/11/2026. Đây là thiết kế đích; không coi các route/feature minh họa dưới đây là chức năng đã triển khai. Các bước được triển khai và duyệt commit riêng từ nền `52ae38c`.

## Mục tiêu

Đọc hiểu một feature thì đọc được feature khác theo cùng cách. JavaScript, Expo Router, RNR/NativeWind, Zustand, TanStack Query, Axios. Figma dùng hiểu flow, chấp nhận UI chuẩn framework thay vì khôi phục các animation/navigation tùy biến cũ.

Worktree `C:/Users/HCT/Desktop/sorak-rnr/wt-rebuild`, branch `rebuild/mobile-foundation`, base `52ae38cebf5bb28bc314457f526acf6316a3e66b`. Main đối chiếu lúc bắt đầu `5318a02`. Không reset main; chỉ chuyển code đã hiểu, phù hợp phạm vi mới và có kiểm chứng.

Người dùng duyệt nâng Expo SDK 56 -> 57 trong bước nền ngày 05/11/2026: Expo 57.0.32, React Native 0.86.3, Reanimated 4.5.1 và Worklets 0.10.1 theo bộ dependency SDK. Lý do là regression bộ nhớ Hermes của SDK 56; đây không phải thay kiến trúc hoặc viết lại component RNR. Giữ NativeWind 4.2.7/Tailwind 3. Tham khảo [Expo SDK 57](https://expo.dev/changelog/sdk-57#known-regressions) và [NativeWind 4](https://www.nativewind.dev/docs/getting-started/installation). Dev client dùng thư viện native SDK 56 phải build lại trước khi chạy source SDK 57; bundle JS không thay thế việc đó.

Hạn mục tiêu 08/11/2026 có phụ thuộc backend và kiểm tra native. Người dùng chọn hoàn tất phạm vi trước bàn giao, không giảm phạm vi âm thầm hoặc đánh Done chỉ vì có UI/bundle chạy.

## Cấu trúc đích

Tên route cụ thể sẽ review ở bước điều hướng. Chỉ tạo thư mục khi có code, không tạo toàn cây rỗng.

```text
app/
  _layout.jsx                 # provider, restore gate, guard
  (auth)/                     # Welcome, account/password, OTP
  (teacher)/
    _layout.jsx               # Stack GV
    (tabs)/
      _layout.jsx             # Expo Router Tabs
      reports.jsx
      daily.jsx
      assessments.jsx
    ...                       # chi tiết ngoài tab bar
  (parent)/
    _layout.jsx               # Stack PH
    (tabs)/
      _layout.jsx
      child-profile.jsx
      daily.jsx
      results.jsx
    ...
  settings/                   # Stack chung sau đăng nhập
  notifications/              # sau khi xác nhận contract/quyền
features/
  auth/
    screens/
    components/               # UI riêng auth khi cần tách
    hooks/
    api/
    store/
  report/                     # cùng quy tắc screens/components/hooks/api
  daily/
  assessment/
  pickup/
  settings/
  notification/
components/
  ui/                         # RNR và primitive UI chung
  shared/                     # component ghép dùng chung nhiều feature
shared/
  api/client.js
  storage/
lib/                          # helper/theme starter
assets/images/                # ngang cấp
docs/
```

Không bắt feature có đủ thư mục. `utils/` cho hàm thuần khi cần. Không thêm repository/controller/service mobile chỉ để giống backend. Không thêm `src/` chỉ vì gọi chung là source code.

## Component và import

Phân loại theo trách nhiệm, không chỉ theo việc component có phải RNR hay tự viết:

| Nơi đặt | Trách nhiệm | Ví dụ |
| --- | --- | --- |
| `components/ui/` | UI nền RNR và primitive chung, không biết nghiệp vụ | Button, Input, Card |
| `components/shared/` | UI ghép dùng ở nhiều feature, nhận props/callback | EmptyState, OtpCodeInput |
| `features/<feature>/components/` | UI hiểu dữ liệu hiển thị của feature, không tự tải dữ liệu | StudentReportCard, ActivityCard |

Screen gọi hook, truyền data và callback cho component. Component có thể giữ state UI cục bộ; API/query nghiệp vụ vẫn ở hook của feature. Component dùng chung không import ngược feature. Chỉ nâng component lên shared khi có nhu cầu dùng chung thực tế.

`@/` là alias gốc dự án, cấu hình sẵn trong `jsconfig.json`; không liên quan đến barrel. Dùng alias để lấy module dùng chung hoặc route tham chiếu feature. Nội bộ feature dùng đường dẫn tương đối ngắn. Import trực tiếp từng file để người đọc thấy nguồn, chưa tạo barrel `index.js` gom export. Route `app/index.jsx` vẫn là route hợp lệ, không bị quy tắc barrel này cấm.

Ví dụ import đích trong `features/report/screens/TeacherReportScreen.jsx` (các file minh họa chưa được tạo):

```jsx
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { StudentReportCard } from '../components/StudentReportCard';
import { useClassStudents } from '../hooks/useClassStudents';
```

Thứ tự nhóm import: thư viện ngoài -> module dùng chung qua alias -> module nội bộ feature; cách nhau một dòng trống. Component cùng thư mục import bằng `./...`, không qua index để tránh vòng lặp. Quy tắc này thay quy ước cũ gom mọi component vào ui và cho phép barrel ui.

## Một ví dụ luồng dữ liệu

Ví dụ đích: phụ huynh xem hồ sơ con (chưa triển khai trong worktree).

1. Route `app/(parent)/(tabs)/child-profile.jsx` chỉ export screen feature report.
2. `ParentReportScreen` gọi `useParentReport()` và vẽ loading/error/empty hoặc dữ liệu nhận được.
3. `useParentReport` chứa `useQuery`, query key gắn với tài khoản và tham số liên quan; gọi `getParentReport`. TanStack Query giữ data/error/trạng thái và thông báo React render lại.
4. `getParentReport` trong `features/report/api/` gọi client với `/parent/student-report`, đọc response theo contract kiểm chứng. Đây là nơi biết endpoint của feature.
5. `shared/api/client.js` ghép base URL, header/token và gửi HTTP. Nó không biết bố cục hồ sơ trẻ.
6. Response -> hàm API -> Query cache -> hook -> screen. Component UI nhận props hiển thị, không tự gọi backend.

Khi ghi: screen đưa form values vào action của hook -> `useMutation` -> API -> client. Hook xử lý pending/error và invalidate/cập nhật cache đúng sau thành công. Không báo lưu thành công chỉ vì người dùng đã bấm nút; giữ bản nháp khi lỗi.

| Trạng thái | Nơi sở hữu | Ví dụ |
| --- | --- | --- |
| UI/form cục bộ | React state screen/component | Giá trị ô nhập, hiện/ẩn mật khẩu, sheet mở |
| Server/request | TanStack Query trong hook | Hồ sơ, notifications, mutation phản hồi |
| App dùng chung | Zustand feature store | Phiên hiện tại, lựa chọn theme |
| Bền vững | Wrapper shared/storage | SecureStore token; AsyncStorage theme |
| Tính toán thuần | Hàm thường | Format ngày, kiểm tra form |

Welcome chỉ hiển thị/điều hướng không có `useWelcome` rỗng. `useState` UI ở screen vẫn hợp lệ. Query/mutation nghiệp vụ luôn tách vào hook; không tạo bản sao dữ liệu server trong Zustand.

Nền dùng chung có API nhỏ để các feature sử dụng:

- `shared/api/client.js`: Axios instance đọc `EXPO_PUBLIC_API_URL`, timeout 15 giây. `.env.example` chứa URL test2; `.env.local` của máy không đưa vào Git. Header phiên/refresh được nối ở bước auth, không suy diễn contract ở bước nền.
- `shared/api/query-client.js`: tạo QueryClient; root giữ một instance bằng `useState`. Query được coi còn mới trong 30 giây; query/mutation không tự retry mặc định. Root chuyển AppState native cho focusManager; đây chưa phải listener mạng hoặc listener đổi màn.
- `shared/storage/token.storage.js`: `readTokens`, `writeTokens`, `clearTokens`; cặp token ghi chung một giá trị SecureStore. Đọc không có phiên trả null, dữ liệu hỏng/I/O lỗi thì báo lỗi để bước auth xử lý. Không lưu token vào AsyncStorage hoặc fallback web localStorage.
- `shared/storage/preferences.storage.js`: `readThemeMode`, `writeThemeMode`, chỉ nhận light/dark/system. Chưa có lựa chọn hoặc giá trị cũ không hợp lệ thì dùng system; lỗi I/O vẫn được đưa lên caller. Việc áp dụng/khôi phục theme qua hook/store sẽ nối ở bước Settings, không tự sinh feature trong bước nền.
- Token màu brand light/dark nằm trong `global.css`, ánh xạ class tại `tailwind.config.js`; `lib/theme.js` giữ giá trị tương ứng cho API native cần màu JS. Khi đổi màu phải giữ hai biểu diễn CSS/JS khớp nhau.

## Navigation và session

- Root giữ QueryClient ổn định. Khôi phục phiên xong mới chọn auth/GV/PH. Chưa khôi phục không có nghĩa đã logout.
- Layout sở hữu guard, screen không rải redirect cạnh tranh. Auth flow tiến từng bước; hết phiên có quy trình chung.
- Refresh một lần cho request đồng thời, retry có giới hạn. Response đến muộn sau logout không được đăng nhập lại. Dọn/hủy cache của tài khoản cũ khi logout/đổi tài khoản.
- Lỗi mạng có thử lại; 403 báo thiếu quyền, không mặc định xóa phiên. Rỗng/null hợp lệ khác lỗi schema/HTTP.
- GV 0/1 lớp, PH đúng 1 HS. Không lớp vẫn dùng Settings, vùng dữ liệu lớp hiện chưa phân công; không default classId. PH không lấy cả lớp rồi lọc.
- Stack/Tabs tiêu chuẩn; cách trình bày Settings review ở bước UI, không chồng lớp nền/navigator để mô phỏng sheet cũ. Ưu tiên back behavior ổn định.

### Cách đọc Auth 2A

1. `package.json` khai báo `expo-router/entry`. `app/_layout.jsx` dựng các provider và gọi `useSessionBootstrap` để khôi phục phiên trước khi mở route.
2. `app/index.jsx` mở Welcome. `app/auth/login.jsx` mở form theo vai trò được chọn trong sheet. Shell WebView hiển thị host và tiến trình tải thật. Khi Turnstile trả token, nút **Cho phép & Tiếp tục vào Sorak** xuất hiện. Chỉ khi bấm nút, form nhận token để đăng nhập.
3. `useLogin` gửi dữ liệu qua `auth.api.js` và Axios. Nếu server yêu cầu OTP, hook giữ `tempToken` và lựa chọn ghi nhớ của lần đăng nhập đó. Lỗi request được trả về form để hiện RNR Alert.
4. Khi server trả user và token, `features/auth/session.js` kiểm tra vai trò rồi cập nhật Zustand. Cặp token giữ trong RAM. Khi chọn **Ghi nhớ phiên đăng nhập**, cặp token cũng được lưu vào SecureStore và cập nhật sau refresh. Phiên chỉ lưu trong RAM vẫn refresh được khi app còn chạy.
5. Guard mở `app/session.jsx` khi đăng nhập thành công. Màn Tài khoản tạm hiện toast có thể vuốt lên để tắt hoặc tự ẩn, cho xem user thực và đăng xuất. Khi đăng xuất, session dọn cache, xóa token và đổi số phiên để bỏ phản hồi cũ.

`shared/api/session-interceptors.js` nhận callback từ session để gắn Bearer token. Các request nhận 401 dùng chung lần refresh nếu cùng token và chỉ gửi lại một lần. Lỗi mạng và 403 giữ phiên. Khi mở lại app, phiên đã lưu được kiểm tra qua `/auth/me`.

### Cách đọc Auth 2B

Từ form giáo viên, `LoginScreen` mở `PasswordRecoveryScreen` với mã cán bộ điền sẵn. Screen dùng `usePasswordRecovery` để gửi OTP qua email liên kết. Người dùng nhập OTP và mật khẩu mới trên cùng màn. Hook gọi verify trước rồi mới gọi reset. Nếu lưu thất bại sau khi OTP đã đúng, hook giữ reset token trong RAM để thử lại. Nếu server báo mã hoặc phiên hết hiệu lực, người dùng yêu cầu OTP mới.

Sau khi server xác nhận đổi mật khẩu, app trở lại form giáo viên với mã đã dùng và ô mật khẩu trống. Đăng nhập tiếp qua Turnstile của 2A. OTP, mật khẩu và reset token thuộc luồng recovery đang mở. Phụ huynh xem hướng dẫn liên hệ giáo viên chủ nhiệm.

## Ma trận phạm vi

| Flow | GV | PH | Điều kiện kiểm chứng |
| --- | --- | --- | --- |
| Auth | Login, Turnstile, OTP/2FA; quên MK theo mã cán bộ | Login; quên MK liên hệ GVCN | Restore/refresh/logout/đổi tài khoản không lẫn dữ liệu |
| Báo cáo/Hồ sơ trẻ | List đúng lớp -> detail | Thẳng con mình | Hồ sơ, sức khỏe/WHO, điểm danh, HĐGD, ủy quyền đúng dữ liệu/quyền |
| Nhật ký ngày | Lịch; điểm danh/đón trẻ/sức khỏe; đánh giá HĐGD từ slot | Chỉ xem con mình | Ngày/slot đúng; khung trống không giả hoạt động/ID |
| Đánh giá giai đoạn | Sổ bé ngoan/học kỳ chỉ xem | Xem; phản hồi Sổ bé ngoan | Không có tặng hoa/ghi học kỳ ở mobile; không phản hồi học kỳ |
| Ủy quyền đón trẻ | Xem/xử lý theo nghiệp vụ | Tạo/xem/hủy theo điều kiện BE | Badge thật, chuyển trạng thái đúng, tránh gửi trùng |
| Settings | Hồ sơ, đổi MK, 2FA theo quyền/contract; theme, giới thiệu, logout | Chức năng đúng quyền PH | Không có hàng/công tắc giả; xác minh quyền tài khoản với API |
| Thông báo | Chờ xác nhận endpoint/quyền GV | Có đầu mối API PH cần kiểm chứng | Push/email preference đang chờ backend-requests |

Không có xin nghỉ học, BGH mobile, chọn nhiều lớp/con hoặc tiếng Anh trong đợt này. Không có lựa chọn English giả hoạt động. Hồ sơ được sửa trường nào, hành động tài khoản nào cho PH cần đối chiếu contract trước khi làm, không bịa endpoint. Nội dung chính sách/hướng dẫn tự soạn là bản dự thảo cần chủ sản phẩm duyệt, không tự nhận chính thức.

## Bước triển khai và điểm duyệt

Đây là thứ tự kỹ thuật; trạng thái màn chỉ ở Google Sheet. Mỗi bước review trước code, diff/kiểm tra trước commit. Bước lớn chia thành hành vi hoàn chỉnh và trình phạm vi, không tạo chuỗi commit vá không giải thích.

| Bước | Nội dung review | Điều kiện xong để xin duyệt commit |
| --- | --- | --- |
| 0 Quy ước | AGENTS, kiến trúc, audit, yêu cầu BE | Chỉ docs, người dùng hiểu ranh giới/dependency |
| 1 Nền | Package cần thiết; env test2; Axios/QueryClient; storage; RNR/theme | Đúng phiên bản Expo hiện tại; import/bundle phù hợp; không dựng feature giả |
| 2 Auth | API/hook/store, WebView Turnstile, restore/refresh/logout, guard | Native GV/PH; OTP cùng người dùng; lỗi mạng/403/401; đổi tài khoản; không bypass |
| 3 Shell/Settings | Tabs/stack, Settings tiêu chuẩn, theme persist, profile/account | Back/route theo quyền; GV 0 lớp; theme sau mở lại; thao tác tài khoản đúng contract |
| 4 Báo cáo | GV list/detail, PH own-report, WHO | Đúng HS; dữ liệu/nguồn chart/đơn vị/giới hạn tuổi rõ; native scroll/loading/error/empty |
| 5 Nhật ký/ủy quyền | Lịch ngày, HĐGD slot, tác vụ GV, PH xem, đơn đón trẻ | Đọc lại sau ghi; ngày/slot đúng; quyền PH; tác động test được duyệt |
| 6 Kết quả/thông báo | Assessment chỉ xem, PH phản hồi tháng, notification theo BE xác nhận | Học kỳ thật sau BE sửa; phản hồi đúng tháng; badge/read đúng; push native nếu chốt vào phạm vi |
| 7 Bàn giao | Rà GV/PH, build config/test2, review merge/phát hành | Nêu lỗi/dependency còn lại; duyệt merge; phát hành tester là yêu cầu riêng |

Ước lượng có điều kiện: 05/11 nền và bắt đầu auth; 06/11 auth/shell/settings; 07/11 các flow dữ liệu; 08/11 kiểm tra xuyên suốt/build. Lịch rất chặt, không biến phần chưa xác minh thành Done để giữ hạn. Backend học kỳ/thông báo, dữ liệu test, thời gian duyệt và native test là dependency thực tế.

## Kiểm chứng và tích hợp

Không thêm test files. Chạy kiểm tra phù hợp source/import, bundle khi sửa source, staging contract và native flow; không lặp build chỉ để có log. Chưa chạy native ghi rõ chưa chạy.

Trước bàn giao cần kiểm tra: GV/PH, GV không lớp, mở app có/không phiên, login fail, refresh/hết phiên, mất mạng/thử lại, logout/đổi tài khoản, stack back, loading/error/empty, dữ liệu thật, role chỉ xem không có hành động ghi, keyboard không che form, cache không lẫn tài khoản.

Commit body: Thay đổi; Lý do/luồng dữ liệu; Đã kiểm tra; Chưa kiểm chứng/phụ thuộc. Nhận xét merge trong merge commit, không tài liệu riêng.

Base cũ chưa có cấu hình CI/dev-client mới. Trước tích hợp, review diff toàn bộ so với main tại thời điểm đó và quyết định rõ phần source thay thế/phần build giữ lại. Merge branch từ commit cũ không tự xóa code cũ trên main. Không reset/force-push main; không làm mất công việc agent khác. Build chỉ sau yêu cầu phát hành riêng.
