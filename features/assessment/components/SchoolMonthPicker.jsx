import { ScrollView } from 'react-native';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { monthKey, monthLabel } from '../utils/school-periods';

export function SchoolMonthPicker({ months, selected, disabled, onSelect }) {
  return (
    <Select
      disabled={disabled}
      value={selected ? { value: monthKey(selected), label: monthLabel(selected) } : undefined}
      onValueChange={(option) => {
        const month = months.find((item) => item.key === option?.value);
        if (month?.ended && (!selected || month.key !== monthKey(selected))) onSelect(month);
      }}>
      <SelectTrigger size="sm" accessibilityLabel="Chọn tháng Sổ bé ngoan" className="w-full">
        <SelectValue placeholder="Chọn tháng Sổ bé ngoan" />
      </SelectTrigger>
      <SelectContent className="min-w-[245px]">
        <ScrollView style={{ maxHeight: 340 }} keyboardShouldPersistTaps="handled">
          {months.map((month) => (
            <SelectItem
              key={month.key}
              value={month.key}
              label={`${monthLabel(month)} · ${month.status}`}
              disabled={!month.ended}
            />
          ))}
        </ScrollView>
      </SelectContent>
    </Select>
  );
}
