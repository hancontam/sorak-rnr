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
    _layout.jsx               # Stack GV, chi tiết học sinh ngoài tabs
    (tabs)/
      _layout.jsx             # Expo Router Tabs
      overview.jsx
      timetable.jsx
      assessments.jsx
    ...                       # chi tiết ngoài tab bar
  (parent)/
    _layout.jsx               # Stack PH
    (tabs)/
      _layout.jsx
      child-profile.jsx
      timetable.jsx
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
5. Từ bước 4, guard mở nhóm `(teacher)` hoặc `(parent)` theo vai trò backend. Header Home giữ toast đăng nhập có thể vuốt tắt và lối vào Settings. Khi đăng xuất, session dọn cache, xóa token và đổi số phiên để bỏ phản hồi cũ.

`shared/api/session-interceptors.js` nhận callback từ session để gắn Bearer token. Các request nhận 401 dùng chung lần refresh nếu cùng token và chỉ gửi lại một lần. Lỗi mạng và 403 giữ phiên. Khi mở lại app, phiên đã lưu được kiểm tra qua `/auth/me`.

### Cách đọc Auth 2B

Từ form giáo viên, `LoginScreen` mở `PasswordRecoveryScreen` với mã cán bộ điền sẵn. Screen dùng `usePasswordRecovery` để gửi OTP qua email liên kết. Người dùng nhập OTP và mật khẩu mới trên cùng màn. Hook gọi verify trước rồi mới gọi reset. Nếu lưu thất bại sau khi OTP đã đúng, hook giữ reset token trong RAM để thử lại. Nếu server báo mã hoặc phiên hết hiệu lực, người dùng yêu cầu OTP mới.

Sau khi server xác nhận đổi mật khẩu, app trở lại form giáo viên với mã đã dùng và ô mật khẩu trống. Đăng nhập tiếp qua Turnstile của 2A. OTP, mật khẩu và reset token thuộc luồng recovery đang mở. Phụ huynh xem hướng dẫn liên hệ giáo viên chủ nhiệm.

## Ma trận phạm vi

| Flow | GV | PH | Điều kiện kiểm chứng |
| --- | --- | --- | --- |
| Auth | Login, Turnstile, OTP/2FA; quên MK theo mã cán bộ | Login; quên MK liên hệ GVCN | Restore/refresh/logout/đổi tài khoản không lẫn dữ liệu |
| Báo cáo/Hồ sơ trẻ | List đúng lớp -> detail | Thẳng con mình | Hồ sơ, sức khỏe/WHO, điểm danh, HĐGD, ủy quyền đúng dữ liệu/quyền |
| Thời khóa biểu | Lịch; điểm danh/đón trẻ/sức khỏe; đánh giá HĐGD từ slot | Chỉ xem con mình | Ngày/slot đúng; khung trống không giả hoạt động/ID |
| Đánh giá giai đoạn | Sổ bé ngoan/học kỳ chỉ xem | Xem; phản hồi Sổ bé ngoan | Không có tặng hoa/ghi học kỳ ở mobile; không phản hồi học kỳ |
| Ủy quyền đón trẻ | Xem/xử lý theo nghiệp vụ | Tạo/xem/hủy theo điều kiện BE | Badge thật, chuyển trạng thái đúng, tránh gửi trùng |
| Settings | Xem hồ sơ và ảnh đại diện; đổi mật khẩu, 2FA, quản lý phiên theo quyền; theme, giới thiệu, đăng xuất | Xem hồ sơ và ảnh đại diện; các thao tác tài khoản theo quyền PH | Hồ sơ chỉ đọc ở cả hai vai trò. Dùng ảnh từ API và chỉ hiển thị thao tác tài khoản đã xác minh |
| Thông báo | Chờ xác nhận endpoint/quyền GV | Có đầu mối API PH cần kiểm chứng | Push/email preference đang chờ backend-requests |

Không có xin nghỉ học, BGH mobile, chọn nhiều lớp/con hoặc tiếng Anh trong đợt này. Giao diện bước 3 dùng Tiếng Việt. Bộ chọn chỉ có Tiếng Việt và English khi bản dịch toàn app sẵn sàng. Hồ sơ GV/PH chỉ đọc, gồm cả ảnh đại diện. Dùng ảnh của tài khoản do API trả về; dùng chữ cái đầu khi ảnh thiếu hoặc tải lỗi. Nội dung chính sách/hướng dẫn tự soạn là bản dự thảo cần chủ sản phẩm duyệt, không tự nhận chính thức.

### Quản lý phiên trong Settings

