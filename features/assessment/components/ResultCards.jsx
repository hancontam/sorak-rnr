import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/shared/i18n/useLanguage';

const ROSE = require('@/assets/images/rose.webp');
const LOTUS = require('@/assets/images/lotus.webp');

// Hoa hồng và hoa sen dùng đúng ảnh của web (rose.webp, lotus.webp).
function RoseCount({ count, max }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-center gap-1 border border-border bg-muted/40 px-2 py-0.5">
      <Image source={ROSE} style={{ width: 14, height: 14 }} resizeMode="contain" />
      <Text className="font-mono text-xs font-semibold">
        {count}/{max} {t('hoa')}
      </Text>
    </View>
  );
}

function LotusMark() {
  const t = useTranslation();
  return (
    <Image
      source={LOTUS}
      accessibilityLabel={t('Bông Sen Cháu ngoan Bác Hồ')}
      style={{ width: 26, height: 26 }}
      resizeMode="contain"
    />
  );
}

function WeekRose({ given }) {
  const t = useTranslation();
  if (!given)
    return (
      <Badge variant="outline">
        <Text>{t('Chưa được tặng hoa')}</Text>
      </Badge>
    );
  return (
    <View className="flex-row items-center gap-1 border border-border bg-muted/40 px-2 py-0.5">
      <Image source={ROSE} style={{ width: 14, height: 14 }} resizeMode="contain" />
      <Text className="text-xs font-semibold">{t('Được tặng hoa')}</Text>
    </View>
  );
}

const DOMAINS = [
  ['physical', 'Thể chất'],
  ['cognitive', 'Nhận thức'],
  ['language', 'Ngôn ngữ'],
  ['socioEmotional', 'Tình cảm và kỹ năng xã hội'],
  ['aesthetic', 'Thẩm mỹ'],
];

function Header({ title, code, avatarUrl, badge, right, compact }) {
  return (
    <View className={cn('flex-row items-center gap-3 px-4', compact ? 'py-2.5' : 'pb-3 pt-3.5')}>
      <AccountAvatar
        user={{ fullName: title, avatarUrl }}
        className={compact ? 'size-8' : 'size-9'}
      />
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
      {right}
    </View>
  );
}

// Danh sách cả lớp: mỗi bé một khối thu gọn (tóm tắt một dòng), bấm để mở đủ chỉ số và nhận xét.
// Màn một bé (PH) truyền compact = false để hiện đầy đủ ngay.
function Collapsible({ compact, title, code, avatarUrl, badge, value, summary, children }) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);
  if (!compact)
    return (
      <Card className="gap-0 py-0">
        <Header title={title} code={code} avatarUrl={avatarUrl} badge={badge} right={value} />
        {children}
      </Card>
    );
  return (
    <Card className="gap-0 py-0">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={t(open ? 'Thu gọn {name}' : 'Xem chi tiết {name}', { name: title })}
        onPress={() => setOpen(!open)}
        className="active:bg-muted">
        <Header
          compact
          title={title}
          code={code}
          avatarUrl={avatarUrl}
          badge={badge}
          right={
            <View className="flex-row items-center gap-1.5">
              {value}
              <Icon
                as={open ? ChevronUp : ChevronDown}
                size={16}
                className="text-muted-foreground"
              />
            </View>
          }
        />
        {!open && summary ? (
          <Text
            numberOfLines={1}
            className="-mt-1 pb-2.5 pl-[60px] pr-4 text-2xs text-muted-foreground">
            {summary}
          </Text>
        ) : null}
      </Pressable>
      {open ? children : null}
    </Card>
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

export function MonthlyResultCard({
  title,
  code,
  avatarUrl,
  record,
  week,
  maxRoses,
  parent,
  compact = false,
}) {
  const t = useTranslation();
  const stats = week && record?.weeklyStats?.[`week${week}`];
  const rose = week
    ? parent
      ? record?.id
        ? record.weeks?.[`week${week}`]
        : null
      : record?.[`week${week}Rose`]
    : null;
  const hasRoses = Number.isInteger(record?.rosesCount) && maxRoses > 0;
  const marks = week ? (
    rose === true || rose === false ? (
      <WeekRose given={rose} />
    ) : null
  ) : (
    <View className="flex-row items-center gap-2">
      {/* Đủ hoa hồng mới được hoa sen nên hoa sen đứng sau số hoa. */}
      {hasRoses ? <RoseCount count={record.rosesCount} max={maxRoses} /> : null}
      {record?.isLotus === true ? <LotusMark /> : null}
    </View>
  );
  const summary = week
    ? [
        stats?.attendanceRate !== undefined && `${t('Chuyên cần')} ${stats.attendanceRate}%`,
        stats?.goalsRate !== undefined && `${t('Mục tiêu')} ${stats.goalsRate}%`,
        stats?.healthStatus && t(stats.healthStatus),
      ]
        .filter(Boolean)
        .join(' · ')
    : [
        record?.teacherNotes || t('Chưa có nhận xét.'),
        !parent && record?.parentFeedback ? t('PH đã phản hồi') : null,
      ]
        .filter(Boolean)
        .join(' · ');
  return (
    <Collapsible
      compact={compact}
      title={title}
      code={code}
      avatarUrl={avatarUrl}
      value={marks}
      summary={summary}>
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
            value={hasRoses ? `${record.rosesCount}/${maxRoses} ${t('hoa')}` : ''}
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
    </Collapsible>
  );
}

export function SemesterResultCard({ title, code, avatarUrl, record, parent, compact = false }) {
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
  const attendance = percent(
    record.attendance?.rate,
    record.attendance?.presentDays,
    record.attendance?.totalDays
  );
  return (
    <Collapsible
      compact={compact}
      title={title}
      code={code}
      avatarUrl={avatarUrl}
      value={
        Number.isFinite(record.attendance?.rate) ? (
          <Text className="font-mono text-xs font-semibold">{record.attendance.rate}%</Text>
        ) : null
      }
      summary={record.teacherNotes || t('Chưa có nhận xét.')}>
      {!parent ? <Metric label="Chuyên cần" value={attendance} /> : null}
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
    </Collapsible>
  );
}
