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

## Chuyển prototype thành UI Sorak

- Đọc cả source prototype và ảnh của trạng thái đang làm. Đối chiếu thứ tự khối, tỷ lệ, khoảng cách, cỡ và độ đậm chữ, icon, badge, ảnh và thao tác. Giữ các chi tiết đã duyệt, gồm cả chi tiết nhỏ. Tách khung điện thoại và nút điều khiển bản demo khỏi nội dung app.
- Tìm component và variant trong `components/ui/` trước khi viết UI mới. Badge dùng `Badge`, nút dùng `Button`, vùng nội dung dùng `Card`, thanh tiến trình dùng `Progress`, lỗi cần đọc lại dùng `Alert`. Ghép các primitive trong feature để ra bố cục của prototype.
- Dùng variant chuẩn trước. Nếu Sorak đã chốt một kiểu có ý nghĩa dùng lại, đặt variant có tên và dùng token sáng/tối trong component RNR hiện có. Ví dụ `Badge variant="brand"` cho nhãn mã tài khoản, variant mặc định cho nhãn vai trò. Kích thước hoặc cách đặt riêng một màn có thể chỉnh tại nơi ghép. Không lặp màu, viền và màu chữ để tự dựng một Badge khác.
- Phân biệt chữ giao diện đã duyệt với dữ liệu và trạng thái chạy thật. Nhãn cố định như “Mã học sinh” được khai báo trong UI. Vai trò, tài khoản, URL, tiến trình và trạng thái xác minh lấy từ đầu vào hoặc kết quả thật. Không chuyển dữ liệu mẫu, nút điền mẫu, đăng nhập giả hay thông báo thành công mô phỏng sang app.
- Khi prototype và nghiệp vụ thật khác nhau, làm trước phần đã rõ rồi hỏi người dùng theo `grill-me` về điểm ảnh hưởng đến luồng hoặc giao diện. Nêu chi tiết gốc, giới hạn đã kiểm tra và lựa chọn đề xuất. Ví dụ shell WebView giữ bố cục đã duyệt, thanh địa chỉ hiện host thật, nút Tiếp tục chỉ xuất hiện sau khi nhận kết quả Turnstile.
- Trước bàn giao, đối chiếu với prototype ở cùng kích thước màn và trạng thái khi có thiết bị. Kiểm tra màn hẹp, màu sáng/tối, bàn phím và trạng thái loading/error/success liên quan. Báo rõ các điểm khác mẫu do nghiệp vụ đã chốt và phần chưa nhìn được trên máy thật.

### Chuẩn giao diện và mật độ RNR toàn app

- Chuẩn hình ảnh từ đợt redesign (12/11/2026) là bản RNR mobile showcase (`react_native_reusables_mobile_showcase.html`): token zinc, Card `rounded-2xl` có viền và shadow mảnh, danh sách gom trong một Card kẻ mảnh, segmented control nền muted có ô đang chọn nổi, toast sonner, bottom sheet bo 28 có thanh kéo, alert dialog bo 2xl. Nội dung, thứ tự khối và luồng lấy từ app hiện tại; prototype Sorak chỉ để hiểu flow cũ.
- Màu: primary zinc-900 (tối: zinc-100). Xanh cobalt `#1447E6` dùng chung với web, chỉ cho badge vai trò, link và chấm thông báo. Đỏ chỉ cho cảnh báo/hành động nguy hiểm; xanh lá chỉ ở icon toast thành công. `global.css` và `lib/theme.js` phải khớp nhau.
- Font: Inter cho chữ giao diện, JetBrains Mono cho dữ liệu (mã HS/CB, giờ, ngày, số đếm). Font nạp một lần ở `app/_layout.jsx` trước khi ẩn splash. `Text`, `Label`, `Input` và tiêu đề dialog quy `font-medium/semibold/bold/mono` về đúng file font qua `lib/fonts.js`; không đặt `fontFamily`/`fontWeight` riêng ở screen. Chưa có file Inter 700 nên `font-bold` hiển thị như SemiBold.
- Đo ở vùng nội dung **376 dp**, kiểm tra thêm 360/412 dp; 1 CSS px của showcase ≈ 1 dp. Màn rộng tăng khoảng trống, không phóng to.

| Phần UI | Mốc mặc định |
| --- | --- |
| Lề màn, đệm Card/sheet | **16 dp** (sheet 20 dp) |
| Khoảng giữa nhóm / trong nhóm / nhãn đến ô | **16** / **8–12** / **6 dp** |
| Tiêu đề màn | **18 sp** semibold (`text-lg`) |
| Tiêu đề Card, tên, dòng danh sách chính | **14 sp** semibold (`text-sm`) |
| Nội dung, nhãn form, giá trị | **12 sp** (`text-xs`) |
| Phụ, meta, badge, nhãn tab | **11 sp** (`text-2xs`), không dùng dưới 11 |
| Input / nút | Input **40 dp**; nút **40 dp** (`sm` 36, `lg` 44), chữ nút 12 semibold |
| Vùng bấm | **≥ 44 dp** bằng kích thước, padding hoặc `hitSlop` |
| Icon | Inline **16**, tab **18**, nút icon nhỏ **32 dp** phần hiển thị |
| Bo góc | Card/nhóm **16**, ô nhỏ/segmented **12**, nút/input **8**, badge tròn hẳn, sheet **28** |
| Shadow | Card `shadow-sm` rất mảnh; lớp nổi (toast, sheet, dialog) `shadow-xl` |

