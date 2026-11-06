# Sorak Mobile — quy ước bản làm lại

## Quy trình

- Đọc `docs/architecture.md` trước khi sửa source. Đó là cấu trúc đích, không phải các chức năng đã được triển khai.
- Worktree `C:/Users/HCT/Desktop/sorak-rnr/wt-rebuild`, branch `rebuild/mobile-foundation`, base `52ae38cebf5bb28bc314457f526acf6316a3e66b`. Main đối chiếu lúc bắt đầu: `5318a02`. Không reset main, chép toàn bộ feature hoặc merge toàn bộ main vào bản làm lại.
- Làm từng bước nhỏ đã duyệt. Trước bước mới, giải thích chức năng, file thêm/sửa, luồng dữ liệu và cách kiểm tra. Đã có phép cho đúng bước thì tiếp tục, không hỏi lại. Không mở rộng feature/cài thêm thư viện ngoài bước được duyệt.
- Người dùng phải hiểu và duyệt từng commit. Trước commit, trình bày diff tóm tắt, kiểm tra, giới hạn và tiêu đề/body dự kiến; chờ đồng ý commit. Cho phép code không đồng nghĩa cho phép commit, push, merge hoặc phát hành.
- Một commit có mục đích rõ ràng. Nhận xét nằm trong body commit/merge commit: thay đổi, lý do, kiểm chứng, hạn chế. Không tạo tài liệu merge riêng. Không amend/rebase/squash lịch sử đã duyệt nếu chưa được phép.
- Chỉ cập nhật/push `release/tester` hoặc chạy workflow build khi được yêu cầu cho lượt phát hành đó. Không tự build sau mỗi commit. Kiểm tra trigger CI trước khi chuyển cấu hình từ main.
- Không thêm test file/framework theo yêu cầu hiện tại. Vẫn kiểm tra source/import, bundle phù hợp, endpoint staging và flow native. Không coi web bundle thành công là đã kiểm chứng iOS/Android; báo rõ bước chưa chạy được.
- Giữ nguyên công việc người khác; không reset/xóa worktree khác hoặc ghi đè thay đổi chưa commit. Không tự tạo subagent/giao việc cho agent khác khi chưa được yêu cầu.
- Backlog duy nhất: https://docs.google.com/spreadsheets/d/1goAkle3PBvO-5_b5MAN_igZ1u5PlSG1Hp04FZSQ-HE4/edit . Chỉ cập nhật khi được yêu cầu, không tạo bản sao trong docs.

## Stack và UI

- JavaScript `.js`/JSX `.jsx`; Expo, React Native, Expo Router, RNR, NativeWind. Người dùng đã duyệt nâng nền lên Expo SDK 57 ngày 05/11/2026 để xử lý regression Hermes của SDK 56; giữ NativeWind 4 (từ 4.2.7 có hỗ trợ SDK 57) và RNR. Căn chỉnh module native theo SDK bằng Expo CLI; không tự nâng SDK tiếp hoặc đổi stack. File type tự sinh trong `.expo/` không phải source dự án.
- Zustand giữ state app/phiên trong RAM; TanStack Query giữ dữ liệu server/cache/request; Axios gửi HTTP. SecureStore lưu token bền vững; AsyncStorage lưu tùy chọn không nhạy cảm.
- Dùng Expo Router JavaScript Bottom Tabs riêng theo vai trò, Stack cho chi tiết. Không dùng carousel thay navigator. Figma làm rõ flow; ưu tiên UI chuẩn Expo/RNR, không chạy theo hiệu ứng thiết kế cũ.
- Phân loại component theo trách nhiệm: `components/ui/` chứa UI nền RNR và primitive chung (Button, Input, Card); `components/shared/` chứa component ghép dùng chung nhiều feature (trạng thái rỗng, ô OTP); `features/<feature>/components/` chứa UI riêng nghiệp vụ (thẻ học sinh, thẻ hoạt động). Component tự viết vẫn có thể ở ui nếu là primitive chung, không phân loại chỉ theo nguồn RNR/tự viết.
- Ưu tiên component có sẵn; không tùy tiện sửa primitive chung để chữa riêng một màn. Component feature nhận dữ liệu/callback qua props, không tự gọi API/query nghiệp vụ. Component dùng chung không import ngược screen/hook/component của feature. Chỉ chuyển component lên shared khi có nhu cầu dùng chung thực tế, không sao chép nhiều bản.
- Import trực tiếp file, không tạo barrel để gom export trong bước hiện tại, kể cả `components/ui/index.js`. Route `app/index.jsx` của Expo Router không phải barrel và vẫn hợp lệ.
- Dùng `@/` cho phần dùng chung hoặc route tham chiếu feature; alias trỏ gốc dự án theo `jsconfig.json`. Trong cùng feature dùng đường dẫn tương đối ngắn (`../hooks/useLogin`, `../components/LoginForm`); component cùng thư mục dùng `./...`. Không dùng chuỗi `../../../` để lấy phần dùng chung.
- Nhóm import bằng dòng trống theo thứ tự: thư viện ngoài, module dùng chung qua alias, module nội bộ feature. Không cần comment cho từng nhóm; tránh import vòng và không gom mọi thứ vào một file index chỉ để giảm số dòng.
- Ảnh ngang cấp `assets/images/`. Lucide mặc định stroke 2; ngoại lệ cần lý do UI được duyệt. Màu theo token light/dark, kể cả xanh thương hiệu, không hardcode từng screen.

