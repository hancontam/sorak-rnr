import { ArrowUpRight, CircleAlert, LockKeyhole, RotateCw } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { WebView } from 'react-native-webview';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/shared/i18n/useLanguage';

import { roleLabel } from '../utils/auth-roles';

const CLOUDFLARE_ORIGIN = 'https://challenges.cloudflare.com';
const SCHOOL_PHOTO = require('@/assets/images/auth-webview-school.jpg');
const CONFIRM_WINDOW_MS = 5 * 60_000;
const EXPIRED_MESSAGE = 'Mã xác minh đã hết hạn. Tải lại để xác minh tiếp.';

export function TurnstileChallenge({ url, role, account, typography, onVerified, onClose }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      visible
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView edges={['top']} className="flex-1 bg-black/50 pt-2">
        <SafeAreaView
          edges={['bottom']}
          accessibilityViewIsModal
          className="mx-auto w-full max-w-lg flex-1 overflow-hidden rounded-t-[28px] border-t border-border bg-background">
          <ChallengeAttempt
            key={attempt}
            url={url}
            role={role}
            account={account}
            typography={typography}
            onVerified={onVerified}
            onClose={onClose}
            onRetry={() => setAttempt((key) => key + 1)}
          />
        </SafeAreaView>
      </SafeAreaView>
    </Modal>
  );
}

