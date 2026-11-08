import { useState } from 'react';
import { Linking, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { GROWTH_COLORS as colors, growthChartData } from '../utils/growth-chart';
import { formatDate, formatGender, measurement } from '../utils/report-format';

export function WhoGrowthChart({ student, history, metric }) {
  const [selected, setSelected] = useState(null);
  const chart = growthChartData(student, history, metric);
  const title = metric === 'height' ? 'Chiều cao theo tuổi' : 'Cân nặng theo tuổi';
  const unit = metric === 'height' ? 'cm' : 'kg';
  const width = 320,
    height = 218,
    left = 32,
    right = 302,
    top = 15,
    bottom = 180;
  const x = (age) => left + ((age - 24) / 48) * (right - left);
  const y = (value) => bottom - ((value - chart.min) / (chart.max - chart.min)) * (bottom - top);
  const curve = (col) => chart.reference.map((r) => `${x(r[0])},${y(r[col])}`).join(' L ');
  const region = (lower, upper) => {
    const a = chart.reference.map(
      (r) => `${x(r[0])},${y(typeof lower === 'number' ? r[lower] : chart.min)}`
    );
    const b = [...chart.reference]
      .reverse()
      .map((r) => `${x(r[0])},${y(typeof upper === 'number' ? r[upper] : chart.max)}`);
    return `M ${[...a, ...b].join(' L ')} Z`;
  };
  const current = chart.points.find((p) => p.record.id === selected) || chart.points.at(-1);
  const legend = [
    [colors.high, 'Trên +2 SD'],
    [colors.normal, '−2 đến +2 SD'],
    [colors.low, '−3 đến −2 SD'],
    [colors.veryLow, 'Dưới −3 SD'],
    [colors.median, 'Trung vị WHO'],
    [colors.child, 'Số đo của trẻ'],
  ];

  return (
    <Card className="gap-3 rounded-2xl p-3.5 shadow-none">
      <View className="gap-1">
        <Text className="text-sm font-semibold">{title}</Text>
        <Text className="text-[11px] text-muted-foreground">
          {formatGender(student.gender)} · {unit} · 24–72 tháng
        </Text>
      </View>
      {!chart.reference ? (
        <Text className="text-xs leading-5 text-muted-foreground">
          Chưa có giới tính hợp lệ để chọn bảng tham chiếu WHO.
        </Text>
      ) : (
        <>
          <View
            className="overflow-hidden rounded-lg"
            style={{ backgroundColor: colors.background }}>
            <Svg
              width="100%"
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              accessible
              accessibilityLabel={`${title}. Số đo chi tiết nằm ngay bên dưới biểu đồ.`}>
              {[
                [null, 1, colors.veryLow],
                [1, 2, colors.low],
                [2, 4, colors.normal],
                [4, null, colors.high],
              ].map(([lo, hi, fill], i) => (
                <Path key={i} d={region(lo, hi)} fill={fill} opacity={0.85} />
              ))}
              {[0, 1, 2, 3, 4].map((i) => {
                const value = chart.min + ((chart.max - chart.min) * i) / 4;
                return <ReactGrid key={i} value={value} y={y(value)} left={left} right={right} />;
              })}
              {[24, 36, 48, 60, 72].map((age) => (
                <SvgTick key={age} age={age} x={x(age)} top={top} bottom={bottom} />
              ))}
              {[1, 2, 4, 5].map((col) => (
                <Path
                  key={col}
                  d={`M ${curve(col)}`}
                  fill="none"
                  stroke={colors.line}
                  opacity={0.4}
                  strokeWidth={0.6}
                />
              ))}
              <Path d={`M ${curve(3)}`} fill="none" stroke={colors.median} strokeWidth={1.6} />
              {chart.points.length > 1 ? (
                <Path
                  d={`M ${chart.points.map((p) => `${x(p.age)},${y(p.value)}`).join(' L ')}`}
                  stroke={colors.child}
                  strokeWidth={2}
                  fill="none"
                />
              ) : null}
              {chart.points.map((p, index) => (
                <Circle
                  key={`${p.record.id}-${index}`}
                  cx={x(p.age)}
                  cy={y(p.value)}
                  r={current === p ? 5 : 3.5}
                  stroke={colors.background}
                  strokeWidth={1.5}
                  fill={colors.child}
                  onPress={() => setSelected(p.record.id)}
                />
              ))}
              <SvgText x={left} y={10} fontSize={9} fill={colors.text}>
                {unit}
              </SvgText>
              <SvgText x={167} y={212} textAnchor="middle" fontSize={10} fill={colors.text}>
                Tháng tuổi tại ngày đo
              </SvgText>
            </Svg>
          </View>
          <View className="flex-row flex-wrap gap-x-3 gap-y-2">
            {legend.map(([color, label]) => (
              <View key={label} className="flex-row items-center gap-1.5">
                <View style={{ backgroundColor: color, width: 9, height: 9, borderRadius: 2 }} />
                <Text className="text-[10px] text-muted-foreground">{label}</Text>
              </View>
            ))}
          </View>
          {current ? (
            <Text className="text-xs leading-5">
              {current.record.roundName || 'Đợt đo'} · {formatDate(current.record.date)}
              {'\n'}
              {measurement(current.value, unit)} · {current.age.toFixed(2)} tháng tuổi
            </Text>
          ) : (
            <Text className="text-xs text-muted-foreground">
              Chưa có số đo hợp lệ trong khung tuổi này.
            </Text>
          )}
          {chart.points.length > 1 ? (
            <View className="flex-row flex-wrap gap-2">
              {chart.points.map((p, index) => (
                <Button
                  key={`${p.record.id}-${index}`}
                  variant={current === p ? 'secondary' : 'outline'}
                  size="sm"
                  onPress={() => setSelected(p.record.id)}
                  accessibilityLabel={`Xem số đo ngày ${formatDate(p.record.date)}`}>
                  <Text className="text-[11px]">{formatDate(p.record.date)}</Text>
                </Button>
              ))}
            </View>
          ) : null}
        </>
      )}
      {chart.outside > 0 || chart.invalid > 0 ? (
        <Text className="text-[11px] leading-4 text-muted-foreground">
          {chart.outside} đợt ngoài 24–72 tháng; {chart.invalid} đợt thiếu ngày hoặc số đo hợp lệ.
          Xem đầy đủ trong lịch sử.
        </Text>
      ) : null}
      <Text className="text-[10px] leading-4 text-muted-foreground">
        Nguồn WHO 2006 (24–60 tháng) và WHO 2007 (61–72 tháng). Vùng màu là tham chiếu; số đo lấy từ
        hồ sơ trẻ.
        {metric === 'weight' ? ' Cân nặng theo tuổi không dùng riêng để kết luận thừa cân.' : ''}
      </Text>
      <Button
        variant="link"
        size="sm"
        className="self-start px-0"
        onPress={() =>
          Linking.openURL(
            metric === 'height'
              ? 'https://www.who.int/tools/child-growth-standards/standards/length-height-for-age'
              : 'https://www.who.int/tools/child-growth-standards/standards/weight-for-age'
          ).catch(() => {})
        }>
        <Text className="text-[11px]">Bảng tham chiếu WHO</Text>
      </Button>
    </Card>
  );
}

function ReactGrid({ value, y, left, right }) {
  return (
    <>
      <Line
        x1={left}
        x2={right}
        y1={y}
        y2={y}
        stroke={colors.line}
        strokeWidth={0.5}
        strokeDasharray="3 3"
        opacity={0.3}
      />
      <SvgText x={left - 5} y={y + 3} fontSize={9} textAnchor="end" fill={colors.text}>
        {Number(value.toFixed(1))}
      </SvgText>
    </>
  );
}
function SvgTick({ age, x, top, bottom }) {
  return (
    <>
      <Line
        x1={x}
        x2={x}
        y1={top}
        y2={bottom}
        stroke={colors.line}
        strokeWidth={0.5}
        strokeDasharray="3 3"
        opacity={0.3}
      />
      <SvgText x={x} y={bottom + 15} fontSize={9} textAnchor="middle" fill={colors.text}>
        {age}
      </SvgText>
    </>
  );
}