## Ranh giới code bắt buộc

- `app/`: route mỏng export screen; layout/provider/guard/navigation. Không chứa request nghiệp vụ của feature.
- `features/<feature>/screens/`: tất cả screen nghiệp vụ. Bố cục, sự kiện UI, điều hướng, state form/hiển thị đơn giản. Không import file API, Axios, `useQuery`, `useMutation` trực tiếp trong screen.
- `features/<feature>/components/`: UI riêng của feature, được screen ghép và truyền props/callback; cùng ranh giới không HTTP/query nghiệp vụ như screen. Có thể giữ state UI cục bộ.
- `features/<feature>/hooks/`: mọi query/mutation nghiệp vụ và điều phối thao tác; gọi API, quản lý cache/loading/error, trả data/action cho screen. UI component không tự gọi endpoint/query nghiệp vụ.
- `features/<feature>/api/`: method/path/query/body, đọc/kiểm tra/chuyển đổi response theo contract xác nhận; dùng client chung. Không điều hướng, toast, React hook hoặc import screen.
- `features/<feature>/store/`: Zustand của feature; không thay Query cache hoặc storage bền vững.
- `features/<feature>/utils/`: hàm thuần khi cần, không đặt tên `use...` cho hàm thuần.
- `shared/api/client.js`: base URL, headers, timeout, xử lý HTTP/session chung. Không chứa endpoint nghiệp vụ. Thiết kế dependency client/session tránh import vòng.
- `shared/storage/`: wrapper SecureStore/AsyncStorage. Screen không đọc/ghi storage trực tiếp.
- Screen vẫn được dùng React hook cho state UI. Welcome chỉ hiển thị/điều hướng không cần hook rỗng. Chỉ tạo thư mục/file khi có code thật, không dựng đủ mẫu trước.
- Một QueryClientProvider ổn định ở root; không tạo Context/SessionProvider giữ bản sao phiên khi Zustand đã giữ phiên.

## Phạm vi nghiệp vụ