- Chọn trên mobile dùng bottom sheet (`components/ui/bottom-sheet.jsx`), xác nhận thao tác dùng `AlertDialog`, kết quả tức thời dùng toast sonner; lỗi cần đọc lại vẫn dùng `Alert` trong màn. Không tự dựng lại badge/nút bằng màu và viền riêng.
- Ảnh minh họa dạng card AspectRatio (ảnh đen trắng, không người/không chữ) đặt ở `assets/images/`; nội dung ảnh không được gợi ý dữ liệu thật.
- Giữ font đã duyệt, hỗ trợ cuộn và xuống dòng khi người dùng tăng cỡ chữ hệ thống. Giữ tỷ lệ ảnh và biểu đồ theo thiết kế.

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
- GV: 0 hoặc 1 lớp. Không lớp thì hiện chưa phân công, không gọi API cần classId. Nhiều lớp trái contract thì báo dữ liệu bất thường, không tự lấy phần tử đầu. PH: một tài khoản theo mã HS gắn đúng một HS; nhiều con là nhiều tài khoản độc lập. Bộ chuyển tài khoản trên thiết bị không phải đổi studentId trong cùng một phiên.
- GV có Tổng quan lớp, Thời khóa biểu, Kết quả học tập. PH có Hồ sơ trẻ, Thời khóa biểu chỉ xem, Kết quả học tập.
- Sổ bé ngoan và học kỳ của GV chỉ xem. PH gửi/sửa một phản hồi theo phiếu tháng thật, chỉ xem kết quả học kỳ đã công bố. Đánh giá HĐGD từ slot thực trong Thời khóa biểu là thao tác GV riêng, vẫn thuộc phạm vi.
- Không có xin nghỉ học. PH tạo ủy quyền PENDING, GV duyệt/từ chối; GV được tạo đơn APPROVED từ Đón trẻ rồi tải lại người được ủy quyền. Không làm Người đón khác ghi trực tiếp. Đơn APPROVED không đồng nghĩa đã đón trẻ.
- PH dùng endpoint riêng; không tải cả lớp rồi lọc client. UI guard không thay quyền backend.
- Thời khóa biểu giữ đủ khung sinh hoạt ngày thường, nhưng khung trống không phải hoạt động và không mở chi tiết. Có hoạt động cuối tuần thì GV/PH đều xem được; không tự khóa theo thứ hoặc tự kết luận ngày nghỉ từ lịch rỗng. PH xem nội dung slot, không ghi đánh giá. PH nối kết quả theo routineSlot + isoDate (BE xác nhận, một khung/ngày một HĐGD); không nối theo tên hoặc dùng ID đánh giá thay ID lịch. GV vẫn đánh giá HĐGD cho bé vắng.
- Tiếng Việt mặc định. English áp dụng cả shell và các màn nghiệp vụ GV/PH. Màn mới thêm nhãn, thông báo và trạng thái UI vào bản dịch. Lưu lựa chọn trên thiết bị. Tên riêng, nhận xét và nội dung do người dùng hoặc backend cung cấp giữ nguyên. Theme sáng/tối/tự động và lưu lựa chọn thuộc phạm vi; dòng tóm tắt hiện Sáng/Tối thực tế, màn chọn vẫn đánh dấu Tự động nếu đã chọn.
- Hộp thông báo và số chưa đọc theo API tài khoản đang chọn. Đăng ký cùng Expo Push Token riêng bằng phiên của mỗi tài khoản PH đã thêm vào máy. Bấm push đối chiếu studentId/studentCode, chuyển đúng phiên rồi mở hộp thông báo; chưa thêm tài khoản thì không mở hộp của bé khác. Tùy chọn email chờ xác nhận trong `docs/backend-requests.md`. Local setting không điều khiển email backend.
- Nhật ký hoạt động ở trường chỉ dành cho PH, mở từ icon cạnh chuông. Lấy `data.timeline` của đúng bé từ `GET /parent/home`. Hiển thị mục tiêu/nhận xét khi API có dữ liệu.
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
- Multi-account PH: đăng nhập thêm bằng Turnstile/OTP thật, cặp token riêng từng account trong SecureStore; AsyncStorage chỉ giữ thông tin hiển thị và ID đang chọn, không giữ token/mật khẩu. Zustand giữ metadata trong RAM. Đổi tài khoản phải xác thực đúng account qua `/auth/me`, hủy request/dọn Query cache và reset stack. Logout một account chỉ gỡ token push/thu hồi/xóa phiên account đó, giữ các account khác. Phiên hết hạn phải đăng nhập lại đúng account; không dùng token bé khác. Thêm tài khoản ghi nhớ cả các phiên PH trên máy; luồng đăng nhập đơn vẫn giữ tùy chọn Ghi nhớ phiên.

## Docs

- `docs/architecture.md`: cây đích, giải thích flow, bước triển khai/nghiệm thu; không là backlog trạng thái.
- `docs/contract-audit.md`: bằng chứng contract có môi trường/ngày và giới hạn.
- `docs/backend-requests.md`: yêu cầu BE tập trung và câu hỏi chờ trả lời.
- Không dùng `docs/screen-hooks.md` hoặc tài liệu merge riêng. Không chép screenshot/log/báo cáo test dài vào docs chỉ để chứng minh đã làm. Kết quả kiểm tra ngắn ở commit; bằng chứng contract cần thiết ở audit.