Header Home mở `app/settings/_layout.jsx` trong nhánh đã đăng nhập. Settings và Hồ sơ đọc user của phiên hiện tại. Root khôi phục lựa chọn giao diện qua `useThemePreference` và `preferences.storage.js`; chế độ Tự động theo giao diện hệ thống.

Hiển thị phiên hiện tại và các phiên khác theo dữ liệu API. Có nút Làm mới và xác nhận trước khi Đăng xuất tất cả thiết bị. Khi server xác nhận thu hồi tất cả, mobile dọn phiên và cache của tài khoản hiện tại rồi trở về luồng đăng nhập. Cần xác minh trên test2 với cả GV và PH. Nhãn Thiết bị này cần được xác nhận bằng phiên thực tế, độc lập với thứ tự đăng nhập.

## Bước triển khai và điểm duyệt

Đây là thứ tự kỹ thuật; trạng thái màn chỉ ở Google Sheet. Mỗi bước review trước code, diff/kiểm tra trước commit. Bước lớn chia thành hành vi hoàn chỉnh và trình phạm vi, không tạo chuỗi commit vá không giải thích.

| Bước | Nội dung review | Điều kiện xong để xin duyệt commit |
| --- | --- | --- |
| 0 Quy ước | AGENTS, kiến trúc, audit, yêu cầu BE | Chỉ docs, người dùng hiểu ranh giới/dependency |
| 1 Nền | Package cần thiết; env test2; Axios/QueryClient; storage; RNR/theme | Đúng phiên bản Expo hiện tại; import/bundle phù hợp; không dựng feature giả |
| 2 Auth | API/hook/store, WebView Turnstile, restore/refresh/logout, guard | Native GV/PH; OTP cùng người dùng; lỗi mạng/403/401; đổi tài khoản; không bypass |
| 3 Shell/Settings | Màn Tài khoản tạm mở Settings bằng stack toàn màn hình; theme lưu trên thiết bị; hồ sơ chỉ xem; quản lý tài khoản và phiên | Back về Tài khoản; GV 0 lớp vẫn vào Settings; theme giữ sau mở lại; dữ liệu và thao tác đúng contract. Tabs Home triển khai ở bước sau |
| 4 Báo cáo | GV list/detail, PH own-report, WHO | Đúng HS; dữ liệu/nguồn chart/đơn vị/giới hạn tuổi rõ; native scroll/loading/error/empty |
| 5 Thời khóa biểu/ủy quyền | Lịch ngày, HĐGD slot, tác vụ GV, PH xem, đơn đón trẻ | Đọc lại sau ghi; ngày/slot đúng; quyền PH; tác động test được duyệt |
| 6 Kết quả/thông báo | Assessment chỉ xem, PH phản hồi tháng, notification theo BE xác nhận | Học kỳ thật sau BE sửa; phản hồi đúng tháng; badge/read đúng; push native nếu chốt vào phạm vi |
| 7 Bàn giao | Rà GV/PH, build config/test2, review merge/phát hành | Nêu lỗi/dependency còn lại; duyệt merge; phát hành tester là yêu cầu riêng |

Ước lượng có điều kiện: 05/11 nền và bắt đầu auth; 06/11 auth/shell/settings; 07/11 các flow dữ liệu; 08/11 kiểm tra xuyên suốt/build. Lịch rất chặt, không biến phần chưa xác minh thành Done để giữ hạn. Backend học kỳ/thông báo, dữ liệu test, thời gian duyệt và native test là dependency thực tế.

## Kiểm chứng và tích hợp

Không thêm test files. Chạy kiểm tra phù hợp source/import, bundle khi sửa source, staging contract và native flow; không lặp build chỉ để có log. Chưa chạy native ghi rõ chưa chạy.

Trước bàn giao cần kiểm tra: GV/PH, GV không lớp, mở app có/không phiên, login fail, refresh/hết phiên, mất mạng/thử lại, logout/đổi tài khoản, stack back, loading/error/empty, dữ liệu thật, role chỉ xem không có hành động ghi, keyboard không che form, cache không lẫn tài khoản.

Commit body: Thay đổi; Lý do/luồng dữ liệu; Đã kiểm tra; Chưa kiểm chứng/phụ thuộc. Nhận xét merge trong merge commit, không tài liệu riêng.

Base cũ chưa có cấu hình CI/dev-client mới. Trước tích hợp, review diff toàn bộ so với main tại thời điểm đó và quyết định rõ phần source thay thế/phần build giữ lại. Merge branch từ commit cũ không tự xóa code cũ trên main. Không reset/force-push main; không làm mất công việc agent khác. Build chỉ sau yêu cầu phát hành riêng.

## Cách đọc Tổng quan lớp / Hồ sơ trẻ (bước 4)

