import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'sorak.session.tokens.v1';

async function requireSecureStore() {
  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('Chỉ lưu được đăng nhập trên iOS/Android.');
  }
}

function validateTokens(tokens) {
  if (
    typeof tokens?.accessToken !== 'string' ||
    !tokens.accessToken.trim() ||
    typeof tokens?.refreshToken !== 'string' ||
    !tokens.refreshToken.trim()
  ) {
    throw new Error('Thông tin đăng nhập đã lưu không hợp lệ.');
  }
}

export async function readTokens() {
  await requireSecureStore();
  const value = await SecureStore.getItemAsync(TOKEN_KEY);
  if (value === null) return null;

  let tokens;
  try {
    tokens = JSON.parse(value);
  } catch {
    // Không đưa nội dung token hỏng vào message/log.
    throw new Error('Không đọc được thông tin đăng nhập đã lưu.');
  }

  validateTokens(tokens);
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

export async function writeTokens(tokens) {
  validateTokens(tokens);
  await requireSecureStore();

  // Ghi chung một giá trị để không lưu access token mới với refresh token cũ.
  await SecureStore.setItemAsync(
    TOKEN_KEY,
    JSON.stringify({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
  );
}

export async function clearTokens() {
  await requireSecureStore();
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
