// Tên font trùng tên file để sau này chuyển sang config plugin expo-font không phải đổi code.
export const FONT_ASSETS = {
  Inter_400Regular: require('@/assets/fonts/Inter_400Regular.ttf'),
  Inter_500Medium: require('@/assets/fonts/Inter_500Medium.ttf'),
  Inter_600SemiBold: require('@/assets/fonts/Inter_600SemiBold.ttf'),
  JetBrainsMono_400Regular: require('@/assets/fonts/JetBrainsMono_400Regular.ttf'),
  JetBrainsMono_500Medium: require('@/assets/fonts/JetBrainsMono_500Medium.ttf'),
  JetBrainsMono_600SemiBold: require('@/assets/fonts/JetBrainsMono_600SemiBold.ttf'),
};

// Chưa có file Inter 700, nên font-bold dùng tạm SemiBold thay vì để Android tự làm đậm giả.
const FAMILIES = {
  sans: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_600SemiBold',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
    semibold: 'JetBrainsMono_600SemiBold',
    bold: 'JetBrainsMono_600SemiBold',
  },
};

const WEIGHT_PATTERN = /(?:^|\s)font-(medium|semibold|bold|extrabold|black)(?=\s|$)/;
const MONO_PATTERN = /(?:^|\s)font-mono(?=\s|$)/;

// Android không tự chọn file font theo fontWeight, nên quy class Tailwind về đúng file Inter/JetBrains Mono.
export function fontStyle(className = '') {
  const weight = className.match(WEIGHT_PATTERN)?.[1];
  const key =
    weight === 'medium'
      ? 'medium'
      : weight === 'semibold'
        ? 'semibold'
        : weight
          ? 'bold'
          : 'regular';
  const family = MONO_PATTERN.test(className) ? FAMILIES.mono : FAMILIES.sans;
  // Đặt fontWeight normal để trình duyệt/Android không làm đậm giả thêm lên file đã đúng độ đậm.
  return { fontFamily: family[key], fontWeight: 'normal' };
}

export const FONT_FAMILY = FAMILIES;
