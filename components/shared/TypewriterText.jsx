import { useEffect, useRef, useState } from 'react';

import { Text } from '@/components/ui/text';

const TYPE_MS = 55;
const DELETE_MS = 22;

// Chữ chạy như bản Welcome cũ: khi text đổi thì xoá dần câu đang hiện rồi gõ câu mới, con trỏ "|"
// nhấp nháy ở cuối. Trình đọc màn hình nhận cả câu ngay; giảm chuyển động thì hiện đủ câu.
// onComplete chạy khi câu đã gõ xong, để nơi dùng (carousel) chờ người đọc rồi mới đổi câu.
export function TypewriterText({ text, reduceMotion = false, onComplete, ...props }) {
  const [shown, setShown] = useState(reduceMotion ? text : '');
  const completed = useRef(onComplete);
  completed.current = onComplete;
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      setShown(text);
      return undefined;
    }
    if (shown === text) {
      completed.current?.(text);
      return undefined;
    }
    const typing = text.startsWith(shown);
    const timer = setTimeout(
      () => setShown(typing ? text.slice(0, shown.length + 1) : shown.slice(0, -1)),
      typing ? TYPE_MS : DELETE_MS
    );
    return () => clearTimeout(timer);
  }, [reduceMotion, shown, text]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const timer = setInterval(() => setCursor((value) => !value), 530);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <Text {...props} accessibilityLabel={text.replace(/\n/g, ' ')}>
      {/* Con trỏ ẩn ở đầu cân với con trỏ ở cuối để dòng chữ căn giữa không bị lệch. */}
      {/* Màu trùng nền (Android không vẽ trong suốt cho Text lồng trong Text). */}
      {reduceMotion ? null : <Text className="text-background">|</Text>}
      {shown}
      {reduceMotion ? null : <Text className={cursor ? 'text-primary' : 'text-background'}>|</Text>}
    </Text>
  );
}