- Mobile chỉ GV/PH. BGH được hướng dẫn dùng web. Quyền lấy từ backend, không từ lựa chọn role trên UI login.
- GV: 0 hoặc 1 lớp. Không lớp thì hiện chưa phân công, không gọi API cần classId. Nhiều lớp trái contract thì báo dữ liệu bất thường, không tự lấy phần tử đầu. PH: một tài khoản theo mã HS gắn đúng một HS; hai con là hai tài khoản. Không có bộ chọn lớp/con.
- GV có Báo cáo (list -> detail), Nhật ký ngày, Đánh giá giai đoạn. PH có Hồ sơ trẻ (thẳng con mình), Nhật ký ngày chỉ xem, Kết quả đánh giá.
- Sổ bé ngoan và học kỳ của GV chỉ xem. PH chỉ phản hồi Sổ bé ngoan, học kỳ chỉ xem. Đánh giá HĐGD từ slot thực trong Nhật ký ngày là thao tác GV riêng, vẫn thuộc phạm vi.
- Không có xin nghỉ học. Ủy quyền đón trẻ theo vai trò; không biến ghi chú đơn ủy quyền thành đơn xin nghỉ.
- PH dùng endpoint riêng; không tải cả lớp rồi lọc client. UI guard không thay quyền backend.
- Tiếng Việt trước, English sau toàn app. Không có lựa chọn English giả hoạt động. Theme sáng/tối/tự động và lưu lựa chọn thuộc phạm vi; dòng tóm tắt hiện Sáng/Tối thực tế, màn chọn vẫn đánh dấu Tự động nếu đã chọn.
- Thông báo/push/email preference chờ xác nhận trong `docs/backend-requests.md`. Local setting không điều khiển email backend. Không hiển thị công tắc hoạt động giả.
- Không bịa dữ liệu, ID mặc định, điểm, badge hoặc thông báo thành công. Phân biệt lỗi tải, rỗng hợp lệ và thiếu quyền; không nuốt lỗi thành mảng rỗng.

## API và phiên

- Môi trường: `https://test2mamnonhontre.sorak.io.vn/api`, qua `EXPO_PUBLIC_API_URL`; không fallback test1/production. Không log/commit mật khẩu/token/OTP/dữ liệu cá nhân đầy đủ.
- Đọc `C:/Users/HCT/Desktop/Code/SWAGGER_USAGE_GUIDE.md`, Swagger https://mamnonhontre.sorak.io.vn/docs.json và context `C:/Users/HCT/Desktop/Code/sorak-web`, `C:/Users/HCT/Desktop/Code/sorak-api`. Context/Swagger có thể cũ, không phải bằng chứng live.
- Trước nối UI, kiểm chứng nhóm endpoint bằng terminal HTTP tương đương Postman trên test2. Không suy diễn body đúng từ lỗi 500 hoặc body rỗng trả 200. Sau mutation phải xác nhận tác động bằng dữ liệu đọc lại khi phù hợp.
- Test mutation cần dữ liệu test/quyền cho đúng tác động. Làm rõ trong bước được duyệt nếu gửi OTP, lời phản hồi tới GV hoặc đổi dữ liệu. Không tự gửi tin nhắn cho người khác. Thiếu dữ liệu/quyền thì ghi chưa kiểm chứng.
- Sai lệch/giới hạn ghi `docs/contract-audit.md`; yêu cầu BE ghi `docs/backend-requests.md`. Phân biệt lỗi client, lỗi BE, thiếu chức năng và chưa xác minh. Contract đề xuất không phải contract đã có.
- Auth đọc `C:/Users/HCT/Desktop/Code/MOBILE_AUTH_INTEGRATION_GUIDE.md`; dùng native WebView Turnstile, không bypass. Kiểm chứng header nền tảng, token JSON và refresh rotation trên test2.
- Khôi phục phiên xong mới chọn nhánh điều hướng; guard ở layout, không rải redirect cạnh tranh ở screen.
- Refresh single-flight, retry có giới hạn; không refresh lặp endpoint refresh. 403/lỗi mạng không mặc định hết phiên. Logout/đổi tài khoản dọn cache và chặn response cũ khôi phục phiên/dữ liệu người trước.

## Docs

- `docs/architecture.md`: cây đích, giải thích flow, bước triển khai/nghiệm thu; không là backlog trạng thái.
- `docs/contract-audit.md`: bằng chứng contract có môi trường/ngày và giới hạn.
- `docs/backend-requests.md`: yêu cầu BE tập trung và câu hỏi chờ trả lời.
- Không dùng `docs/screen-hooks.md` hoặc tài liệu merge riêng. Không chép screenshot/log/báo cáo test dài vào docs chỉ để chứng minh đã làm. Kết quả kiểm tra ngắn ở commit; bằng chứng contract cần thiết ở audit.
