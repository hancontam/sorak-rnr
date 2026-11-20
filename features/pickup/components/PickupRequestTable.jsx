import { AccountAvatar } from '@/components/shared/AccountAvatar';
import { DataTable, TableStudent } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { statusBadgeVariant } from '@/lib/status-badge';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { REQUEST_STATUS, requestPeriod } from '../utils/pickup-request';

function Plain({ value, mono, lines = 2 }) {
  const t = useTranslation();
  return (
    <Text
      numberOfLines={lines}
      className={
        value
          ? mono
            ? 'font-mono text-2xs'
            : 'text-2xs leading-4'
          : 'text-2xs italic text-muted-foreground'
      }>
      {value || t('Không có')}
    </Text>
  );
}

function Person({ request }) {
  const t = useTranslation();
  const name = request.pickupPersonName || t('Người đón trẻ');
  return (
    <TableStudent
      avatar={
        <AccountAvatar user={{ fullName: name, avatarUrl: request.photoUrl }} className="size-7" />
      }
      name={name}
      code={request.relationship}
    />
  );
}

// Bảng đơn ủy quyền như trên web. Giáo viên: cột cố định là học sinh; phụ huynh xem đơn của con nên
// cột cố định là người được ủy quyền. Bấm một dòng mở chi tiết và thao tác (duyệt, từ chối, hủy).
export function PickupRequestTable({ requests, isParent, onOpen }) {
  const t = useTranslation();
  const lead = isParent
    ? { title: t('Người được ủy quyền'), width: 172, render: (row) => <Person request={row} /> }
    : {
        title: t('Học sinh'),
        width: 172,
        render: (row) => (
          <TableStudent
            avatar={<AccountAvatar user={row.student} className="size-7" />}
            name={row.student?.name}
            code={row.student?.code}
          />
        ),
      };
  const columns = [
    {
      key: 'status',
      title: t('Trạng thái'),
      width: 100,
      render: (row) => (
        <Badge variant={statusBadgeVariant('authorization', row.status)}>
          <Text>{t(REQUEST_STATUS[row.status] || 'Chưa rõ trạng thái')}</Text>
        </Badge>
      ),
    },
    ...(isParent
      ? []
      : [
          {
            key: 'person',
            title: t('Người được ủy quyền'),
            width: 160,
            align: 'left',
            render: (row) => <Person request={row} />,
          },
        ]),
    {
      key: 'phone',
      title: t('Số điện thoại'),
      width: 104,
      render: (row) => <Plain value={row.pickupPersonPhone} mono lines={1} />,
    },
    {
      key: 'period',
      title: t('Thời gian hiệu lực'),
      width: 150,
      render: (row) => <Plain value={requestPeriod(row)} mono />,
    },
    {
      key: 'note',
      title: t(isParent ? 'Ghi chú' : 'Dặn dò phụ huynh'),
      width: 180,
      align: 'left',
      render: (row) => <Plain value={row.note} />,
    },
    {
      key: 'reason',
      title: t('Lý do từ chối'),
      width: 160,
      align: 'left',
      render: (row) => <Plain value={row.status === 'REJECTED' ? row.rejectedReason : null} />,
    },
  ];
  return (
    <DataTable
      lead={lead}
      columns={columns}
      rows={requests}
      keyOf={(row) => String(row.id)}
      onRowPress={onOpen}
    />
  );
}
