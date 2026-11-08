import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

import {
  assessmentStatus,
  attendanceStatus,
  authorizationStatus,
  formatDate,
  measurement,
} from '../utils/report-format';
import { ReportFields } from './ReportFields';

export function ReportRecord({ section, record }) {
  if (section === 'health')
    return (
      <ReportFields
        title={`${record.roundName || 'Đợt đo'} · ${formatDate(record.date)}`}
        fields={[
          ['Chiều cao', measurement(record.height, 'cm')],
          ['Cân nặng', measurement(record.weight, 'kg')],
          ...(record.notes ? [['Ghi chú', record.notes]] : []),
        ]}
      />
    );
  if (section === 'attendance')
    return (
      <ReportFields
        title={formatDate(record.date)}
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
        <ResultBadge text={attendanceStatus(record.status)} />
      </ReportFields>
    );
  if (section === 'assessments')
    return (
      <ReportFields
        title={record.activityTitle || 'Hoạt động giáo dục'}
        fields={[
          ['Ngày', formatDate(record.date)],
          ['Hoạt động', record.routineSlotLabel],
          ['Mục tiêu', record.objective],
          ['Giáo viên', record.evaluatorName],
          ...(record.notes ? [['Nhận xét', record.notes]] : []),
        ]}>
        <ResultBadge text={assessmentStatus(record.status)} />
      </ReportFields>
    );
  return (
    <ReportFields
      title={record.pickupPersonName || 'Người được ủy quyền'}
      fields={[
        ['Quan hệ', record.relationship],
        ['Số điện thoại', record.pickupPersonPhone],
        ['Từ ngày', formatDate(record.startDate)],
        ['Đến ngày', formatDate(record.endDate)],
        ...(record.note ? [['Ghi chú', record.note]] : []),
      ]}>
      <ResultBadge text={authorizationStatus(record.status)} />
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
