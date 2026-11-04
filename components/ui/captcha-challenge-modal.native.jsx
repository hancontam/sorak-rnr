import { Button } from './button';
import { Text } from './text';
import * as React from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

export function CaptchaChallengeModal({ open, challengeUrl, onSuccess, onClose }) {
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  const accepted = React.useRef(false);

  function handleMessage(event) {
    let message;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message?.type === 'TURNSTILE_ERROR') {
      setError('Không xác minh được. Vui lòng thử lại.');
    } else if (
      message?.type === 'TURNSTILE_TOKEN' &&
      typeof message.token === 'string' &&
      message.token.length > 0 &&
      !accepted.current
    ) {
      accepted.current = true;
      onSuccess(message.token);
    }
  }

  function retry() {
    accepted.current = false;
    setError('');
    setReloadKey((key) => key + 1);
  }

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View className="h-[390px] w-full max-w-[420px] overflow-hidden rounded-2xl bg-background p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold">Xác minh bảo mật</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Đóng xác minh">
              <Text className="text-sm text-brand-link">Đóng</Text>
            </Pressable>
          </View>
          <WebView
            key={reloadKey}
            source={{ uri: challengeUrl }}
            onMessage={handleMessage}
            onError={() => setError('Không tải được trang xác minh. Vui lòng thử lại.')}
            onHttpError={() => setError('Trang xác minh đang gặp lỗi. Vui lòng thử lại.')}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="never"
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            )}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
          {error ? (
            <View className="mt-3 gap-2">
              <Text className="text-xs text-destructive">{error}</Text>
              <Button variant="outline" onPress={retry}>
                <Text>Thử lại</Text>
              </Button>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
