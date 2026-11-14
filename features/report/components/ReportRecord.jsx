import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import {
  assessmentStatus,
  attendanceStatus,
  authorizationStatus,
  formatDate,
  measurement,
} from '../utils/report-format';
import { heightForAge, recordedByLabel, weightStatus } from '../utils/growth-evaluation';
import { ReportFields } from './ReportFields';

const MONO = { mono: true };

export function ReportRecord({ section, record }) {
  const t = useTranslation();
  const locale = useLocale();
  const dateLabel = (value) => t(formatDate(value, locale));
  if (section === 'health')
    return (
      <ReportFields
        title={`${record.roundName || t('Đợt đo')} · ${dateLabel(record.date)}`}
        fields={[
          ['Chiều cao', t(measurement(record.height, 'cm', locale)), MONO],
          ['Cân nặng', t(measurement(record.weight, 'kg', locale)), MONO],
          ...(Number.isFinite(Number(record.bmi)) && Number(record.bmi) > 0
            ? [['BMI', Number(record.bmi).toLocaleString(locale), MONO]]
            : []),
          ['Chiều cao / Tuổi', <GrowthBadge evaluation={heightForAge(record)} />],
          ['Cân nặng / Thể trạng', <GrowthBadge evaluation={weightStatus(record)} />],
          // Chỉ hiện ghi chú khi backend có; không tự điền câu mặc định như web.
          ...(record.notes ? [['Ghi chú y tế', record.notes]] : []),
          [
            'Người ghi nhận',
            recordedByLabel(record.recordedBy) && t(recordedByLabel(record.recordedBy)),
          ],
        ]}
      />
    );
  if (section === 'attendance')
    return (
      <ReportFields
        title={dateLabel(record.date)}
        badge={<ResultBadge text={t(attendanceStatus(record.status))} />}
        fields={[
          ['Có mặt', record.checkInTime, MONO],
          ['Đón về', record.checkOutTime, MONO],
          ...(record.pickupPerson
            ? [
                ['Người đón', record.pickupPerson],
                ['Quan hệ', record.pickupRelationship],
                ['Số điện thoại', record.pickupPhone, MONO],
              ]
            : []),
          ...(record.pickupNote ? [['Ghi chú đón', record.pickupNote]] : []),
          ...(record.notes ? [['Ghi chú', record.notes]] : []),
        ]}
      />
    );
  if (section === 'assessments')
    return (
      <ReportFields
        title={record.activityTitle || t('Hoạt động giáo dục')}
        badge={<ResultBadge text={t(assessmentStatus(record.status))} />}
        fields={[
          ['Ngày', dateLabel(record.date)],
          ['Hoạt động', record.routineSlotLabel],
          ['Mục tiêu', record.objective],
          ['Giáo viên', record.evaluatorName],
          ...(record.notes ? [['Nhận xét', record.notes]] : []),
        ]}
      />
    );
  return (
    <ReportFields
      title={record.pickupPersonName || t('Người được ủy quyền')}
      badge={<ResultBadge text={t(authorizationStatus(record.status))} />}
      fields={[
        ['Quan hệ', record.relationship],
        ['Số điện thoại', record.pickupPersonPhone, MONO],
        ['Từ ngày', dateLabel(record.startDate)],
        ['Đến ngày', dateLabel(record.endDate)],
        ...(record.note ? [['Ghi chú', record.note]] : []),
      ]}
    />
  );
}

const TONE_VARIANT = { danger: 'destructive', warn: 'outline', info: 'secondary', ok: 'secondary' };

// Nhãn đánh giá WHO; thiếu z-score thì ghi rõ chưa có thông tin, không mặc định "Đạt chuẩn".
function GrowthBadge({ evaluation }) {
  const t = useTranslation();
  if (!evaluation)
    return (
      <Text className="text-xs leading-5 text-muted-foreground">{t('Chưa có thông tin')}</Text>
    );
  return (
    <Badge variant={TONE_VARIANT[evaluation.tone]}>
      <Text>{t(evaluation.label)}</Text>
    </Badge>
  );
}

function ResultBadge({ text }) {
  return (
    <Badge variant="secondary">
      <Text>{text}</Text>
    </Badge>
  );
}
