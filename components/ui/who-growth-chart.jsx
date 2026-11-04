import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { WHO_STANDARDS } from '@/features/report/lib/who-standards';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

const X_TICKS = [24, 36, 48, 60, 72];
const CHART = { width: 360, height: 234, left: 34, right: 10, top: 12, bottom: 29 };

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const vn = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  const date = vn ? new Date(Number(vn[3]), Number(vn[2]) - 1, Number(vn[1])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ageInMonths(dateOfBirth, measuredAt) {
  const birth = toDate(dateOfBirth);
  const date = toDate(measuredAt);
  if (!birth || !date) return null;
  return (date.getTime() - birth.getTime()) / ((365.2425 / 12) * 24 * 60 * 60 * 1000);
}

function pathThrough(points) {
  return points
    .map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function GrowthPlot({ rows, history, dateOfBirth, metric, colors }) {
  const min = metric === 'height' ? 70 : 7;
  const max = metric === 'height' ? 135 : 35;
  const ticks = metric === 'height' ? [70, 85, 100, 115, 130] : [7, 14, 21, 28, 35];
  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const x = (month) => CHART.left + ((month - 24) / 48) * plotWidth;
  const y = (value) => CHART.top + (1 - (value - min) / (max - min)) * plotHeight;
  const line = (column) => pathThrough(rows.map((row) => ({ x: x(row[0]), y: y(row[column]) })));
  const band = (lower, upper) => {
    const top = rows.map((row) => ({ x: x(row[0]), y: y(row[upper]) }));
    const bottom = [...rows].reverse().map((row) => ({ x: x(row[0]), y: y(row[lower]) }));
    return `${pathThrough(top)} ${bottom.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')} Z`;
  };
  const points = (history || [])
    .map((record) => ({
      month: ageInMonths(dateOfBirth, record.date || record.dateFormatted),
      value: Number(record[metric]),
    }))
    .filter((point) => point.month >= 24 && point.month <= 72 && point.value > 0)
    .sort((a, b) => a.month - b.month);

  return (
    <Svg width="100%" height={CHART.height} viewBox={`0 0 ${CHART.width} ${CHART.height}`}>
      {ticks.map((tick) => (
        <Fragment key={tick}>
          <Line
            x1={CHART.left}
            x2={CHART.width - CHART.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={colors.border}
            strokeWidth={0.8}
          />
          <SvgText
            x={CHART.left - 7}
            y={y(tick) + 3}
            fontSize={10}
            textAnchor="end"
            fill={colors.mutedForeground}>
            {tick}
          </SvgText>
        </Fragment>
      ))}
      <Path d={band(0, 4)} fill={colors.chart1} fillOpacity={0.06} />
      <Path d={band(1, 3)} fill={colors.chart2} fillOpacity={0.12} />
      <Path
        d={line(1)}
        stroke={colors.chart4}
        strokeWidth={1.2}
        fill="none"
        strokeDasharray="4 4"
      />
      <Path
        d={line(3)}
        stroke={colors.chart4}
        strokeWidth={1.2}
        fill="none"
        strokeDasharray="4 4"
      />
      <Path d={line(2)} stroke={colors.chart2} strokeWidth={2} fill="none" />
      {points.length > 1 ? (
        <Path
          d={pathThrough(points.map((point) => ({ x: x(point.month), y: y(point.value) })))}
          stroke={colors.chart1}
          strokeWidth={2.5}
          fill="none"
        />
      ) : null}
      {points.map((point, index) => (
        <Circle
          key={`${point.month}-${index}`}
          cx={x(point.month)}
          cy={y(point.value)}
          r={4}
          fill={colors.chart1}
          stroke={colors.card}
          strokeWidth={1.5}
        />
      ))}
      {X_TICKS.map((month) => (
        <SvgText
          key={month}
          x={x(month)}
          y={CHART.height - 7}
          textAnchor="middle"
          fontSize={10}
          fill={colors.mutedForeground}>
          {month}
        </SvgText>
      ))}
    </Svg>
  );
}

export function WhoGrowthCharts({ student, history }) {
  const { colorScheme } = useColorScheme();
  const colors = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const gender = String(student?.gender || '').toUpperCase();
  const isGirl = ['FEMALE', 'NỮ'].includes(gender);
  const isBoy = ['MALE', 'NAM'].includes(gender);
  if (!isGirl && !isBoy) {
    return (
      <Text className="text-xs text-muted-foreground">
        Chưa có giới tính để chọn bảng tham chiếu WHO.
      </Text>
    );
  }
  const standards = WHO_STANDARDS[isGirl ? 'girl' : 'boy'];
  const dob = student?.dateOfBirth || student?.dob;

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-semibold">Biểu đồ tăng trưởng WHO</Text>
        <Text className="text-xs text-muted-foreground">
          {isGirl ? 'Bé gái' : 'Bé trai'} · 24–72 tháng · số đo được lấy từ các đợt khám của học
          sinh
        </Text>
      </View>
      {[
        { key: 'height', title: 'Chiều cao theo tuổi', unit: 'cm' },
        { key: 'weight', title: 'Cân nặng theo tuổi', unit: 'kg' },
      ].map(({ key, title, unit }) => (
        <Card key={key} className="gap-3 rounded-xl px-3 py-4 shadow-none">
          <View className="flex-row items-baseline justify-between px-1">
            <Text className="text-sm font-semibold">{title}</Text>
            <Text className="text-xs text-muted-foreground">{unit}</Text>
          </View>
          <GrowthPlot
            rows={standards[key]}
            history={history}
            dateOfBirth={dob}
            metric={key}
            colors={colors}
          />
          <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1 px-1">
            <Text className="text-xs text-muted-foreground">● Số đo của bé</Text>
            <Text className="text-xs text-muted-foreground">— Trung vị WHO</Text>
            <Text className="text-xs text-muted-foreground">┄ ±2 SD</Text>
          </View>
        </Card>
      ))}
      <Text className="px-1 text-xs text-muted-foreground">
        Vùng tham chiếu được vẽ từ các mốc WHO đang dùng trên bản web. Kết quả chỉ để theo dõi tăng
        trưởng.
      </Text>
      {!dob ? (
        <Text className="px-1 text-xs text-muted-foreground">
          Chưa có ngày sinh để đặt số đo lên biểu đồ.
        </Text>
      ) : null}
    </View>
  );
}
