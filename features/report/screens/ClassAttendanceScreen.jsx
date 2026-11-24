import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { ChipTabs } from '@/components/shared/ChipTabs';
import { DataTable, TableStudent, TableValue } from '@/components/shared/DataTable';
import { SelectField } from '@/components/shared/SelectField';
import { usePullToRefresh } from '@/components/shared/usePullToRefresh';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { monthKey, monthLabel, schoolMonths } from '@/features/assessment/utils/school-periods';
import { schoolToday } from '@/features/daily/utils/schedule-date';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { attendanceMetrics } from '../components/ClassAttendanceRibbon';
import { ReportState } from '../components/ReportState';
import { useClassAttendance } from '../hooks/useClassAttendance';
import { currentSchoolMonth } from '../utils/attendance-period';
import { reportError } from '../utils/report-format';

const PERIODS = [
  ['month', 'Theo tháng'],
  ['semester-1', 'Học kỳ 1'],
  ['semester-2', 'Học kỳ 2'],
  ['year', 'Cả năm'],
];

// Chi tiết chuyên cần cả lớp như hộp thoại "Thống kê chuyên cần & điểm danh" của web: bốn số tổng,
// bảng theo học sinh và theo ngày học cho tháng, học kỳ hoặc cả năm.
export default function ClassAttendanceScreen() {
  const t = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const now = currentSchoolMonth();
  const [period, setPeriod] = useState({ type: 'month', ...now });
  const [view, setView] = useState('students');
  const { assignment, query } = useClassAttendance(period);
  const pull = usePullToRefresh(query.refetch);
  if (assignment.error || !assignment.classId)
    return (
      <View className="flex-1 bg-background p-4">
        <ReportState error={assignment.error} title="Chưa được phân công lớp" />
      </View>
    );
  const data = query.data;
  const students = data?.studentsSummary || [];
  const days = data?.dailyTrend || [];
  const periodKey = period.type === 'semester' ? `semester-${period.semester}` : period.type;
  const selectPeriod = (key) =>
    setPeriod(
      key === 'month'
        ? { type: 'month', ...now }
        : key === 'year'
          ? { type: 'year' }
          : { type: 'semester', semester: key === 'semester-1' ? 1 : 2 }
    );
  const months = schoolMonths(data?.classInfo?.schoolYear, now, schoolToday());
  const rate = (value) => (typeof value === 'number' ? `${value}%` : '—');

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView
        contentContainerClassName="mx-auto w-full max-w-xl gap-4 p-4 pb-8"
        refreshControl={<RefreshControl refreshing={pull.refreshing} onRefresh={pull.onRefresh} />}>
        <View className="gap-0.5">
          <Text className="text-lg font-semibold tracking-tight">
            {t('Chuyên cần lớp')}
            {data?.classInfo?.name ? ` · ${data.classInfo.name}` : ''}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {t('Tỷ lệ đi học của học sinh trong lớp')}
          </Text>
        </View>
        <ChipTabs
          options={PERIODS.map(([value, label]) => ({ value, label: t(label) }))}
          value={periodKey}
          onChange={selectPeriod}
        />
        {period.type === 'month' ? (
          // Cùng ô chọn tháng của Sổ bé ngoan: tháng 9 → tháng 5 kèm trạng thái; tháng chưa tới khóa.
          <SelectField
            label={t('Chọn tháng')}
            placeholder={t('Chọn tháng')}
            icon={CalendarDays}
            value={monthKey(period)}
            options={months.map((month) => ({
              value: month.key,
              label: monthLabel(month, locale),
              description: t(month.status),
              disabled: month.key > monthKey(now),
            }))}
            onChange={(key) => {
              const month = months.find((item) => item.key === key);
              if (month) setPeriod({ type: 'month', month: month.month, year: month.year });
            }}
          />
        ) : null}
        {query.isError ? (
          <ReportState error={reportError(query.error)} onRetry={query.refetch} />
        ) : query.isPending ? (
          <ReportState loading skeleton="cards" />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-2">
              {attendanceMetrics(data.stats, t).map((metric) => (
                <Card key={metric.key} className="min-w-[46%] flex-1 gap-1 px-3 py-2.5">
                  <Text className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                    {metric.label}
                  </Text>
                  <Text className="font-mono text-xl font-semibold">
                    {metric.value}
                    {metric.total ? (
                      <Text className="font-mono text-xs font-normal text-muted-foreground">
                        {metric.total}
                      </Text>
                    ) : null}
                  </Text>
                </Card>
              ))}
            </View>
            <Tabs value={view} onValueChange={setView}>
              <TabsList className="w-full">
                <TabsTrigger value="students" className="flex-1">
                  <Text>{t('Học sinh ({count})', { count: students.length })}</Text>
                </TabsTrigger>
                <TabsTrigger value="days" className="flex-1">
                  <Text>{t('Theo ngày học ({count})', { count: days.length })}</Text>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {view === 'students' ? (
              students.length ? (
                <DataTable
                  lead={{
                    title: t('Học sinh'),
                    width: 168,
                    render: (row) => (
                      <TableStudent
                        avatar={<AccountAvatar user={row} className="size-7" />}
                        name={row.fullName || t('Học sinh')}
                        code={row.studentCode}
                      />
                    ),
                  }}
                  columns={[
                    {
                      key: 'present',
                      title: t('Có mặt'),
                      width: 64,
                      render: (row) => <TableValue value={row.presentCount ?? '—'} />,
                    },
                    {
                      key: 'excused',
                      title: t('Nghỉ phép'),
                      width: 70,
                      render: (row) => <TableValue value={row.excusedCount ?? '—'} />,
                    },
                    {
                      key: 'unexcused',
                      title: t('Không phép'),
                      width: 74,
                      render: (row) => (
                        <TableValue
                          value={row.unexcusedCount ?? '—'}
                          tone={row.unexcusedCount > 0 ? 'danger' : undefined}
                        />
                      ),
                    },
                    {
                      key: 'rate',
                      title: t('Tỷ lệ'),
                      width: 64,
                      render: (row) => (
                        <TableValue
                          value={rate(row.presentRate)}
                          tone={row.presentRate === 100 ? 'primary' : undefined}
                        />
                      ),
                    },
                  ]}
                  rows={students}
                  keyOf={(row) => String(row.id)}
                  rowHeight={56}
                  onRowPress={(row) =>
                    router.push({
                      pathname: '/(teacher)/student/[studentId]',
                      // `id` ở thống kê là mã nội bộ; báo cáo học sinh nhận publicId như danh sách lớp.
                      params: { studentId: String(row.publicId || row.id) },
                    })
                  }
                />
              ) : (
                <ReportState title="Chưa có dữ liệu điểm danh trong kỳ này" />
              )
            ) : days.length ? (
              <DataTable
                lead={{
                  title: t('Ngày học'),
                  width: 118,
                  render: (row) => (
                    <TableValue
                      align="left"
                      value={row.dateFormatted || row.date}
                      sub={row.dayOfWeek ? t(row.dayOfWeek) : ''}
                    />
                  ),
                }}
                columns={[
                  {
                    key: 'present',
                    title: t('Có mặt'),
                    width: 70,
                    render: (row) => (
                      <TableValue
                        value={row.presentCount ?? '—'}
                        sub={
                          Number.isInteger(row.totalRecorded)
                            ? t('/{count} đã ghi', { count: row.totalRecorded })
                            : ''
                        }
                      />
                    ),
                  },
                  {
                    key: 'excused',
                    title: t('Nghỉ phép'),
                    width: 70,
                    render: (row) => <TableValue value={row.excusedCount ?? '—'} />,
                  },
                  {
                    key: 'unexcused',
                    title: t('Không phép'),
                    width: 74,
                    render: (row) => (
                      <TableValue
                        value={row.unexcusedCount ?? '—'}
                        tone={row.unexcusedCount > 0 ? 'danger' : undefined}
                      />
                    ),
                  },
                  {
                    key: 'rate',
                    title: t('Tỷ lệ'),
                    width: 64,
                    render: (row) => <TableValue value={rate(row.presentRate)} />,
                  },
                ]}
                rows={[...days].reverse()}
                keyOf={(row) => row.date}
                rowHeight={50}
              />
            ) : (
              <ReportState title="Chưa có dữ liệu điểm danh trong kỳ này" />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
