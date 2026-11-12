// Bản nháp nội dung pháp lý/hướng dẫn, mô tả đúng những gì Sorak Mobile đang làm (12/11/2026).
// Nhà trường cần rà soát trước khi phát hành; sửa nội dung tại đây, không viết lại trong screen.

export const LEGAL_UPDATED = '12/11/2026';

export const LEGAL_DOCUMENTS = {
  privacy: {
    vi: {
      title: 'Chính sách bảo mật',
      sections: [
        {
          heading: 'Phạm vi',
          body: [
            'Sorak Mobile là ứng dụng dành cho giáo viên và phụ huynh Trường Mầm Non Hòn Tre. Chính sách này mô tả dữ liệu ứng dụng hiển thị, lưu trên điện thoại và gửi tới máy chủ của nhà trường.',
          ],
        },
        {
          heading: 'Dữ liệu ứng dụng hiển thị',
          body: [
            'Thông tin tài khoản, hồ sơ trẻ, sức khỏe, điểm danh, thời khóa biểu, đơn ủy quyền đón trẻ, kết quả học tập và thông báo đều do nhà trường quản lý trên máy chủ Sorak.',
            'Giáo viên chỉ xem được lớp được phân công. Mỗi tài khoản phụ huynh chỉ xem được đúng một trẻ gắn với mã học sinh.',
          ],
        },
        {
          heading: 'Dữ liệu lưu trên điện thoại',
          body: [
            'Phiên đăng nhập được lưu trong vùng lưu trữ bảo mật của hệ điều hành, mỗi tài khoản một khóa riêng. Ứng dụng không lưu mật khẩu.',
            'Tên hiển thị của các tài khoản đã thêm, tài khoản đang chọn, giao diện, ngôn ngữ và lựa chọn thông báo được lưu trên máy để dùng lại lần sau.',
          ],
        },
        {
          heading: 'Thông báo đẩy',
          body: [
            'Khi bạn bật thông báo, ứng dụng gửi mã thông báo của thiết bị, loại hệ điều hành và tên thiết bị tới máy chủ để nhà trường gửi tin cho đúng tài khoản. Thông báo được chuyển qua dịch vụ của Expo và hệ điều hành (Firebase Cloud Messaging hoặc Apple Push Notification).',
            'Bạn có thể tắt trong Cài đặt > Thông báo. Khi tắt hoặc đăng xuất, ứng dụng gỡ mã thiết bị khỏi tài khoản trên máy chủ.',
          ],
        },
        {
          heading: 'Ảnh và camera',
          body: [
            'Ứng dụng chỉ dùng camera hoặc thư viện ảnh khi bạn tự chọn ảnh người được ủy quyền đón trẻ. Ảnh được gửi tới máy chủ để giáo viên nhận diện người đón.',
          ],
        },
        {
          heading: 'Xác minh đăng nhập',
          body: [
            'Bước đăng nhập dùng Cloudflare Turnstile để chống truy cập tự động. Cloudflare có thể xử lý thông tin kỹ thuật của trình duyệt trong bước này.',
            'Mã xác thực (OTP) cho đăng nhập hai bước và đặt lại mật khẩu được gửi tới email liên kết với tài khoản.',
          ],
        },
        {
          heading: 'Những gì ứng dụng không làm',
          body: [
            'Ứng dụng không chứa quảng cáo, không dùng công cụ phân tích hay theo dõi hành vi và không bán dữ liệu.',
          ],
        },
        {
          heading: 'Quyền của bạn',
          body: [
            'Để xem, sửa hoặc yêu cầu xóa thông tin, hãy liên hệ giáo viên chủ nhiệm hoặc văn phòng nhà trường. Bạn có thể đăng xuất từng tài khoản hoặc đăng xuất tất cả thiết bị trong Cài đặt > Quản lý tài khoản.',
          ],
        },
      ],
    },
    en: {
      title: 'Privacy policy',
      sections: [
        {
          heading: 'Scope',
          body: [
            'Sorak Mobile is the app for teachers and parents of Hon Tre Preschool. This policy describes the data the app shows, keeps on your phone and sends to the school server.',
          ],
        },
        {
          heading: 'Data the app shows',
          body: [
            'Account details, child profiles, health records, attendance, timetables, pickup authorizations, learning results and notifications are managed by the school on the Sorak server.',
            'Teachers only see their assigned class. Each parent account only sees the one child linked to its student code.',
          ],
        },
        {
          heading: 'Data kept on your phone',
          body: [
            'Sign-in sessions are stored in the operating system’s secure storage, with a separate key for each account. The app never stores your password.',
            'Display names of added accounts, the selected account, theme, language and notification choices are kept on the device so the app remembers them.',
          ],
        },
        {
          heading: 'Push notifications',
          body: [
            'When you turn notifications on, the app sends the device’s notification token, platform and device name to the server so the school can reach the right account. Notifications are delivered through Expo and the operating system (Firebase Cloud Messaging or Apple Push Notification service).',
            'You can turn them off in Settings > Notifications. Turning them off or signing out removes the device token from that account on the server.',
          ],
        },
        {
          heading: 'Photos and camera',
          body: [
            'The app only uses the camera or photo library when you choose a photo of an authorized pickup person. The photo is sent to the server so teachers can recognize who is picking up the child.',
          ],
        },
        {
          heading: 'Sign-in verification',
          body: [
            'Sign-in uses Cloudflare Turnstile to block automated access. Cloudflare may process technical browser information during this step.',
            'One-time codes for two-step sign-in and password reset are sent to the email linked to the account.',
          ],
        },
        {
          heading: 'What the app does not do',
          body: [
            'The app has no ads, uses no analytics or behavior tracking, and does not sell data.',
          ],
        },
        {
          heading: 'Your choices',
          body: [
            'To view, correct or ask to delete information, contact the homeroom teacher or the school office. You can sign out of one account or all devices in Settings > Account management.',
          ],
        },
      ],
    },
  },
  terms: {
    vi: {
      title: 'Điều khoản sử dụng',
      sections: [
        {
          heading: 'Tài khoản',
          body: [
            'Tài khoản do nhà trường cấp cho giáo viên và phụ huynh. Không chia sẻ mật khẩu hoặc mã xác thực cho người khác. Nếu nghi ngờ tài khoản bị dùng trái phép, hãy đổi mật khẩu và đăng xuất tất cả thiết bị.',
            'Phụ huynh có nhiều con dùng một tài khoản riêng cho mỗi mã học sinh và chuyển giữa các tài khoản trong ứng dụng.',
          ],
        },
        {
          heading: 'Nội dung',
          body: [
            'Hồ sơ, điểm danh, đánh giá và thông báo do nhà trường cập nhật. Nếu thấy thông tin chưa đúng, hãy báo giáo viên chủ nhiệm thay vì tự suy đoán từ ứng dụng.',
            'Phản hồi phiếu tháng của phụ huynh được gửi tới giáo viên và lưu trong hồ sơ của trẻ.',
          ],
        },
        {
          heading: 'Ủy quyền đón trẻ',
          body: [
            'Phụ huynh chịu trách nhiệm về thông tin người được ủy quyền. Đơn được giáo viên duyệt chỉ cho biết người đó được phép đón trong thời hạn ghi trên đơn, không có nghĩa là trẻ đã được đón.',
          ],
        },
        {
          heading: 'Sử dụng hợp lệ',
          body: [
            'Không dùng ứng dụng để truy cập dữ liệu ngoài quyền được cấp, không can thiệp vào hệ thống và không sao chép thông tin của trẻ khác.',
          ],
        },
        {
          heading: 'Thay đổi',
          body: [
            'Nhà trường có thể cập nhật tính năng và điều khoản. Phiên bản mới sẽ hiển thị trong mục Giới thiệu của ứng dụng.',
          ],
        },
      ],
    },
    en: {
      title: 'Terms of use',
      sections: [
        {
          heading: 'Accounts',
          body: [
            'Accounts are issued by the school to teachers and parents. Do not share your password or verification codes. If you suspect misuse, change your password and sign out of all devices.',
            'Parents with more than one child use a separate account for each student code and switch between them in the app.',
          ],
        },
        {
          heading: 'Content',
          body: [
            'Profiles, attendance, assessments and notifications are updated by the school. If something looks wrong, tell the homeroom teacher instead of drawing conclusions from the app.',
            'A parent’s reply to a monthly report is sent to the teacher and kept in the child’s record.',
          ],
        },
        {
          heading: 'Pickup authorizations',
          body: [
            'Parents are responsible for the details of the authorized person. An approved request only means that person may pick up the child during the stated period; it does not mean the child has been picked up.',
          ],
        },
        {
          heading: 'Acceptable use',
          body: [
            'Do not use the app to reach data beyond your permissions, interfere with the system or copy other children’s information.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'The school may update features and these terms. New versions appear under About in the app.',
          ],
        },
      ],
    },
  },
  guide: {
    vi: {
      title: 'Tài liệu hướng dẫn Sorak',
      sections: [
        {
          heading: 'Giáo viên',
          body: [
            'Tổng quan lớp: xem danh sách trẻ của lớp được phân công, tìm theo tên hoặc mã và mở hồ sơ từng trẻ.',
            'Thời khóa biểu: chọn ngày để xem các khung sinh hoạt; ghi điểm danh, sức khỏe, đón trẻ và đánh giá hoạt động từ khung giờ trong ngày.',
            'Ủy quyền đón trẻ: duyệt hoặc từ chối đơn phụ huynh gửi, hoặc tạo đơn mới khi phụ huynh báo trực tiếp.',
            'Kết quả học tập: xem sổ bé ngoan và kết quả học kỳ. Việc đánh giá và tính kết quả thực hiện trên website Sorak.',
          ],
        },
        {
          heading: 'Phụ huynh',
          body: [
            'Hồ sơ trẻ: xem thông tin, sức khỏe và biểu đồ tăng trưởng của con.',
            'Thời khóa biểu: xem lịch sinh hoạt và nội dung từng hoạt động trong ngày.',
            'Kết quả học tập: xem phiếu tháng, gửi hoặc sửa phản hồi cho giáo viên và xem kết quả học kỳ đã công bố.',
            'Nhật ký hoạt động: mở bằng biểu tượng đồng hồ cạnh chuông để xem các mốc trong ngày của con.',
            'Ủy quyền đón trẻ: tạo đơn cho người đón thay, chờ giáo viên duyệt.',
            'Nhiều con: mỗi con một tài khoản. Thêm hoặc chuyển tài khoản từ ảnh đại diện ở đầu màn hình.',
          ],
        },
        {
          heading: 'Thông báo',
          body: [
            'Bấm chuông để xem hộp thông báo của tài khoản đang chọn. Bật hoặc tắt thông báo đẩy trong Cài đặt > Thông báo.',
          ],
        },
        {
          heading: 'Cần hỗ trợ',
          body: [
            'Phụ huynh quên mật khẩu hãy liên hệ giáo viên chủ nhiệm. Giáo viên có thể đặt lại mật khẩu bằng mã gửi qua email ở màn đăng nhập.',
          ],
        },
      ],
    },
    en: {
      title: 'Sorak user guide',
      sections: [
        {
          heading: 'Teachers',
          body: [
            'Class overview: see the children in your assigned class, search by name or code and open each profile.',
            'Timetable: pick a day to see the routine slots; record attendance, health, pickups and activity assessments from the day’s slots.',
            'Pickup authorizations: approve or decline parent requests, or create one when a parent tells you in person.',
            'Learning results: view good-behavior books and semester results. Assessing and calculating results is done on the Sorak website.',
          ],
        },
        {
          heading: 'Parents',
          body: [
            'Child profile: see your child’s details, health and growth charts.',
            'Timetable: see the daily routine and what each activity covers.',
            'Learning results: read monthly reports, send or edit your reply to the teacher and see published semester results.',
            'Activity journal: open it from the clock icon next to the bell to see your child’s day.',
            'Pickup authorizations: create a request for someone else to pick up your child and wait for the teacher to approve it.',
            'More than one child: each child has an account. Add or switch accounts from the avatar at the top of the screen.',
          ],
        },
        {
          heading: 'Notifications',
          body: [
            'Tap the bell to open the inbox for the selected account. Turn push notifications on or off in Settings > Notifications.',
          ],
        },
        {
          heading: 'Getting help',
          body: [
            'Parents who forget their password should contact the homeroom teacher. Teachers can reset theirs with an emailed code from the sign-in screen.',
          ],
        },
      ],
    },
  },
};
