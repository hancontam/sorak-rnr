import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsContent({ children }) {
  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={16}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="mx-auto w-full max-w-md gap-5 px-4 pb-8 pt-4">
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
