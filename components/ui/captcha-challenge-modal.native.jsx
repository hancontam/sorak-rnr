import { Button } from './button';
import { Text } from './text';
import * as React from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

// The current challenge page drops the error code from its callback. Forward only
// Cloudflare's public error codes; never forward console arguments or tokens.
const CHALLENGE_DIAGNOSTICS = `
(function () {
  function send(message) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  }
  if (!window.__sorakChallengeDiagnostics) {
    window.__sorakChallengeDiagnostics = true;
    ['warn', 'error'].forEach(function (method) {
      var original = console[method];
      console[method] = function () {
        for (var i = 0; i < arguments.length; i++) {
          if (typeof arguments[i] !== 'string') continue;
          var match = arguments[i].match(/\\[Cloudflare Turnstile\\] Error: (\\d{6})/);
          if (match) send({ type: 'TURNSTILE_ERROR', code: match[1] });
        }
        return original.apply(console, arguments);
      };
    });
    window.addEventListener('error', function (event) {
      if (event.target && event.target.tagName === 'SCRIPT' &&
          event.target.src.indexOf('https://challenges.cloudflare.com/') === 0) {
        send({ type: 'TURNSTILE_SCRIPT_ERROR' });
      }
    }, true);
  }
  send({ type: 'TURNSTILE_STATUS', scriptLoaded: !!window.turnstile });
})();
true;
`;

function challengeErrorMessage(code) {
  if (code === '110200') return 'Tên miền xác minh chưa được cho phép trên Cloudflare (110200).';
  if (['110100', '110110', '400020', '400070'].includes(code)) {
    return `Cấu hình xác minh trên server không hợp lệ (${code}).`;
  }
  if (code === '200500')
    return 'Không tải được khung xác minh Cloudflare (200500). Hãy thử lại hoặc đổi mạng.';
  if (code) return `Cloudflare chưa xác minh được thiết bị (mã ${code}). Vui lòng thử lại.`;
  return 'Xác minh chưa thành công. Vui lòng thử lại; trang server chưa cung cấp mã lỗi.';
}

export function CaptchaChallengeModal({ open, challengeUrl, onSuccess, onClose }) {
  const [error, setError] = React.useState('');
  const [reloadKey, setReloadKey] = React.useState(0);
  const accepted = React.useRef(false);
  const webView = React.useRef(null);
  const timeout = React.useRef(null);
  const scriptLoaded = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    accepted.current = false;
    scriptLoaded.current = false;
    setError('');
    timeout.current = setTimeout(() => {
      if (accepted.current) return;
      setError(
        scriptLoaded.current
          ? 'Đã chờ 30 giây nhưng chưa nhận kết quả xác minh. Vui lòng thử lại hoặc đổi mạng.'
          : 'Chưa tải được mã xác minh Cloudflare sau 30 giây. Kiểm tra kết nối mạng rồi thử lại.'
      );
    }, 30000);
    return () => clearTimeout(timeout.current);
  }, [open, challengeUrl, reloadKey]);

  function fail(message) {
    clearTimeout(timeout.current);
    setError(message);
  }

  function handleMessage(event) {
    let message;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message?.type === 'TURNSTILE_STATUS') {
      scriptLoaded.current = message.scriptLoaded === true;
    } else if (message?.type === 'TURNSTILE_SCRIPT_ERROR') {
      fail('Không tải được mã xác minh từ Cloudflare. Kiểm tra kết nối mạng rồi thử lại.');
    } else if (message?.type === 'TURNSTILE_ERROR') {
      const rawCode = String(message.code || message.errorCode || '');
      const code = /^\d{6}$/.test(rawCode) ? rawCode : '';
      fail(challengeErrorMessage(code));
    } else if (
      message?.type === 'TURNSTILE_TOKEN' &&
      typeof message.token === 'string' &&
      message.token.length > 0 &&
      !accepted.current
    ) {
      accepted.current = true;
      clearTimeout(timeout.current);
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
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Đóng xác minh">
              <Text className="text-sm text-brand-link">Đóng</Text>
            </Pressable>
          </View>
          <WebView
            ref={webView}
            key={reloadKey}
            source={{ uri: challengeUrl }}
            onMessage={handleMessage}
            injectedJavaScriptBeforeContentLoaded={CHALLENGE_DIAGNOSTICS}
            injectedJavaScript={CHALLENGE_DIAGNOSTICS}
            onLoadEnd={() => webView.current?.injectJavaScript(CHALLENGE_DIAGNOSTICS)}
            onError={() => fail('Không tải được trang xác minh. Vui lòng thử lại.')}
            onHttpError={(event) => {
              if (event.nativeEvent.url === challengeUrl) {
                fail(
                  `Trang xác minh trả lỗi HTTP ${event.nativeEvent.statusCode}. Vui lòng thử lại.`
                );
              }
            }}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            originWhitelist={['https://*', 'about:blank', 'about:srcdoc']}
            mixedContentMode="never"
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            )}
            style={{ flex: 1, backgroundColor: 'transparent' }}
          />
          {!error ? (
            <View className="mt-3 flex-row items-center justify-center gap-2">
              <ActivityIndicator size="small" />
              <Text className="text-xs text-muted-foreground">Đang chờ kết quả xác minh…</Text>
            </View>
          ) : null}
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
