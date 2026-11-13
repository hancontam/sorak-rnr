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
          ...(record.notes ? [['Ghi chú', record.notes]] : []),
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

function ResultBadge({ text }) {
  return (
    <Badge variant="secondary">
      <Text>{text}</Text>
    </Badge>
  );
}
