import { useColorScheme } from 'nativewind';
import { Image, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { DataTable, TableStudent, TableValue } from '@/components/shared/DataTable';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { useTranslation } from '@/shared/i18n/useLanguage';

const ROSE = require('@/assets/images/rose.webp');
const LOTUS = require('@/assets/images/lotus.webp');

const DOMAINS = [
  ['physical', 'Thể chất'],
  ['cognitive', 'Nhận thức'],
  ['language', 'Ngôn ngữ'],
  ['socioEmotional', 'TC-KNXH'],
  ['aesthetic', 'Thẩm mỹ'],
];

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

// Tỉ lệ đạt: từ 80% tô xanh primary, 0% hoặc chưa có thì xám (theo màu design system, không xanh lá).
function rateTone(rate) {
  if (!isNumber(rate) || rate === 0) return 'muted';
  return rate >= 80 ? 'primary' : undefined;
}

// Đánh giá thể trạng: đạt chuẩn xanh, các mức cần chú ý (thấp còi, gầy còm, thừa cân…) đỏ.
function healthTone(status) {
  if (!status) return 'muted';
  if (/đạt chuẩn|bình thường/i.test(status)) return 'primary';
  if (/thấp còi|suy dinh dưỡng|gầy còm|nhẹ cân|thừa cân|béo phì/i.test(status)) return 'danger';
  return undefined;
}

function Measure({ value, unit, status, date, t }) {
  if (!isNumber(value)) return <TableValue value={t('Chưa đo')} tone="muted" />;
  return (
    <View className="items-center">
      <Text numberOfLines={1} className="font-mono text-xs font-semibold">
        {value} {unit}
      </Text>
      <Text
        numberOfLines={1}
        className={
          healthTone(status) === 'danger'
            ? 'text-2xs text-destructive'
            : healthTone(status) === 'primary'
              ? 'text-2xs text-primary'
              : 'text-2xs text-muted-foreground'
        }>
        {status ? t(status) : t('Chưa đánh giá')}
      </Text>
      {date ? (
        <Text numberOfLines={1} className="font-mono text-2xs text-muted-foreground">
          {date}
        </Text>
      ) : null}
    </View>
  );
}

// Hoa đã đạt hiện ảnh màu; chưa đạt hiện cùng hình dạng bóng mờ xám (như ảnh "chưa mở khóa").
function Flower({ source, earned, size, label }) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <Image
      source={source}
      accessibilityLabel={label}
      resizeMode="contain"
      style={[
        { width: size, height: size },
        earned ? null : { tintColor: theme.mutedForeground, opacity: 0.3 },
      ]}
    />
  );
}

const None = ({ t }) => <TableValue value={t('Không có')} tone="muted" />;

function Notes({ text, t }) {
  return (
    <Text
      numberOfLines={2}
      className={text ? 'text-2xs leading-4' : 'text-2xs italic text-muted-foreground'}>
      {text || t('Không có')}
    </Text>
  );
}

function useLead(avatarOf) {
  const t = useTranslation();
  return {
    title: t('Học sinh'),
    width: 172,
    render: (row) => (
      <TableStudent
        avatar={
          <AccountAvatar
            user={{ fullName: row.name, avatarUrl: avatarOf(row.id, row.code, row.name) }}
            className="size-7"
          />
        }
        name={row.name}
        code={row.code}
      />
    ),
  };
}

// Sổ bé ngoan một tuần (giáo viên): chuyên cần, mục tiêu, chiều cao, cân nặng, hoa hồng như web.
export function MonthlyWeekTable({ rows, week, avatarOf }) {
  const t = useTranslation();
  const lead = useLead(avatarOf);
  const stats = (row) => row.weeklyStats?.[`week${week}`] || {};
  const columns = [
    {
      key: 'attendance',
      title: t('Chuyên cần'),
      width: 84,
      render: (row) => {
        const s = stats(row);
        return isNumber(s.attendanceRate) ? (
          <TableValue
            value={`${s.attendanceRate}%`}
            sub={t('{present}/{total} buổi', { present: s.attendancePresent, total: s.attendanceTotal })}
            tone={rateTone(s.attendanceRate)}
          />
        ) : (
          <TableValue value={t('Chưa có')} tone="muted" />
        );
      },
    },
    {
      key: 'goals',
      title: t('Mục tiêu'),
      width: 84,
      render: (row) => {
        const s = stats(row);
        return isNumber(s.goalsRate) ? (
          <TableValue
            value={`${s.goalsRate}%`}
            sub={t('{achieved}/{total} mục tiêu', { achieved: s.goalsAchieved, total: s.goalsTotal })}
            tone={rateTone(s.goalsRate)}
          />
        ) : (
          <TableValue value={t('Chưa có')} tone="muted" />
        );
      },
    },
    {
      key: 'height',
      title: t('Chiều cao'),
      width: 132,
      render: (row) => {
        const s = stats(row);
        return (
          <Measure value={s.height} unit="cm" status={s.heightStatus} date={s.examDateVN} t={t} />
        );
      },
    },
    {
      key: 'weight',
      title: t('Cân nặng'),
      width: 132,
      render: (row) => {
        const s = stats(row);
        return (
          <Measure value={s.weight} unit="kg" status={s.weightStatus} date={s.examDateVN} t={t} />
        );
      },
    },
    {
      key: 'rose',
      title: t('Hoa hồng'),
      width: 72,
      render: (row) => (
        <Flower
          source={ROSE}
          earned={Boolean(row[`week${week}Rose`])}
          size={20}
          label={t(row[`week${week}Rose`] ? 'Được tặng hoa' : 'Chưa có')}
        />
      ),
    },
  ];
  return <DataTable lead={lead} columns={columns} rows={rows} keyOf={(row) => String(row.id)} />;
}

