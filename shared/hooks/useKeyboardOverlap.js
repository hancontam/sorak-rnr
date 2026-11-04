import * as React from 'react';
import { Dimensions, Keyboard, Platform, useWindowDimensions } from 'react-native';

// Dialog portal phủ toàn màn hình ngay cả khi Android co phần nội dung vì bàn phím.
// Đo khoảng từ đỉnh bàn phím đến đáy màn hình để nâng sheet lên đúng chỗ.
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

  const viewportHeight = Platform.OS === 'android' ? Dimensions.get('screen').height : windowHeight;
  return Math.max(0, Math.round(viewportHeight - keyboardTop));
}
