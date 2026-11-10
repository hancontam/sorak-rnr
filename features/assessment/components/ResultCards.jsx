import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const DOMAINS = [
  ['physical', 'Thể chất'],
  ['cognitive', 'Nhận thức'],
  ['language', 'Ngôn ngữ'],
  ['socioEmotional', 'Tình cảm và kỹ năng xã hội'],
  ['aesthetic', 'Thẩm mỹ'],
];

function Metric({ label, value }) {
  return (
    <View className="flex-row justify-between gap-3 border-b border-border/60 pb-2">
      <Text className="min-w-0 flex-1 text-xs text-muted-foreground">{label}</Text>
      <Text className="shrink text-right text-xs font-medium">{value || 'Chưa có dữ liệu'}</Text>
    </View>
  );
}

function percent(rate, count, total) {
  if (!Number.isFinite(rate) || !(total > 0)) return '';
  return Number.isInteger(count) ? `${rate}% · ${count}/${total}` : `${rate}%`;
}

function Notes({ label, value, fallback }) {
  return (
    <View className="gap-1">
      <Text className="text-xs font-medium">{label}</Text>
      <Text className="text-xs leading-5 text-muted-foreground">{value || fallback}</Text>
    </View>
  );
}

export function MonthlyResultCard({ title, code, record, week, maxRoses, parent }) {
  const stats = week && record?.weeklyStats?.[`week${week}`];
  const rose = week
    ? parent
      ? record?.id
        ? record.weeks?.[`week${week}`]
        : null
      : record?.[`week${week}Rose`]
    : null;
  const roseLabel = rose === true ? 'Được tặng hoa' : rose === false ? 'Chưa được tặng hoa' : null;
  return (
    <Card className="gap-3 p-4 shadow-none">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-semibold">{title}</Text>
          {code ? <Text className="text-xs text-muted-foreground">{code}</Text> : null}
        </View>
        {(week ? roseLabel : record?.isLotus === true) ? (
          <Badge variant="secondary">
            <Text className="text-[11px]">{week ? roseLabel : 'Hoa sen'}</Text>
          </Badge>
        ) : null}
      </View>
      {week ? (
        <>
          <Metric
            label="Chuyên cần"
            value={percent(stats?.attendanceRate, stats?.attendancePresent, stats?.attendanceTotal)}
          />
          <Metric
            label="Mục tiêu"
            value={percent(stats?.goalsRate, stats?.goalsAchieved, stats?.goalsTotal)}
          />
          <Metric label="Sức khỏe" value={stats?.healthStatus} />
        </>
      ) : (
        <>
          <Metric
            label="Hoa hồng"
            value={
              Number.isInteger(record?.rosesCount) && maxRoses > 0
                ? `${record.rosesCount}/${maxRoses}`
                : ''
            }
          />
          <Notes
            label="Nhận xét của giáo viên"
            value={record?.teacherNotes}
            fallback="Chưa có nhận xét."
          />
          {!parent ? (
            <Notes
              label="Phản hồi của phụ huynh"
              value={record?.parentFeedback}
              fallback="Chưa có phản hồi."
            />
          ) : null}
        </>
      )}
    </Card>
  );
}

export function SemesterResultCard({ title, code, record, parent }) {
  const domains = parent
    ? Array.isArray(record.domains)
      ? record.domains.map(({ name, rating, score }) => [
          name,
          [rating, Number.isFinite(score) ? `${score}%` : null].filter(Boolean).join(' · '),
        ])
      : []
    : DOMAINS.map(([key, label]) => {
        const data = record.domainBreakdown?.[key];
        return [label, percent(data?.rate, data?.achieved, data?.total)];
      });
  return (
    <Card className="gap-3 p-4 shadow-none">
      <View className="gap-1">
        <Text className="text-sm font-semibold">{title}</Text>
        {code ? <Text className="text-xs text-muted-foreground">{code}</Text> : null}
      </View>
      {!parent ? (
        <Metric
          label="Chuyên cần"
          value={percent(
            record.attendance?.rate,
            record.attendance?.presentDays,
            record.attendance?.totalDays
          )}
        />
      ) : null}
      {domains
        .filter(([label]) => label)
        .map(([label, value], index) => (
          <Metric key={`${label}:${index}`} label={label} value={value} />
        ))}
      <Notes
        label="Nhận xét của giáo viên"
        value={record.teacherNotes}
        fallback="Chưa có nhận xét."
      />
    </Card>
  );
}