- GV: root guard → `(teacher)/(tabs)/overview` → `TeacherOverviewScreen` → `useClassStudents` → `report.api.js` → Axios. Chỉ một lớp được phân công; 0 lớp hiện trạng thái riêng, nhiều lớp báo bất thường. Danh sách thật có tìm theo tên/mã; chọn học sinh mở stack `student/[studentId]` ngoài tab bar.
- PH: root guard → `(parent)/(tabs)/child-profile` → `ParentReportScreen` → `useParentReport` → `/parent/student-report`. Không truyền mã con qua route hay gọi endpoint cả lớp. API kiểm tra `student.id/publicId` khớp học sinh liên kết trong phiên.
- `StudentReport` ghép summary, bộ chọn học kỳ và năm mục đọc: Hồ sơ, Sức khỏe, Điểm danh, Đánh giá hoạt động, Ủy quyền đưa đón. Hook giữ trạng thái request/cache; component chỉ nhận data/callback. Không lưu bản sao report vào Zustand.
- Query key gồm tài khoản, lớp/con, học kỳ. Request nhận AbortSignal; logout hủy và xóa cache qua session chung. API từ chối response sai học sinh hoặc thiếu các danh sách, không biến lỗi thành dữ liệu rỗng. Kéo xuống tải lại giữ dữ liệu hiện có; đổi học kỳ tải đúng kỳ mới.
- `features/home/layouts/HomeTabs.jsx` dùng Expo Router JavaScript Tabs. Chỉ thêm tab có chức năng thật trong từng bước; chưa dựng tab Thời khóa biểu/Kết quả giả. Header có tài khoản/ảnh từ phiên và mở Settings. Không có bộ chọn nhiều lớp, thông báo mẫu hay yêu cầu duyệt mẫu của prototype.
- Route `session.jsx` và `SessionScreen` tạm đã được thay bằng Home theo vai trò; Settings Back quay về Home. Giữ phần Auth session xử lý token/refresh, đó không phải screen tạm.

### WHO

`features/report/data/who-reference.js` chứa bảng tham chiếu, **không phải dữ liệu đo của học sinh**. Mỗi dòng là `[tháng, -3 SD, -2 SD, trung vị, +2 SD, +3 SD]`, tách chiều cao/cân nặng và nam/nữ. Trích đủ mỗi tháng 24–60 từ WHO Child Growth Standards 2006 (chiều cao đứng, không lấy chiều dài nằm); 61–72 từ WHO Growth Reference 2007. Đọc bảng PDF WHO ngày 09/11/2026, giữ độ chính xác công bố 0,1 cm/kg. Nối tuyến tính giữa các tháng để vẽ; không dùng đường tham chiếu tự đoán của web cũ.

