import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { SORAK_BOTTOM, SORAK_MIDDLE, SORAK_TOP, sorakSvg } from '@/components/shared/SorakLogo';

// Khớp splash native (expo-splash-screen): nền trắng, logo ~70 dp giữa màn = SVG 42 khung ở 95 dp.
const LOGO = 95;
const SPLASH_BACKGROUND = '#ffffff';
const MIN_VISIBLE_MS = 700;
const ease = Easing.inOut(Easing.quad);

/**
 * Lớp splash bằng JS nối tiếp splash native: logo "thở" khi app đang nạp font và khôi phục phiên,
 * khi `ready` thì 3 khối khớp lại rồi lớp này mờ dần để lộ app.
 */
export function AnimatedSplash({ ready, onShown }) {
  const reduceMotion = useReducedMotion();
  const [done, setDone] = useState(false);
  const shownAt = useRef(0);
  const spread = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    spread.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: ease }),
        withTiming(0, { duration: 520, easing: ease })
      ),
      -1
    );
    return () => cancelAnimation(spread);
  }, [reduceMotion, spread]);

  useEffect(() => {
    if (!ready || done) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const timer = setTimeout(() => {
      cancelAnimation(spread);
      const finish = () => setDone(true);
      if (reduceMotion) {
        opacity.value = withTiming(0, { duration: 180 }, (ok) => ok && runOnJS(finish)());
        return;
      }
      spread.value = withSpring(-0.35, { damping: 14, stiffness: 220 });
      scale.value = withDelay(140, withTiming(1.08, { duration: 260, easing: ease }));
      opacity.value = withDelay(
        180,
        withTiming(0, { duration: 280, easing: ease }, (ok) => ok && runOnJS(finish)())
      );
    }, wait);
    return () => clearTimeout(timer);
  }, [done, opacity, ready, reduceMotion, scale, spread]);

  const container = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logo = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const top = useAnimatedStyle(() => ({
    transform: [{ translateX: spread.value * 4 }, { translateY: spread.value * -4 }],
  }));
  const bottom = useAnimatedStyle(() => ({
    transform: [{ translateX: spread.value * -4 }, { translateY: spread.value * 4 }],
  }));
  const middle = useAnimatedStyle(() => ({ opacity: 1 - Math.max(0, spread.value) * 0.45 }));

  if (done) return null;
  return (
    <Animated.View
      pointerEvents={ready ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, styles.root, container]}
      onLayout={() => {
        if (!shownAt.current) {
          shownAt.current = Date.now();
          onShown?.();
        }
      }}
      accessibilityRole="progressbar"
      accessibilityLabel="Sorak">
      <Animated.View style={[styles.logo, logo]}>
        <Animated.View style={[StyleSheet.absoluteFill, bottom]}>
          <SvgXml xml={sorakSvg(SORAK_BOTTOM)} width={LOGO} height={LOGO} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, top]}>
          <SvgXml xml={sorakSvg(SORAK_TOP)} width={LOGO} height={LOGO} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, middle]}>
          <SvgXml xml={sorakSvg(SORAK_MIDDLE)} width={LOGO} height={LOGO} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 1000,
    elevation: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BACKGROUND,
  },
  logo: { width: LOGO, height: LOGO },
});
