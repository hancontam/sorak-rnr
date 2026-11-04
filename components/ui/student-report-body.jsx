import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StudentAvatar } from '@/components/ui/student-avatar';
import { Text } from '@/components/ui/text';
import { WhoGrowthCharts } from '@/components/ui/who-growth-chart';
import { formatDate, formatGender } from '@/features/report/lib/report-format';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

const TABS = [
  ['profile', 'Hồ sơ lý lịch'],
  ['health', 'Theo dõi Sức khỏe'],
  ['attendance', 'Lịch sử Điểm danh'],
  ['assessment', 'Đánh giá Hoạt động'],
  ['authorization', 'Ủy quyền đưa đón'],
];

function SectionTitle({ children, detail }) {
  return (
    <View className="mb-3 gap-1">
      <Text className="text-[15px] font-semibold">{children}</Text>
      {detail ? <Text className="text-xs text-muted-foreground">{detail}</Text> : null}
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View className="min-h-12 flex-row items-center gap-3 border-b border-border/50 py-2 last:border-b-0">
      <Text className="w-[39%] text-[13px] text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-[13px] font-medium">{value || 'Chưa có'}</Text>
    </View>
  );
}

function ProfileTab({ student }) {
  const parents = student?.parents || [];
  return (
    <View className="gap-5">
      <View>
        <SectionTitle>Thông tin cá nhân</SectionTitle>
        <Card className="gap-0 p-4 shadow-none">
          <InfoRow label="Mã học sinh" value={student?.studentCode} />
          <InfoRow label="Họ và tên" value={student?.fullName} />
          <InfoRow label="Ngày sinh" value={formatDate(student?.dateOfBirth)} />
          <InfoRow label="Giới tính" value={formatGender(student?.gender)} />
          <InfoRow label="Dân tộc" value={student?.ethnic} />
        </Card>
      </View>
      <View>
        <SectionTitle>Phụ huynh & Người giám hộ</SectionTitle>
        <Card className="gap-3 p-4 shadow-none">
          {parents.length ? (
            parents.map((parent) => (
              <View key={parent.id} className="gap-1">
                <Text className="text-sm font-semibold">
                  {parent.relationship || 'Người giám hộ'} · {parent.fullName}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {parent.phone || 'Chưa có số điện thoại'}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-muted-foreground">Chưa có thông tin người giám hộ.</Text>
          )}
        </Card>
      </View>
      <View>
        <SectionTitle>Lớp học</SectionTitle>
        <Card className="gap-0 p-4 shadow-none">
          <InfoRow label="Lớp đang học" value={student?.currentClass?.className} />
          <InfoRow label="Năm học" value={student?.currentClass?.schoolYearName} />
          <InfoRow label="Ngày vào lớp" value={formatDate(student?.currentClass?.enrolledAt)} />
        </Card>
      </View>
      <View>
        <SectionTitle>Sức khỏe & Ghi chú</SectionTitle>
        <Card className="gap-2 p-4 shadow-none">
          <Text className="text-xs text-muted-foreground">
            Dị ứng: {student?.allergyNotes || 'Không ghi nhận'}
          </Text>
          <Text className="text-xs text-muted-foreground">
            Tiền sử bệnh lý: {student?.medicalNotes || 'Không ghi nhận'}
          </Text>
        </Card>
      </View>
    </View>
  );
}

function HealthTab({ student, health }) {
  const history = health?.history || [];
  const latest = health?.latest;
  return (
    <View className="gap-5">
      <View>
        <SectionTitle
          detail={`${health?.totalChecks || history.length} đợt đo${latest ? ` · gần nhất ${latest.dateFormatted || formatDate(latest.date)}` : ''}`}>
          Theo dõi sức khỏe
        </SectionTitle>
        {latest ? (
          <Card className="gap-2 p-4 shadow-none">
            <View className="flex-row gap-8">
              <Text className="text-xl font-semibold">{latest.height} cm</Text>
              <Text className="text-xl font-semibold">{latest.weight} kg</Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {latest.classification || 'Chưa có phân loại'}
            </Text>
          </Card>
        ) : null}
      </View>
      <View>
        <SectionTitle>Lịch sử đo</SectionTitle>
        <View className="gap-2">
          {history.length ? (
            history.map((record) => (
              <Card key={record.id} className="gap-2 p-4 shadow-none">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold">
                    {record.dateFormatted || formatDate(record.date)}
                  </Text>
                  <Text className="text-sm">
                    {record.height} cm · {record.weight} kg
                  </Text>
                </View>
                {record.classification ? (
                  <Text className="text-xs text-muted-foreground">{record.classification}</Text>
                ) : null}
              </Card>
            ))
          ) : (
            <Card className="p-4 shadow-none">
              <Text className="text-sm text-muted-foreground">Chưa có dữ liệu đo sức khỏe.</Text>
            </Card>
          )}
        </View>
      </View>
      <WhoGrowthCharts student={student} history={history} />
    </View>
  );
}

function AttendanceTab({ attendance }) {
  const history = attendance?.history || [];
  const statusLabels = {
    PRESENT: 'Có mặt',
    ABSENT_EXCUSED: 'Vắng có phép',
    ABSENT_UNEXCUSED: 'Vắng không phép',
    EXCUSED: 'Vắng có phép',
    UNEXCUSED: 'Vắng không phép',
  };
  return (
    <View>
      <SectionTitle
        detail={`${attendance?.presentCount || 0}/${attendance?.totalDays || 0} ngày có mặt`}>
        Lịch sử điểm danh
      </SectionTitle>
      <View className="gap-2">
        {history.length ? (
          history.map((record) => (
            <Card key={record.id} className="gap-2 p-4 shadow-none">
              <Text className="text-sm font-semibold">
                {record.dayName ? `${record.dayName} · ` : ''}
                {record.dateFormatted || formatDate(record.date)}
              </Text>
              <Text className="text-[13px] font-medium text-brand-link">
                {statusLabels[record.status] || record.status || 'Chưa rõ'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Giờ đón: {record.checkInTime || 'Chưa ghi nhận'} · Giờ về:{' '}
                {record.checkOutTime || 'Chưa ghi nhận'}
              </Text>
              {record.pickupPerson ? (
                <Text className="text-xs text-muted-foreground">
                  Người đón: {record.pickupPerson}
                  {record.pickupRelationship ? ` (${record.pickupRelationship})` : ''}
                </Text>
              ) : null}
            </Card>
          ))
        ) : (
          <Card className="p-4 shadow-none">
            <Text className="text-sm text-muted-foreground">Chưa có lịch sử điểm danh.</Text>
          </Card>
        )}
      </View>
    </View>
  );
}

function AssessmentTab({ assessments }) {
  const history = assessments?.history || [];
  const statusLabels = {
    ACHIEVED: 'Đạt yêu cầu',
    OUTSTANDING: 'Vượt trội',
    NOT_ACHIEVED: 'Chưa đạt',
    PENDING: 'Chưa đánh giá',
  };
  return (
    <View>
      <SectionTitle
        detail={`${assessments?.totalAssessed || 0} tiết · ${assessments?.achievedCount || 0} đạt yêu cầu · ${assessments?.outstandingCount || 0} vượt trội`}>
        Đánh giá hoạt động
      </SectionTitle>
      <View className="gap-2">
        {history.length ? (
          history.map((record) => (
            <Card key={record.id} className="gap-2 p-4 shadow-none">
              <Text className="text-xs text-muted-foreground">
                {record.dateFormatted || formatDate(record.date)} ·{' '}
                {record.routineSlotLabel || record.routineSlot || 'Hoạt động'}
              </Text>
              <Text className="text-sm font-semibold">
                {record.objective || record.activityTitle || 'Hoạt động học tập'}
              </Text>
              <View className="flex-row items-center justify-between gap-3">
                <Text className="flex-1 text-xs text-muted-foreground">
                  GV: {record.evaluatorName || 'Chưa có'}
                </Text>
                <Text className="text-xs font-medium text-brand-link">
                  {statusLabels[record.status] || record.status || 'Chưa có'}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card className="p-4 shadow-none">
            <Text className="text-sm text-muted-foreground">Chưa có đánh giá hoạt động.</Text>
          </Card>
        )}
      </View>
    </View>
  );
}

function AuthorizationTab({ authorizations, semesterInfo }) {
  const history = authorizations?.history || [];
  return (
    <View>
      <SectionTitle>Ủy quyền đưa đón</SectionTitle>
      <View className="gap-3">
        <Card className="gap-2 p-4 shadow-none">
          <Text className="text-sm font-semibold">
            {authorizations?.total || 0} đơn · {authorizations?.approvedCount || 0} đã duyệt
          </Text>
          <Text className="text-xs text-muted-foreground">
            {semesterInfo?.activeDateRangeLabel || 'Học kỳ hiện tại'}
          </Text>
        </Card>
        {history.length ? (
          history.map((record, index) => (
            <Card key={record.id || index} className="gap-2 p-4 shadow-none">
              <Text className="text-sm font-semibold">
                {record.authorizedPersonName || record.pickupPersonName || 'Người được ủy quyền'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {formatDate(record.createdAt || record.startDate)} · {record.status || 'Đang xử lý'}
              </Text>
            </Card>
          ))
        ) : (
          <Card className="gap-2 p-4 shadow-none">
            <Text className="text-sm font-semibold">Chưa có ủy quyền đưa đón</Text>
            <Text className="text-xs text-muted-foreground">
              Học sinh chưa có yêu cầu ủy quyền đưa đón trong học kỳ này.
            </Text>
          </Card>
        )}
      </View>
    </View>
  );
}

export function StudentReportBody({ student, report, bottomInset = 40 }) {
  const [tab, setTab] = useState('profile');
  const tabScroll = useRef(null);
  const className = student?.currentClass?.className || report?.classInfo?.name;
  const status = student?.status === 'STUDYING' ? 'Đang học' : student?.status || 'Đang học';

  return (
    <View className="flex-1">
      <View className="mx-6 my-4 flex-row items-center gap-3">
        <StudentAvatar student={student} />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-semibold" numberOfLines={1}>
            {student?.fullName || 'Học sinh'}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {student?.studentCode} · {className || 'Chưa có lớp'}
          </Text>
        </View>
        <Badge className="rounded-md px-2 py-0.5">
          <Text className="text-xs">{status}</Text>
        </Badge>
      </View>
      <ScrollView
        horizontal
        ref={tabScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        className="max-h-12 min-h-12">
        {TABS.map(([value, label], index) => (
          <Pressable
            key={value}
            onPress={() => {
              setTab(value);
              tabScroll.current?.scrollTo({ x: Math.max(0, index * 128 - 60), animated: true });
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
            className={`h-10 items-center justify-center rounded-md bg-background px-3 ${tab === value ? 'border border-border shadow-sm shadow-black/5' : ''}`}>
            <Text
              className={`text-[13px] font-medium ${tab === value ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: bottomInset,
        }}>
        {tab === 'profile' ? <ProfileTab student={student} /> : null}
        {tab === 'health' ? <HealthTab student={student} health={report?.health} /> : null}
        {tab === 'attendance' ? <AttendanceTab attendance={report?.attendance} /> : null}
        {tab === 'assessment' ? <AssessmentTab assessments={report?.assessments} /> : null}
        {tab === 'authorization' ? (
          <AuthorizationTab
            authorizations={report?.authorizations}
            semesterInfo={report?.semesterInfo}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