function ChallengeAttempt({ url, role, account, typography, onVerified, onClose, onRetry }) {
  const t = useTranslation();
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const settled = useRef(false);
  const pendingToken = useRef(null);
  const { host, origin } = new URL(url);
  const source = useMemo(
    () => ({ uri: url, headers: { 'X-Client-Platform': Platform.OS } }),
    [url]
  );

  function fail(message) {
    if (settled.current) return;
    settled.current = true;
    setError(message);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fail(t('Chưa nhận được kết quả xác minh. Kiểm tra kết nối rồi thử lại.'));
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!verified) return;
    const timer = setTimeout(() => {
      pendingToken.current = null;
      setError(EXPIRED_MESSAGE);
    }, CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [verified]);

  function restart() {
    settled.current = true;
    pendingToken.current = null;
    onRetry();
  }

  function confirm() {
    const token = pendingToken.current;
    if (!token) return;
    pendingToken.current = null;
    if (Date.now() >= token.expiresAt) {
      setError(EXPIRED_MESSAGE);
      return;
    }
    onVerified(token.value);
  }

  function handleMessage({ nativeEvent }) {
    // Android có thể gửi origin thay cho URL trang trong WebMessageListener.
    const fromChallenge =
      nativeEvent.url === url || (Platform.OS === 'android' && nativeEvent.url === origin);
    if (settled.current || !fromChallenge) return;

    let message;
    try {
      message = JSON.parse(nativeEvent.data);
    } catch {
      return;
    }
    if (message?.type === 'TURNSTILE_ERROR') {
      fail(t('Xác minh bảo mật chưa thành công. Vui lòng thử lại.'));
    } else if (
      message?.type === 'TURNSTILE_TOKEN' &&
      typeof message.token === 'string' &&
      message.token.trim()
    ) {
      settled.current = true;
      pendingToken.current = { value: message.token, expiresAt: Date.now() + CONFIRM_WINDOW_MS };
      setVerified(true);
    }
  }

  const waiting = !verified && !error;

  return (
    <>
      <BrowserBar host={host} typography={typography} onClose={onClose} onReload={restart} />
      <Progress
        className="h-0.5 rounded-none"
        value={verified ? 100 : progress}
        accessibilityLabel={t('Tiến trình tải trang xác minh')}
      />
      <ScrollView className="flex-1" contentContainerClassName="gap-4 py-4" nestedScrollEnabled>
        <View className="gap-4 px-4">
          <SchoolBanner typography={typography} />
          <Card className="gap-3 rounded-2xl bg-muted/30 py-4 shadow-none">
            <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 px-4">
              <CardTitle className="text-xs" style={typography.semiBold}>
                {t('Xác nhận quyền truy cập')}
              </CardTitle>
              <Badge>
                <Text className="text-[10px]" style={typography.monoSemiBold}>
                  {t(roleLabel(role))}
                </Text>
              </Badge>
            </CardHeader>
            <CardContent className="gap-3 px-4">
              <View className="gap-1.5 rounded-xl border border-border bg-background p-3">
                <View className="flex-row justify-between gap-3">
                  <Text className="text-xs text-muted-foreground" style={typography.mono}>
                    {t('Tài khoản')}
                  </Text>
                  <Text
                    className="min-w-0 flex-1 text-right text-xs"
                    style={typography.monoSemiBold}
                    numberOfLines={1}>
                    {account}
                  </Text>
                </View>
                <View className="flex-row justify-between gap-3">
                  <Text className="text-xs text-muted-foreground" style={typography.mono}>
                    {t('Trường')}
                  </Text>
                  <Text className="text-right text-xs" style={typography.mono}>
                    {t('MN Hòn Tre')}
                  </Text>
                </View>
              </View>
              {verified && !error ? (
                <Button size="sm" className="h-auto min-h-9 rounded-xl py-2" onPress={confirm}>
                  <Text className="text-xs" style={typography.semiBold}>
                    {t('Cho phép & Tiếp tục vào Sorak')}
                  </Text>
                  <Icon as={ArrowUpRight} size={14} />
                </Button>
              ) : null}
              {error ? (
                <>
                  <Alert icon={CircleAlert} variant="destructive">
                    <AlertTitle className="text-sm leading-5" style={typography.semiBold}>
                      {t('Chưa xác minh được')}
                    </AlertTitle>
                    <AlertDescription className="text-xs leading-4" style={typography.regular}>
                      {t(error)}
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" size="sm" onPress={restart}>
                    <Text className="text-xs" style={typography.medium}>
                      {t('Thử lại')}
                    </Text>
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>
        </View>
        {waiting ? (
          <View className="h-[352px]">
            <WebView
              source={source}
              onMessage={handleMessage}
              onLoadProgress={({ nativeEvent }) => {
                if (!settled.current) setProgress(Math.round(nativeEvent.progress * 100));
              }}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={({ url: nextUrl, isTopFrame }) =>
                nextUrl === url ||
                (isTopFrame !== true &&
                  (nextUrl === 'about:blank' ||
                    nextUrl === 'about:srcdoc' ||
                    nextUrl.startsWith(`${CLOUDFLARE_ORIGIN}/`)))
              }
              onError={() => fail(t('Không tải được trang xác minh. Vui lòng thử lại.'))}
              onHttpError={({ nativeEvent }) => {
                if (nativeEvent.url === url) fail(t('Máy chủ xác minh chưa phản hồi thành công.'));
              }}
              javaScriptEnabled
              domStorageEnabled
              mixedContentMode="never"
              setSupportMultipleWindows={false}
              nestedScrollEnabled
              style={{ flex: 1 }}
            />
          </View>
        ) : null}
      </ScrollView>
      <View className="mx-4 flex-row items-center justify-center gap-2 border-t border-border py-2.5">
        {waiting ? <ActivityIndicator size="small" /> : null}
        <Text className="text-[10px] text-muted-foreground" style={typography.mono}>
          Cloudflare Turnstile
        </Text>
      </View>
    </>
  );
}

function BrowserBar({ host, typography, onClose, onReload }) {
  const t = useTranslation();
  return (
    <View className="flex-row items-center gap-2 border-b border-border bg-muted/60 px-2 py-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        hitSlop={6}
        onPress={onClose}
        accessibilityLabel={t('Đóng xác minh')}>
        <Text className="text-xs" style={typography.semiBold}>
          {t('Đóng')}
        </Text>
      </Button>
      <View className="min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5">
        <Icon as={LockKeyhole} size={13} className="text-muted-foreground" />
        <Text
          className="shrink text-[10px]"
          style={typography.mono}
          numberOfLines={1}
          accessibilityLabel={t('Địa chỉ xác minh {host}', { host })}>
          {host}
        </Text>
      </View>
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        hitSlop={6}
        onPress={onReload}
        accessibilityLabel={t('Tải lại trang xác minh')}>
        <Icon as={RotateCw} size={16} className="text-muted-foreground" />
      </Button>
    </View>
  );
}

function SchoolBanner({ typography }) {
  const t = useTranslation();
  return (
    <View className="h-32 overflow-hidden rounded-2xl border border-border bg-muted">
      <Image source={SCHOOL_PHOTO} className="absolute inset-0 h-full w-full" resizeMode="cover" />
      <Svg pointerEvents="none" width="100%" height="100%" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="schoolShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0" stopColor="black" stopOpacity={0} />
            <Stop offset="0.5" stopColor="black" stopOpacity={0.25} />
            <Stop offset="1" stopColor="black" stopOpacity={0.8} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#schoolShade)" />
      </Svg>
      <View className="flex-1 items-start justify-end gap-1 p-3">
        <Badge variant="secondary">
          <Text className="text-[10px]" style={typography.monoSemiBold}>
            {t('Xác minh bảo mật')}
          </Text>
        </Badge>
        <Text className="text-xs text-white" style={typography.semiBold}>
          {t('Cổng xác thực Trường Mầm Non Hòn Tre')}
        </Text>
      </View>
    </View>
  );
}