Nguồn: [chiều cao 2–5 tuổi](https://www.who.int/tools/child-growth-standards/standards/length-height-for-age), [cân nặng 0–5 tuổi](https://www.who.int/tools/child-growth-standards/standards/weight-for-age), [chiều cao sau 5 tuổi](https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/height-for-age), [cân nặng 5–10 tuổi](https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/weight-for-age-5to10-years).

`growth-chart.js` tính tuổi tại ngày đo từ ngày sinh (ngày / 30,4375), kiểm tra ngày và số đo dương, giữ thứ tự thời gian. Không clamp tuổi, bịa số đo hoặc di chuyển điểm trùng. Ngoài 24–72 tháng/thiếu dữ liệu vẫn còn trong lịch sử và được ghi số lượng không vẽ. Thiếu giới tính thì không chọn bảng thay. Trục dọc mở rộng nếu cần để không giấu số đo ngoài dải; mobile không sửa số đo có vẻ bất thường.

`WhoGrowthChart` vẽ SVG native từ bảng và `health.history`. Màu tham chiếu theo web; palette đặt tập trung trong utility, vùng biểu đồ nền trắng ở cả light/dark để màu khoa học nhất quán. Phần card/chữ xung quanh dùng token RNR. Chọn ngày đo để đọc điểm kể cả các điểm trùng vị trí. Dải màu ghi bằng SD; không dùng cân nặng theo tuổi để tự kết luận thừa cân, không thay đánh giá chuyên môn.

## Cách đọc Thời khóa biểu (bước 5A)

- Hai route `(teacher)/(tabs)/timetable` và `(parent)/(tabs)/timetable` dùng `TimetableScreen`. Screen giữ ngày đang chọn; `useTimetable` đọc vai trò, lớp/con từ phiên, gọi API tương ứng và giữ query key theo tài khoản, vai trò, lớp/con, ngày. Request có AbortSignal.
- GV gọi `/attendance/classes/{classId}/timetable`; PH gọi `/parent/schedule`, không tải lịch lớp qua endpoint giáo viên. Query gửi ngày và khoảng tuần thứ Hai–Chủ nhật. Lọc hoạt động bằng ngày ISO đầy đủ, giữ tất cả slot cùng ngày, không lấy phần tử đầu tiên theo khung sinh hoạt.
- `schedule-date.js` xử lý ngày/giờ trường UTC+7, tuần qua tháng/năm và chọn tháng. `timetable-model.js` biến response thành dữ liệu hiển thị; component nhận props, không gọi HTTP. Mốc giờ cố định GV theo web nằm tập trung trong `routine-slots.js`; PH đọc routineSlots của API. Lịch và chi tiết dùng cùng giờ của khung, không hiển thị hai nguồn giờ khác nhau.
- Ngày thường có đủ khung sinh hoạt. Khung chưa xếp hoạt động không mở chi tiết; cuối tuần không có hoạt động hiện trạng thái trống. Cuối tuần có hoạt động thật vẫn mở được ở cả hai vai trò. Không tự gọi ngày rỗng là ngày nghỉ chính thức.
- Chọn hoạt động mở stack `schedule-activity` ngoài tab bar, chỉ truyền `date` và `slotId`; màn chi tiết tìm lại đúng ID/ngày trong query đã kiểm tra lớp/con. PH chỉ đọc mục tiêu, mục đích yêu cầu, chuẩn bị, tiến trình. Không điền nội dung mẫu khi API thiếu dữ liệu.
- Kết quả PH ở chi tiết lấy từ `slotAssessments`, nối bằng `routineSlot` + ngày lịch `YYYY-MM-DD`. Nghiệp vụ đã xác nhận một khung/ngày một HĐGD. Không nối theo tên hoặc ID bản đánh giá. Học sinh vắng vẫn xem được kết quả HĐGD nếu GV đã đánh giá. Nhóm kết quả cả ngày chỉ nằm ở màn lịch, không thay kết quả của slot đang mở.
- 5B mở Điểm danh, Sức khỏe và Đón trẻ từ ba thẻ của GV. Nút **Đánh giá học sinh** nằm trong chi tiết hoạt động GV. `daily-records` nhận loại tác vụ, ngày và mã slot nếu đánh giá. Hook lấy lớp từ phiên đăng nhập và kiểm tra lại hoạt động theo lớp/ngày trước khi tải đánh giá. Ngày tương lai chỉ xem. PH vẫn xem các thẻ tóm tắt.
- Điểm danh và HĐGD giữ kết quả đã ghi; dòng chưa ghi có mặc định Có mặt/Đạt trong draft. Khi Lưu, validate và gửi đủ danh sách bằng studentId, kể cả khi UI đang tìm một học sinh. HĐGD không loại học sinh vắng. Query tải lại không ghi đè bản nháp; trước khi ghi đối chiếu roster và dữ liệu nền, sau ghi đọc lại từng ID. Đóng/back khi có thay đổi phải xác nhận.
- Sức khỏe bắt buộc đủ cm/kg của mọi học sinh có mặt. Do test2 đang điền 85/12 cho dòng vắng thiếu số đo, mobile tạm không gửi dòng vắng; vẫn hiển thị bé vắng và giữ số đo server đã có để đối chiếu. Đây là workaround ghi tại BE-04, không phải thay đổi nghiệp vụ. Đón trẻ chỉ lưu từng bé Có mặt, chọn người thân/ủy quyền hợp lệ theo ngày từ API; không có Người đón khác.
- 5C mở **Ủy quyền đón trẻ** từ lịch và Đón trẻ. PH gửi đơn cho con của phiên (PENDING), hủy đơn chờ duyệt. GV xem, duyệt/từ chối kèm lý do và tạo đơn cho học sinh trong lớp (APPROVED ngay). Tạo đơn không đánh dấu đã đón. Sau khi tạo, làm mới danh sách người đón. Ảnh đơn GV dùng Expo Image Picker → hook upload → API multipart; không đặt HTTP trong component. Nếu kết quả ghi chưa xác nhận, giữ form và chặn gửi trùng cho đến khi đối chiếu.

`DailyRecordsScreen` dùng `PickupRecordCard` riêng cho đón trẻ để không trộn các điều kiện với điểm danh/sức khỏe. Tổng đã đón và badge từng bé lấy từ response, không từ draft. Form vẫn hiện khi chưa được phép ghi, kèm lý do và nút khóa. Chọn người theo ID của danh sách được phép; payload lưu studentId và snapshot người đón đúng contract web. Đơn được tạo không tự chọn người hoặc tự gửi ghi nhận đón trẻ.
