import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import {
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  HeartPulse,
  LayoutGrid,
  ListChecks,
  UserRoundCheck,
} from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { Carousel } from 'react-native-reanimated-carousel';
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const TAB_VALUES = ['report', 'daily', 'assessment'];
const INACTIVE_WIDTH = 60;
const TAB_GAP = 8;
const TRANSITION_DURATION = 260;

const RECORD_ITEMS = [
  { label: 'Ghi nhận điểm danh', icon: CalendarCheck2 },
  { label: 'Ghi nhận đón trẻ', icon: UserRoundCheck },
  { label: 'Ghi nhận sức khoẻ', icon: HeartPulse },
];

function DailyRecordMenu() {
  return (
    <View className="absolute left-0 right-0 top-14 z-20 border border-border bg-popover px-6 py-2 shadow-lg shadow-black/15">
      {RECORD_ITEMS.map(({ label, icon }) => (
        <View key={label} className="h-10 flex-row items-center gap-3 rounded-md pl-4 pr-2">
          <Icon as={icon} size={16} strokeWidth={2} className="text-foreground" />
          <Text className="flex-1 text-sm font-medium text-popover-foreground">{label}</Text>
          <Icon as={ChevronRight} size={14} strokeWidth={2} className="text-foreground" />
        </View>
      ))}
    </View>
  );
}

function HomeTabButton({
  index,
  label,
  labelWidth,
  icon,
  progress,
  activeWidth,
  onPress,
  onMenuPress,
  selected,
  isParent,
}) {
  const showMenu = index === 1 && selected && !isParent;

  const animatedWidth = useAnimatedStyle(() => {
    const activeAmount = Math.max(0, 1 - Math.abs(progress.value - index));
    return { width: interpolate(activeAmount, [0, 1], [INACTIVE_WIDTH, activeWidth]) };
  }, [activeWidth, index]);

  const activeLayerStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - Math.abs(progress.value - index)),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.max(0, 1 - Math.abs(progress.value - index)), [0, 1], [0.55, 1]),
  }));

  const labelStyle = useAnimatedStyle(() => {
    const activeAmount = Math.max(0, 1 - Math.abs(progress.value - index));
    return {
      width: interpolate(
        activeAmount,
        [0, 1],
        [0, Math.min(labelWidth, Math.max(0, activeWidth - (index === 1 && !isParent ? 68 : 40)))]
      ),
      marginLeft: interpolate(activeAmount, [0, 1], [0, 8]),
      opacity: activeAmount,
    };
  }, [activeWidth, index, isParent, labelWidth]);

  return (
    <Animated.View style={animatedWidth} className="h-10 overflow-hidden rounded-lg bg-muted">
      <Animated.View
        style={activeLayerStyle}
        className="absolute inset-0 rounded-lg bg-muted shadow-sm shadow-black/5"
      />
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        className="h-full w-full flex-row items-center justify-center">
        <Animated.View style={iconStyle}>
          <Icon as={icon} size={16} strokeWidth={2} className="text-foreground" />
        </Animated.View>
        <Animated.View style={labelStyle} className="overflow-hidden">
          <Text className="text-[13px] font-medium text-foreground" numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
      {showMenu ? (
        <Pressable
          onPress={onMenuPress}
          accessibilityRole="button"
          accessibilityLabel="Mở menu ghi nhận"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 8,
            width: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon as={ChevronDown} size={16} strokeWidth={2} className="text-foreground" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

export function HomeSectionTabs({ isParent, children }) {
  const carouselRef = React.useRef(null);
  const progress = useSharedValue(1);
  const { width } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const slides = React.Children.toArray(children);
  const navWidth = width - 48;
  const activeWidth = Math.max(INACTIVE_WIDTH, navWidth - INACTIVE_WIDTH * 2 - TAB_GAP * 2);
  const sections = [
    { label: 'Báo cáo', labelWidth: 52, icon: LayoutGrid },
    { label: 'Nhật ký ngày', labelWidth: 88, icon: CalendarDays },
    {
      label: isParent ? 'Kết quả đánh giá' : 'Đánh giá giai đoạn',
      labelWidth: isParent ? 116 : 130,
      icon: ListChecks,
    },
  ];

  return (
    <View className="flex-1">
      <View className="mx-6 mt-2 h-10 flex-row" style={{ gap: TAB_GAP }}>
        {sections.map((section, index) => (
          <HomeTabButton
            key={TAB_VALUES[index]}
            index={index}
            label={section.label}
            labelWidth={section.labelWidth}
            icon={section.icon}
            progress={progress}
            activeWidth={activeWidth}
            selected={selectedIndex === index}
            isParent={isParent}
            onPress={() => {
              setMenuOpen(false);
              carouselRef.current?.scrollTo({ index });
            }}
            onMenuPress={() => setMenuOpen((open) => !open)}
          />
        ))}
      </View>
      <Carousel
        ref={carouselRef}
        style={{ flex: 1, width: '100%' }}
        data={TAB_VALUES}
        defaultIndex={1}
        loop={false}
        progress={progress}
        animation={{ type: 'timing', duration: TRANSITION_DURATION }}
        onSnapToItem={(index) => {
          setSelectedIndex(index);
          setMenuOpen(false);
        }}
        keyExtractor={(item) => item}
        renderItem={({ index }) => <View className="flex-1 px-6 pt-6">{slides[index]}</View>}
      />
      {menuOpen ? (
        <>
          <Pressable
            onPress={() => setMenuOpen(false)}
            accessibilityLabel="Đóng menu ghi nhận"
            style={{ position: 'absolute', top: 56, left: 0, right: 0, bottom: 0, zIndex: 10 }}
          />
          <DailyRecordMenu />
        </>
      ) : null}
    </View>
  );
}
