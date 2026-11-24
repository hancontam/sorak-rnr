import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Phone } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { formatDate, formatGender } from '../utils/report-format';
import { ReportFields } from './ReportFields';
import { ReportState } from './ReportState';

// Giáo viên xem hồ sơ có nút gọi phụ huynh; phụ huynh (parentView) không gọi chính mình mà có
// thẻ Giáo viên lớp (mọi giáo viên phụ trách) với nút gọi giáo viên.
export function StudentProfile({ report, parentView = false, teachers = [] }) {
  const t = useTranslation();
  const locale = useLocale();
  const { student } = report;
  const [callError, setCallError] = useState('');
  const parents = student.parents;
  const call = async (phone) => {
    setCallError('');
    const number = String(phone).replace(/[\s().-]/g, '');
    if (!/^\+?\d{8,15}$/.test(number)) {
      setCallError('Số điện thoại trong hồ sơ chưa hợp lệ.');
      return;
    }
    try {
      await Linking.openURL(`tel:${number}`);
    } catch {
      setCallError('Thiết bị chưa mở được ứng dụng gọi điện. Bạn có thể dùng số trong hồ sơ.');
    }
  };
  return (
    <View className="gap-4">
      <ReportFields
        title={t('Thông tin cá nhân')}
        fields={[
          ['Mã học sinh', student.studentCode, { mono: true }],
          ['Họ và tên', student.fullName],
          ['Giới tính', t(formatGender(student.gender))],
          ['Ngày sinh', t(formatDate(student.dateOfBirth, locale)), { mono: true }],
          ...(student.address ? [['Địa chỉ', student.address]] : []),
        ]}
      />
      <Text className="pt-1 text-sm font-semibold">{t('Phụ huynh & người giám hộ')}</Text>
      {!Array.isArray(parents) || !parents.length ? (
        <ReportState title="Chưa có thông tin người giám hộ" />
      ) : (
        parents.map((parent, index) => (
          <ReportFields
            key={parent.publicId || parent.id || index}
            title={parent.fullName}
            fields={[
              ['Quan hệ', parent.relationship],
              ['Số điện thoại', parent.phone, { mono: true }],
            ]}>
            {parent.phone && !parentView ? (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onPress={() => call(parent.phone)}
                accessibilityLabel={t('Gọi {name}', { name: parent.fullName })}>
                <Icon as={Phone} size={14} />
                <Text>{t('Liên hệ')}</Text>
              </Button>
            ) : null}
          </ReportFields>
        ))
      )}
      {parentView && teachers?.length ? (
        // Lớp có thể có nhiều giáo viên phụ trách (tối đa 3); web gọi chung là Giáo viên lớp.
        <>
          <Text className="pt-1 text-sm font-semibold">
            {t(teachers.length > 1 ? 'Giáo viên lớp ({count})' : 'Giáo viên lớp', {
              count: teachers.length,
            })}
          </Text>
          {teachers.map((teacher) => (
            <ReportFields
              key={teacher.id}
              title={teacher.fullName}
              fields={[
                ['Số điện thoại', teacher.phone, { mono: true }],
                ...(teacher.email ? [['Email', teacher.email]] : []),
              ]}>
              {teacher.phone ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onPress={() => call(teacher.phone)}
                  accessibilityLabel={t('Gọi {name}', { name: teacher.fullName })}>
                  <Icon as={Phone} size={14} />
                  <Text>{t('Gọi giáo viên')}</Text>
                </Button>
              ) : null}
            </ReportFields>
          ))}
        </>
      ) : null}
      {callError ? (
        <Text accessibilityRole="alert" className="text-xs text-destructive">
          {t(callError)}
        </Text>
      ) : null}
    </View>
  );
}
