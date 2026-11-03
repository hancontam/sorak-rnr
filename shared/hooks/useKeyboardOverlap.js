import * as React from 'react';
import { Keyboard, Platform, useWindowDimensions } from 'react-native';

// PortalHost nằm ngoài KeyboardAvoidingView. Android adjustResize đã co cửa sổ,
// còn iOS có thể để bàn phím phủ lên sheet; chỉ bù phần chiều cao thật sự bị che.
export function useKeyboardOverlap(enabled) {
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardTop, setKeyboardTop] = React.useState(null);

  React.useEffect(() => {
    if (!enabled) {
      setKeyboardTop(null);
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const top = event.endCoordinates?.screenY;
      setKeyboardTop(typeof top === 'number' ? top : null);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardTop(null));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [enabled]);

  if (keyboardTop == null) return 0;

  return Math.max(0, Math.round(windowHeight - keyboardTop));
}
