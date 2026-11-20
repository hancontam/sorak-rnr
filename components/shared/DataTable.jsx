import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const HEADER_HEIGHT = 36;
const GROUP_HEIGHT = 26;

// Bảng dữ liệu kiểu bảng của web/shadcn cho danh sách cả lớp: cột đầu (học sinh) cố định, các cột
// còn lại cuộn ngang khi vượt bề ngang màn hình. Tiêu đề có thể gom nhóm (column.group) như web.
// Mỗi dòng cao bằng nhau ở cả hai phần để thẳng hàng; bấm dòng (onRowPress) sáng cả hàng.
export function DataTable({ lead, columns, rows, keyOf, rowHeight = 60, onRowPress }) {
  const [pressed, setPressed] = useState(null);
  const grouped = columns.some((column) => column.group);
  const headerHeight = grouped ? GROUP_HEIGHT + HEADER_HEIGHT : HEADER_HEIGHT;

  // Gom các cột liền nhau cùng group thành một ô tiêu đề nhóm.
  const groups = [];
  for (const column of columns) {
    const last = groups[groups.length - 1];
    if (last && last.group === (column.group || null)) last.width += column.width;
    else groups.push({ group: column.group || null, width: column.width });
  }

  function rowProps(row) {
    const key = keyOf(row);
    return onRowPress
      ? {
          onPress: () => onRowPress(row),
          onPressIn: () => setPressed(key),
          onPressOut: () => setPressed(null),
        }
      : {};
  }
  const Row = onRowPress ? Pressable : View;

  return (
    <View className="flex-row border border-border bg-card">
      <View style={{ width: lead.width }} className="border-r border-border">
        {/* Tiêu đề cột cố định thẳng hàng với dòng tiêu đề cột (dòng dưới khi có tiêu đề nhóm). */}
        <View style={{ height: headerHeight }} className="justify-end border-b border-border bg-muted">
          <View style={{ height: HEADER_HEIGHT }} className="justify-center px-3">
            <Text className="text-2xs font-semibold text-muted-foreground">{lead.title}</Text>
          </View>
        </View>
        {rows.map((row, index) => (
          <Row
            key={keyOf(row)}
            accessibilityRole={onRowPress ? 'button' : undefined}
            {...rowProps(row)}
            style={{ height: rowHeight }}
            className={cn(
              'justify-center px-3',
              index < rows.length - 1 && 'border-b border-border',
              pressed === keyOf(row) && 'bg-muted'
            )}>
            {lead.render(row)}
          </Row>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        <View>
          {grouped ? (
            <View style={{ height: GROUP_HEIGHT }} className="flex-row bg-muted">
              {groups.map((group, index) => (
                <View
                  key={`${group.group || 'none'}-${index}`}
                  style={{ width: group.width }}
                  className={cn(
                    'items-start justify-center px-2',
                    group.group && 'border-b border-border',
                    index > 0 && 'border-l border-border'
                  )}>
                  {group.group ? (
                    <Text className="text-2xs font-semibold text-muted-foreground">{group.group}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null}
          <View
            style={{ height: HEADER_HEIGHT }}
            className="flex-row border-b border-border bg-muted">
            {columns.map((column) => (
              <View
                key={column.key}
                style={{ width: column.width }}
                className={cn(
                  'justify-center px-2',
                  column.align === 'left' ? 'items-start' : 'items-center'
                )}>
                <Text
                  numberOfLines={2}
                  className={cn(
                    'text-2xs font-semibold text-muted-foreground',
                    column.align !== 'left' && 'text-center'
                  )}>
                  {column.title}
                </Text>
              </View>
            ))}
          </View>
          {rows.map((row, index) => (
            <Row
              key={keyOf(row)}
              {...rowProps(row)}
              style={{ height: rowHeight }}
              className={cn(
                'flex-row',
                index < rows.length - 1 && 'border-b border-border',
                pressed === keyOf(row) && 'bg-muted'
              )}>
              {columns.map((column) => (
                <View
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'justify-center px-2',
                    column.align === 'left' ? 'items-start' : 'items-center'
                  )}>
                  {column.render(row)}
                </View>
              ))}
            </Row>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Ô hai dòng: giá trị chính và dòng phụ nhỏ (vd. "100%" / "5/5 buổi"). tone: primary | danger | muted.
export function TableValue({ value, sub, tone, align = 'center' }) {
  return (
    <View className={align === 'left' ? 'items-start' : 'items-center'}>
      <Text
        numberOfLines={1}
        className={cn(
          'font-mono text-xs font-semibold',
          tone === 'primary' && 'text-primary',
          tone === 'danger' && 'text-destructive',
          tone === 'muted' && 'font-sans font-normal italic text-muted-foreground'
        )}>
        {value}
      </Text>
      {sub ? (
        <Text numberOfLines={1} className="text-2xs text-muted-foreground">
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// Ô học sinh ở cột cố định: avatar nhỏ, tên (tối đa hai dòng để thấy đủ họ tên), mã.
export function TableStudent({ avatar, name, code }) {
  return (
    <View className="flex-row items-center gap-2">
      {avatar}
      <View className="min-w-0 flex-1">
        <Text numberOfLines={2} className="text-xs font-semibold leading-4">
          {name}
        </Text>
        {code ? (
          <Text numberOfLines={1} className="font-mono text-2xs text-muted-foreground">
            {code}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
