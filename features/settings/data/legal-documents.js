// Nội dung Chính sách bảo mật, Điều khoản sử dụng và Hướng dẫn trong mục Giới thiệu, mô tả đúng
// những gì Sorak Mobile đang làm. Sửa nội dung tại đây, không viết lại trong screen.

export const LEGAL_UPDATED = '20/11/2026';

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
            'Ứng dụng chỉ dùng camera hoặc thư viện ảnh khi bạn tự chọn ảnh người được ủy quyền đón trẻ trong đơn ủy quyền. Ảnh được gửi tới máy chủ để giáo viên nhận diện người đón.',
          ],
        },
        {
          heading: 'Đăng nhập và kết nối',
          body: [
            'Bạn đăng nhập bằng mã tài khoản và mật khẩu do nhà trường cấp. Mọi kết nối giữa ứng dụng và máy chủ đều được mã hóa (HTTPS).',
            'Nếu tài khoản bật xác thực hai bước, mã OTP được gửi tới email liên kết với tài khoản. Mã đặt lại mật khẩu của giáo viên cũng được gửi qua email.',
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
            'The app only uses the camera or photo library when you choose a photo of the authorized person in a pickup request. The photo is sent to the server so teachers can recognize who is picking up the child.',
          ],
        },
        {
          heading: 'Sign-in and connection',
          body: [
            'You sign in with the account code and password issued by the school. All traffic between the app and the server is encrypted (HTTPS).',
            'If two-step sign-in is on, a one-time code is sent to the email linked to the account. Teachers’ password reset codes are also sent by email.',
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
            'Phụ huynh có nhiều con dùng một tài khoản riêng cho mỗi mã học sinh và chuyển giữa các tài khoản đã thêm trên cùng thiết bị.',
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
            'Parents with more than one child use a separate account for each student code and switch between the accounts added on the same device.',
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
            'Tổng quan lớp: xem danh sách trẻ của lớp được phân công, tìm theo tên hoặc mã và mở báo cáo từng trẻ (hồ sơ, sức khỏe, điểm danh, đánh giá hoạt động, ủy quyền). Trẻ đã chuyển lớp nằm trong mục riêng cuối danh sách.',
            'Thời khóa biểu: chọn ngày trên dải tuần hoặc lịch tháng để xem các khung sinh hoạt. Ngày nghỉ và ngày học bù được đánh dấu theo lịch năm học; ngày nghỉ không ghi nhận.',
            'Đánh giá hoạt động: mở một hoạt động trong ngày rồi chọn Đạt, Chưa đạt hoặc Vượt trội cho từng trẻ, kèm ghi chú khi cần.',
            'Ghi nhận trong ngày: thanh dưới Thời khóa biểu mở Điểm danh, Sức khỏe và Đón trẻ của ngày đang xem. Ghi nhận chỉ làm và cập nhật trong ngày.',
            'Đón trẻ: bấm vào trẻ rồi chọn người đón để ghi nhận ngay. Mục Yêu cầu ủy quyền trong màn này dùng để duyệt, từ chối hoặc tạo đơn ủy quyền.',
            'Kết quả học tập: xem Sổ bé ngoan và kết quả học kỳ. Việc đánh giá và tính kết quả thực hiện trên website Sorak.',
          ],
        },
        {
          heading: 'Phụ huynh',
          body: [
            'Hồ sơ trẻ: xem thông tin, sức khỏe với biểu đồ tăng trưởng, điểm danh và đánh giá hoạt động của con.',
            'Thời khóa biểu: xem lịch sinh hoạt và nội dung từng hoạt động. Phần Ngày của bé cho biết giờ đến lớp, số đo sức khỏe và việc đón về trong ngày.',
            'Ủy quyền đón trẻ: mở từ Ngày của bé, tạo đơn cho người đón thay (có thể kèm ảnh) và chờ giáo viên duyệt. Đơn được duyệt không có nghĩa là trẻ đã được đón.',
            'Nhật ký hoạt động: mở bằng biểu tượng đồng hồ cạnh chuông để xem các mốc trong ngày của con.',
            'Kết quả học tập: xem Sổ bé ngoan, gửi hoặc sửa phản hồi cho giáo viên và xem kết quả học kỳ đã công bố.',
            'Nhiều con: mỗi con một tài khoản. Bấm vào tên bé ở đầu màn hình để thêm hoặc chuyển tài khoản.',
          ],
        },
        {
          heading: 'Thông báo',
          body: [
            'Bấm chuông để xem hộp thông báo của tài khoản đang chọn; bấm vào từng thông báo để đọc đầy đủ. Bật hoặc tắt thông báo đẩy trong Cài đặt > Thông báo.',
          ],
        },
        {
          heading: 'Cài đặt',
          body: [
            'Đổi giao diện Sáng, Tối hoặc Tự động và ngôn ngữ Tiếng Việt hoặc English trong Cài đặt. Đổi mật khẩu, xác thực hai bước và đăng xuất các thiết bị nằm trong Quản lý tài khoản.',
          ],
        },
        {
          heading: 'Cần hỗ trợ',
          body: [
            'Phụ huynh quên mật khẩu hãy liên hệ giáo viên chủ nhiệm. Giáo viên có thể đặt lại mật khẩu bằng mã gửi qua email ở màn đăng nhập. Tài khoản Ban giám hiệu sử dụng Sorak trên website.',
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
            'Class overview: see the children in your assigned class, search by name or code and open each child’s report (profile, health, attendance, activity assessments, pickup authorizations). Transferred children are listed in a separate section at the end.',
            'Timetable: pick a day from the week strip or the month calendar to see the routine slots. Holidays and make-up days follow the school calendar; nothing is recorded on holidays.',
            'Activity assessment: open an activity of the day and mark each child Achieved, Not yet or Excellent, with a note when needed.',
            'Daily records: the bar under the timetable opens Attendance, Health and Pickup for the selected day. Records can only be made and changed on the same day.',
            'Pickup: tap a child and choose the pickup person to record it right away. Authorization requests in this screen let you approve, decline or create authorizations.',
            'Learning results: view good-behavior books and semester results. Assessing and calculating results is done on the Sorak website.',
          ],
        },
        {
          heading: 'Parents',
          body: [
            'Child profile: see your child’s details, health with growth charts, attendance and activity assessments.',
            'Timetable: see the daily routine and what each activity covers. Your child’s day shows arrival time, health measurements and pickup.',
            'Pickup authorizations: open them from your child’s day, create a request for someone else to pick up your child (a photo is optional) and wait for the teacher to approve it. An approved request does not mean the child has been picked up.',
            'Activity journal: open it from the clock icon next to the bell to see your child’s day.',
            'Learning results: read the good-behavior book, send or edit your reply to the teacher and see published semester results.',
            'More than one child: each child has an account. Tap the child’s name at the top of the screen to add or switch accounts.',
          ],
        },
        {
          heading: 'Notifications',
          body: [
            'Tap the bell to open the inbox for the selected account, and tap a notification to read it in full. Turn push notifications on or off in Settings > Notifications.',
          ],
        },
        {
          heading: 'Settings',
          body: [
            'Choose Light, Dark or Automatic appearance and Vietnamese or English in Settings. Password, two-step sign-in and signing out of devices are under Account management.',
          ],
        },
        {
          heading: 'Getting help',
          body: [
            'Parents who forget their password should contact the homeroom teacher. Teachers can reset theirs with an emailed code from the sign-in screen. School leadership accounts use Sorak on the website.',
          ],
        },
      ],
    },
  },
};
