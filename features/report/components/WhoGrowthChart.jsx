import { Maximize2, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Linking, Modal, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useLocale, useTranslation } from '@/shared/i18n/useLanguage';

import { GROWTH_COLORS as colors, growthChartData, spreadPoints } from '../utils/growth-chart';
import { formatDate, formatGender, measurement } from '../utils/report-format';

const LEGEND = [
  [colors.high, 'Trên +2 SD'],
  [colors.normal, '−2 đến +2 SD'],
  [colors.low, '−3 đến −2 SD'],
  [colors.veryLow, 'Dưới −3 SD'],
  [colors.median, 'Trung vị WHO'],
  [colors.child, 'Số đo của trẻ'],
];

// Kích thước vẽ: thẻ trong báo cáo vừa bề ngang màn; bản phóng to rộng hơn và cuộn ngang như biểu đồ
// trên web, có nhãn Đ1, Đ2… trên từng điểm.
const COMPACT = { width: 320, height: 218, left: 32, right: 302, top: 15, bottom: 180, gap: 10 };
const EXPANDED = { width: 760, height: 380, left: 40, right: 730, top: 30, bottom: 335, gap: 30 };

export function WhoGrowthChart({ student, history, metric }) {
  const t = useTranslation();
  const locale = useLocale();
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const wide = useRef(null);
  const chart = growthChartData(student, history, metric);
  const title = t(metric === 'height' ? 'Chiều cao theo tuổi' : 'Cân nặng theo tuổi');
  const unit = metric === 'height' ? 'cm' : 'kg';
  const current = chart.points.find((p) => p.record.id === selected) || chart.points.at(-1);
  const subtitle = `${t(formatGender(student.gender))} · ${unit} · ${t('24–72 tháng')}`;

  const details = current ? (
    <Text className="text-xs leading-5">
      {current.record.roundName || t('Đợt đo')} · {formatDate(current.record.date, locale)}
      {'\n'}
      {measurement(current.value, unit, locale)} ·{' '}
      {t('{age} tháng tuổi', {
        age: current.age.toLocaleString(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      })}
    </Text>
  ) : (
    <Text className="text-xs text-muted-foreground">
      {t('Chưa có số đo hợp lệ trong khung tuổi này.')}
    </Text>
  );
  const rounds =
    chart.points.length > 1 ? (
      <View className="flex-row flex-wrap gap-2">
        {chart.points.map((p, index) => {
          const date = formatDate(p.record.date, locale);
          return (
            <Button
              key={`${p.record.id}-${index}`}
              variant={current === p ? 'secondary' : 'outline'}
              size="sm"
              onPress={() => setSelected(p.record.id)}
              accessibilityLabel={t('Xem số đo ngày {date}', { date })}>
              <Text className="text-2xs">{date}</Text>
            </Button>
          );
        })}
      </View>
    ) : null;
  const legend = (
    <View className="flex-row flex-wrap gap-x-3 gap-y-2">
      {LEGEND.map(([color, label]) => (
        <View key={label} className="flex-row items-center gap-1.5">
          <View style={{ backgroundColor: color, width: 9, height: 9, borderRadius: 2 }} />
          <Text className="text-2xs text-muted-foreground">{t(label)}</Text>
        </View>
      ))}
    </View>
  );
  const svgProps = { chart, current, onSelect: setSelected, unit, title, t, locale };

  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row items-start gap-2">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-semibold">{title}</Text>
          <Text className="text-2xs text-muted-foreground">{subtitle}</Text>
        </View>
        {chart.reference && chart.points.length ? (
          <Button
            variant="outline"
            size="icon-sm"
            accessibilityLabel={t('Phóng to biểu đồ {title}', { title })}
            onPress={() => setExpanded(true)}>
            <Icon as={Maximize2} size={14} />
          </Button>
        ) : null}
      </View>
      {!chart.reference ? (
        <Text className="text-xs leading-5 text-muted-foreground">
          {t('Chưa có giới tính hợp lệ để chọn bảng tham chiếu WHO.')}
        </Text>
      ) : (
        <>
          <View className="overflow-hidden" style={{ backgroundColor: colors.background }}>
            <ChartSvg {...svgProps} size={COMPACT} fill />
          </View>
          {legend}
          {details}
          {rounds}
        </>
      )}
      {chart.outside > 0 || chart.invalid > 0 ? (
        <Text className="text-2xs leading-4 text-muted-foreground">
          {t(
            '{outside} đợt ngoài 24–72 tháng; {invalid} đợt thiếu ngày hoặc số đo hợp lệ. Xem đầy đủ trong lịch sử.',
            { outside: chart.outside, invalid: chart.invalid }
          )}
        </Text>
      ) : null}
      <Text className="text-2xs leading-4 text-muted-foreground">
        {t(
          'Nguồn WHO 2006 (24–60 tháng) và WHO 2007 (61–72 tháng). Vùng màu là tham chiếu; số đo lấy từ hồ sơ trẻ.'
        )}
        {metric === 'weight'
          ? ` ${t('Cân nặng theo tuổi không dùng riêng để kết luận thừa cân.')}`
          : ''}
        {chart.points.length > 1
          ? ` ${t('Các đợt đo gần nhau được dãn ra để dễ nhìn; tháng tuổi thật ghi ở phần chi tiết.')}`
          : ''}
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
        <Text className="text-2xs">{t('Bảng tham chiếu WHO')}</Text>
      </Button>
      {chart.reference ? (
        <Modal
          visible={expanded}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setExpanded(false)}>
          <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
              <View className="min-w-0 flex-1">
                <Text className="text-base font-semibold">{title}</Text>
                <Text className="text-2xs text-muted-foreground">
                  {subtitle} · {t('Kéo ngang để xem cả biểu đồ')}
                </Text>
              </View>
              <Button
                variant="ghost"
                size="icon-sm"
                accessibilityLabel={t('Đóng')}
                onPress={() => setExpanded(false)}>
                <Icon as={X} size={18} />
              </Button>
            </View>
            <ScrollView contentContainerClassName="gap-3 pb-8">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                // Mở ra ở đợt đo mới nhất (cuối trục tuổi), kéo sang trái để xem các đợt trước.
                ref={wide}
                onContentSizeChange={() => wide.current?.scrollToEnd({ animated: false })}
                style={{ backgroundColor: colors.background }}>
                <ChartSvg {...svgProps} size={EXPANDED} labels />
              </ScrollView>
              <View className="gap-3 px-4">
                {legend}
                {details}
                {rounds}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      ) : null}
    </Card>
  );
}

