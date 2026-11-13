import { CalendarDays } from 'lucide-react-native';

import { SelectField } from '@/components/shared/SelectField';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { monthKey, monthLabel } from '../utils/school-periods';

// Chọn tháng Sổ bé ngoan bằng sheet (Select trên mobile); tháng chưa kết thúc chỉ hiện, không chọn được.
export function SchoolMonthPicker({ months, selected, disabled, onSelect }) {
  const locale = useLocale();
  const t = useTranslation();
  return (
    <SelectField
      label={t('Chọn tháng Sổ bé ngoan')}
      placeholder={t('Chọn tháng Sổ bé ngoan')}
      icon={CalendarDays}
      disabled={disabled}
      value={selected ? monthKey(selected) : undefined}
      options={months.map((month) => ({
        value: month.key,
        label: monthLabel(month, locale),
        description: t(month.status),
        disabled: !month.ended,
      }))}
      onChange={(key) => {
        const month = months.find((item) => item.key === key);
        if (month?.ended && (!selected || month.key !== monthKey(selected))) onSelect(month);
      }}
    />
  );
}
