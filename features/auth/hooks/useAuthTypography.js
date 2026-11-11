import { useFonts } from 'expo-font';
import { Platform } from 'react-native';

const fonts = {
  AuthInterRegular: require('@/assets/fonts/Inter_400Regular.ttf'),
  AuthInterMedium: require('@/assets/fonts/Inter_500Medium.ttf'),
  AuthInterSemiBold: require('@/assets/fonts/Inter_600SemiBold.ttf'),
  AuthMonoRegular: require('@/assets/fonts/JetBrainsMono_400Regular.ttf'),
  AuthMonoMedium: require('@/assets/fonts/JetBrainsMono_500Medium.ttf'),
  AuthMonoSemiBold: require('@/assets/fonts/JetBrainsMono_600SemiBold.ttf'),
};

const prototype = {
  regular: { fontFamily: 'AuthInterRegular' },
  medium: { fontFamily: 'AuthInterMedium' },
  semiBold: { fontFamily: 'AuthInterSemiBold' },
  mono: { fontFamily: 'AuthMonoRegular' },
  monoMedium: { fontFamily: 'AuthMonoMedium' },
  monoSemiBold: { fontFamily: 'AuthMonoSemiBold' },
};

const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const fallback = {
  regular: undefined,
  medium: { fontWeight: '500' },
  semiBold: { fontWeight: '600' },
  mono: { fontFamily: mono },
  monoMedium: { fontFamily: mono, fontWeight: '500' },
  monoSemiBold: { fontFamily: mono, fontWeight: '600' },
};

export function useAuthTypography() {
  const [loaded] = useFonts(fonts);
  return loaded ? prototype : fallback;
}