function ChartSvg({ chart, size, fill, labels, current, onSelect, unit, title, t, locale }) {
  const { width, height, left, right, top, bottom, gap } = size;
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
  const xs = spreadPoints(chart.points, x, gap, right);
  const fontSize = labels ? 11 : 9;

  return (
    <Svg
      width={fill ? '100%' : width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      accessible
      accessibilityLabel={t('{title}. Số đo chi tiết nằm ngay bên dưới biểu đồ.', { title })}>
      {[
        [null, 1, colors.veryLow],
        [1, 2, colors.low],
        [2, 4, colors.normal],
        [4, null, colors.high],
      ].map(([lo, hi, color], i) => (
        <Path key={i} d={region(lo, hi)} fill={color} opacity={0.85} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => {
        const value = chart.min + ((chart.max - chart.min) * i) / 4;
        return (
          <GridRow
            key={i}
            label={value.toLocaleString(locale, { maximumFractionDigits: 1 })}
            y={y(value)}
            left={left}
            right={right}
            fontSize={fontSize}
          />
        );
      })}
      {(labels ? [24, 30, 36, 42, 48, 54, 60, 66, 72] : [24, 36, 48, 60, 72]).map((age) => (
        <Tick key={age} age={age} x={x(age)} top={top} bottom={bottom} fontSize={fontSize} />
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
          d={`M ${chart.points.map((p, i) => `${xs[i]},${y(p.value)}`).join(' L ')}`}
          stroke={colors.child}
          strokeWidth={2}
          fill="none"
        />
      ) : null}
      {chart.points.map((p, index) => {
        const active = current === p;
        const cx = xs[index];
        const cy = y(p.value);
        const round = `Đ${p.record.roundIndex || index + 1}`;
        return (
          <G key={`${p.record.id}-${index}`} onPress={() => onSelect(p.record.id)}>
            {/* Vùng bấm rộng hơn chấm tròn để dễ chạm trên điện thoại. */}
            <Circle cx={cx} cy={cy} r={labels ? 14 : 9} fill="transparent" />
            {labels || active ? (
              <>
                <Rect
                  x={cx - (labels ? 15 : 11)}
                  y={cy - (labels ? 30 : 22)}
                  width={labels ? 30 : 22}
                  height={labels ? 17 : 13}
                  rx={3}
                  fill={active ? colors.activeLabel : colors.background}
                  stroke={active ? colors.activeLabel : colors.line}
                  strokeWidth={0.6}
                />
                <SvgText
                  x={cx}
                  y={cy - (labels ? 18 : 12.5)}
                  textAnchor="middle"
                  fontSize={labels ? 10 : 8}
                  fontWeight="600"
                  fill={active ? colors.background : colors.text}>
                  {round}
                </SvgText>
              </>
            ) : null}
            <Circle
              cx={cx}
              cy={cy}
              r={active ? (labels ? 7 : 5) : labels ? 5 : 3.5}
              stroke={colors.background}
              strokeWidth={1.5}
              fill={colors.child}
            />
          </G>
        );
      })}
      <SvgText x={left} y={labels ? 18 : 10} fontSize={fontSize} fill={colors.text}>
        {unit}
      </SvgText>
      <SvgText
        x={(left + right) / 2}
        y={height - 6}
        textAnchor="middle"
        fontSize={fontSize + 1}
        fill={colors.text}>
        {t('Tháng tuổi tại ngày đo')}
      </SvgText>
    </Svg>
  );
}

function GridRow({ label, y, left, right, fontSize }) {
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
      <SvgText x={left - 5} y={y + 3} fontSize={fontSize} textAnchor="end" fill={colors.text}>
        {label}
      </SvgText>
    </>
  );
}

function Tick({ age, x, top, bottom, fontSize }) {
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
      <SvgText x={x} y={bottom + 15} fontSize={fontSize} textAnchor="middle" fill={colors.text}>
        {age}
      </SvgText>
    </>
  );
}
