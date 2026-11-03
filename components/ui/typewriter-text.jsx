import { Text } from '@/components/ui/text';
import * as React from 'react';

export function TypewriterText({ text, speed = 65, ...props }) {
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    setVisibleCount(0);
    const timer = setInterval(() => {
      setVisibleCount((count) => {
        if (count >= text.length) {
          clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <Text {...props} accessibilityLabel={text}>
      {text.slice(0, visibleCount)}
      {visibleCount < text.length ? '|' : ''}
    </Text>
  );
}
