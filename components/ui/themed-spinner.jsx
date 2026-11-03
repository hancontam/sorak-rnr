import { useColorScheme } from 'nativewind';
import { ActivityIndicator } from 'react-native';

export function ThemedSpinner() {
  const { colorScheme } = useColorScheme();
  return <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#fafafa' : '#09090b'} />;
}
