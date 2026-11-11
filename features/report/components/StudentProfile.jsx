import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Phone } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { formatDate, formatGender, schoolYearValue } from '../utils/report-format';
import { ReportFields } from './ReportFields';
import { ReportState } from './ReportState';

export function StudentProfile({ report }) {
  const t = useTranslation();
  const locale = useLocale();
  const { student, classInfo } = report;
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
          ['Mã học sinh', student.studentCode],
          ['Họ và tên', student.fullName],
          ['Giới tính', t(formatGender(student.gender))],
          ['Ngày sinh', t(formatDate(student.dateOfBirth, locale))],
          ...(student.address ? [['Địa chỉ', student.address]] : []),
        ]}
      />
      <Text className="text-sm font-semibold">{t('Phụ huynh & người giám hộ')}</Text>
      {!Array.isArray(parents) || !parents.length ? (
        <ReportState title="Chưa có thông tin người giám hộ" />
      ) : (
        parents.map((parent, index) => (
          <ReportFields
            key={parent.publicId || parent.id || index}
            title={parent.fullName}
            fields={[
              ['Quan hệ', parent.relationship],
              ['Số điện thoại', parent.phone],
            ]}>
            {parent.phone ? (
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onPress={() => call(parent.phone)}
                accessibilityLabel={t('Gọi {name}', { name: parent.fullName })}>
                <Icon as={Phone} size={14} />
                <Text className="text-xs">{t('Liên hệ')}</Text>
              </Button>
            ) : null}
          </ReportFields>
        ))
      )}
      {callError ? (
        <Text accessibilityRole="alert" className="text-xs text-destructive">
          {t(callError)}
        </Text>
      ) : null}
      <ReportFields
        title={t('Lớp học')}
        fields={[
          ['Lớp', classInfo.name],
          ['Năm học', schoolYearValue(classInfo.schoolYear)],
        ]}
      />
    </View>
  );
}
