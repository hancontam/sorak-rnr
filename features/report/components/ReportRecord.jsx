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

export function ReportRecord({ section, record }) {
  const t = useTranslation();
  const locale = useLocale();
  const dateLabel = (value) => t(formatDate(value, locale));
  if (section === 'health')
    return (
      <ReportFields
        title={`${record.roundName || t('Đợt đo')} · ${dateLabel(record.date)}`}
        fields={[
          ['Chiều cao', t(measurement(record.height, 'cm', locale))],
          ['Cân nặng', t(measurement(record.weight, 'kg', locale))],
          ...(record.notes ? [['Ghi chú', record.notes]] : []),
        ]}
      />
    );
  if (section === 'attendance')
    return (
      <ReportFields
        title={dateLabel(record.date)}
        fields={[
          ['Có mặt', record.checkInTime],
          ['Đón về', record.checkOutTime],
          ...(record.pickupPerson
            ? [
                ['Người đón', record.pickupPerson],
                ['Quan hệ', record.pickupRelationship],
                ['Số điện thoại', record.pickupPhone],
              ]
            : []),
          ...(record.pickupNote ? [['Ghi chú đón', record.pickupNote]] : []),
          ...(record.notes ? [['Ghi chú', record.notes]] : []),
        ]}>
        <ResultBadge text={t(attendanceStatus(record.status))} />
      </ReportFields>
    );
  if (section === 'assessments')
    return (
      <ReportFields
        title={record.activityTitle || t('Hoạt động giáo dục')}
        fields={[
          ['Ngày', dateLabel(record.date)],
          ['Hoạt động', record.routineSlotLabel],
          ['Mục tiêu', record.objective],
          ['Giáo viên', record.evaluatorName],
          ...(record.notes ? [['Nhận xét', record.notes]] : []),
        ]}>
        <ResultBadge text={t(assessmentStatus(record.status))} />
      </ReportFields>
    );
  return (
    <ReportFields
      title={record.pickupPersonName || t('Người được ủy quyền')}
      fields={[
        ['Quan hệ', record.relationship],
        ['Số điện thoại', record.pickupPersonPhone],
        ['Từ ngày', dateLabel(record.startDate)],
        ['Đến ngày', dateLabel(record.endDate)],
        ...(record.note ? [['Ghi chú', record.note]] : []),
      ]}>
      <ResultBadge text={t(authorizationStatus(record.status))} />
    </ReportFields>
  );
}

function ResultBadge({ text }) {
  return (
    <Badge variant="secondary" className="self-start">
      <Text className="text-[11px]">{text}</Text>
    </Badge>
  );
}
