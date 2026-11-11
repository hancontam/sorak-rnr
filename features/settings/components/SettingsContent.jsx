import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsContent({ children }) {
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-md gap-4 p-4">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