// Tổng kết tháng (giáo viên): số hoa hồng, hoa sen, nhận xét giáo viên, phản hồi phụ huynh.
export function MonthlySummaryTable({ rows, maxRoses, avatarOf }) {
  const t = useTranslation();
  const lead = useLead(avatarOf);
  const columns = [
    {
      key: 'roses',
      title: t('Hoa hồng'),
      width: 84,
      render: (row) =>
        isNumber(row.rosesCount) ? (
          <View className="flex-row items-center gap-1">
            <Flower source={ROSE} earned={row.rosesCount > 0} size={16} />
            <Text className="font-mono text-xs font-semibold">
              {`${row.rosesCount}/${maxRoses}`}
            </Text>
          </View>
        ) : (
          <None t={t} />
        ),
    },
    {
      key: 'lotus',
      title: t('Hoa sen'),
      width: 64,
      render: (row) => (
        <Flower
          source={LOTUS}
          earned={row.isLotus === true}
          size={24}
          label={t(row.isLotus ? 'Bông Sen Cháu ngoan Bác Hồ' : 'Đang rèn luyện')}
        />
      ),
    },
    {
      key: 'notes',
      title: t('Nhận xét của giáo viên'),
      width: 200,
      align: 'left',
      render: (row) => <Notes text={row.teacherNotes} t={t} />,
    },
    {
      key: 'feedback',
      title: t('Phản hồi phụ huynh'),
      width: 200,
      align: 'left',
      render: (row) => <Notes text={row.parentFeedback} t={t} />,
    },
  ];
  return <DataTable lead={lead} columns={columns} rows={rows} keyOf={(row) => String(row.id)} />;
}

// Kết quả học kỳ (giáo viên): 5 lĩnh vực, đi học đủ, chiều cao, cân nặng, nhận xét như web.
export function SemesterTable({ rows, avatarOf }) {
  const t = useTranslation();
  const lead = useLead(avatarOf);
  const goals = t('Mục tiêu 5 lĩnh vực');
  const health = t('Sức khỏe');
  const columns = [
    ...DOMAINS.map(([key, label]) => ({
      key,
      group: goals,
      title: t(label),
      width: 72,
      render: (row) => {
        const d = row.domainBreakdown?.[key];
        return isNumber(d?.rate) ? (
          <TableValue value={`${d.rate}%`} sub={`${d.achieved}/${d.total}`} tone={rateTone(d.rate)} />
        ) : (
          <None t={t} />
        );
      },
    })),
    {
      key: 'attendance',
      title: t('Đi học đủ'),
      width: 80,
      render: (row) =>
        isNumber(row.attendance?.rate) ? (
          <TableValue
            value={`${row.attendance.rate}%`}
            sub={t('{present}/{total} ngày', {
              present: row.attendance.presentDays,
              total: row.attendance.totalDays,
            })}
            tone={rateTone(row.attendance.rate)}
          />
        ) : (
          <None t={t} />
        ),
    },
    {
      key: 'height',
      group: health,
      title: t('Chiều cao'),
      width: 132,
      render: (row) => (
        <Measure
          value={row.health?.height}
          unit="cm"
          status={row.health?.heightStatus}
          date={row.health?.examDate}
          t={t}
        />
      ),
    },
    {
      key: 'weight',
      group: health,
      title: t('Cân nặng'),
      width: 132,
      render: (row) => (
        <Measure
          value={row.health?.weight}
          unit="kg"
          status={row.health?.weightStatus}
          date={row.health?.examDate}
          t={t}
        />
      ),
    },
    {
      key: 'notes',
      title: t('Nhận xét của giáo viên'),
      width: 200,
      align: 'left',
      render: (row) => <Notes text={row.teacherNotes} t={t} />,
    },
  ];
  return <DataTable lead={lead} columns={columns} rows={rows} keyOf={(row) => String(row.id)} />;
}
