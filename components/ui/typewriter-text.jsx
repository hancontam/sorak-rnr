import { Text } from '@/components/ui/text';
import * as React from 'react';

export function TypewriterText({ lines, ...props }) {
  const [lineIndex, setLineIndex] = React.useState(0);
  const [visibleCount, setVisibleCount] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);
  const currentLine = lines[lineIndex];

  React.useEffect(() => {
    let delay = deleting ? 55 : 110;
    if (deleting && visibleCount === 0) delay = 350;
    if (!deleting && visibleCount === currentLine.length) delay = 1700;
    const timer = setTimeout(() => {
      if (deleting) {
        if (visibleCount > 0) setVisibleCount(visibleCount - 1);
        else {
          setDeleting(false);
          setLineIndex((lineIndex + 1) % lines.length);
        }
      } else if (visibleCount < currentLine.length) {
        setVisibleCount(visibleCount + 1);
      } else {
        setDeleting(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentLine, deleting, lineIndex, lines, visibleCount]);

  return (
    <Text {...props} accessibilityLabel={currentLine}>
      {currentLine.slice(0, visibleCount)}|
    </Text>
  );
}
