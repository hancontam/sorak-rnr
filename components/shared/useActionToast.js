import { useEffect, useRef } from 'react';
import { toast } from 'sonner-native';

// Hiện kết quả thao tác ({ text, values, error }) từ hook bằng toast chung, mỗi kết quả một lần.
export function useActionToast(message, translate) {
  const last = useRef(null);
  useEffect(() => {
    if (!message || message === last.current) return;
    last.current = message;
    const text = translate(message.text, message.values);
    if (message.error) toast.error(text);
    else if (message.info) toast(text);
    else toast.success(text);
  }, [message, translate]);
}
