import { View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

const DOMAINS = [
  ['physical', 'Thể chất'],
  ['cognitive', 'Nhận thức'],
  ['language', 'Ngôn ngữ'],
  ['socioEmotional', 'Tình cảm và kỹ năng xã hội'],
  ['aesthetic', 'Thẩm mỹ'],
];

function Header({ title, code, avatarUrl, badge }) {
  return (
    <View className="flex-row items-center gap-3 px-4 pb-3 pt-3.5">
      <AccountAvatar user={{ fullName: title, avatarUrl }} className="size-9" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-semibold">
          {title}
        </Text>
        {code ? <Text className="font-mono text-2xs text-muted-foreground">{code}</Text> : null}
      </View>
      {badge ? (
        <Badge variant="secondary">
          <Text>{badge}</Text>
        </Badge>
      ) : null}
    </View>
  );
}

// Một dòng chỉ số: nhãn bên trái, giá trị mono bên phải; thiếu dữ liệu thì ghi rõ.
function Metric({ label, value, mono = true }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-center justify-between gap-3 border-t border-border px-4 py-2.5">
      <Text className="min-w-0 flex-1 text-xs text-muted-foreground">{t(label)}</Text>
      <Text
        className={cn(
          'shrink text-right text-xs font-medium',
          value ? mono && 'font-mono' : 'text-muted-foreground'
        )}>
        {value || t('Chưa có dữ liệu')}
      </Text>
    </View>
  );
}

function percent(rate, count, total) {
  if (!Number.isFinite(rate) || !(total > 0)) return '';
  return Number.isInteger(count) ? `${rate}% · ${count}/${total}` : `${rate}%`;
}

function Notes({ label, value, fallback }) {
  const t = useTranslation();
  return (
    <View className="gap-1 border-t border-border px-4 py-3">
      <Text className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t(label)}
      </Text>
      <Text className={cn('text-xs leading-5', !value && 'text-muted-foreground')}>
        {value || t(fallback)}
      </Text>
    </View>
  );
}

export function MonthlyResultCard({ title, code, avatarUrl, record, week, maxRoses, parent }) {
  const t = useTranslation();
  const stats = week && record?.weeklyStats?.[`week${week}`];
  const rose = week
    ? parent
      ? record?.id
        ? record.weeks?.[`week${week}`]
        : null
      : record?.[`week${week}Rose`]
    : null;
  const roseLabel = rose === true ? 'Được tặng hoa' : rose === false ? 'Chưa được tặng hoa' : null;
  const badge = week ? roseLabel && t(roseLabel) : record?.isLotus === true ? t('Hoa sen') : null;
  return (
    <Card className="gap-0 py-0">
      <Header title={title} code={code} avatarUrl={avatarUrl} badge={badge} />
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
          <Metric
            label="Sức khỏe"
            value={stats?.healthStatus ? t(stats.healthStatus) : ''}
            mono={false}
          />
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

export function SemesterResultCard({ title, code, avatarUrl, record, parent }) {
  const t = useTranslation();
  const domains = parent
    ? Array.isArray(record.domains)
      ? record.domains.map(({ name, rating, score }) => [
          name,
          [rating ? t(rating) : null, Number.isFinite(score) ? `${score}%` : null]
            .filter(Boolean)
            .join(' · '),
        ])
      : []
    : DOMAINS.map(([key, label]) => {
        const data = record.domainBreakdown?.[key];
        return [label, percent(data?.rate, data?.achieved, data?.total)];
      });
  return (
    <Card className="gap-0 py-0">
      <Header title={title} code={code} avatarUrl={avatarUrl} />
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
