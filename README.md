# Minimal Template

This is a [React Native](https://reactnative.dev/) project built with [Expo](https://expo.dev/) and [React Native Reusables](https://reactnativereusables.com).

It was initialized using the following command, then the `Minimal (Nativewind)` template was selected when prompted:

```bash
npx @react-native-reusables/cli@latest init
```

## Getting Started

Bản làm lại dùng Expo SDK 57, React Native 0.86.3, NativeWind 4 và RNR.

Trong worktree này, cài dependency theo lockfile và tạo cấu hình local trước lần chạy đầu:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

`EXPO_PUBLIC_API_URL` dùng server test2 trong `.env.example`. `.env.local` không đưa vào Git;
biến có tiền tố `EXPO_PUBLIC_` được đưa vào app, không đặt mật khẩu/token trong đó.
Khởi động lại Expo sau khi thay đổi cấu hình môi trường.

Quy ước và luồng dữ liệu: [AGENTS.md](./AGENTS.md), [docs/architecture.md](./docs/architecture.md).
Các hàm storage mới là nền cho bước auth/Settings, chưa nối lưu phiên hoặc lưu theme vào màn starter.

To run the development server:

```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
```

This will start the Expo Dev Server. Open the app in:

- **iOS**: press `i` to launch in the iOS simulator _(Mac only)_
- **Android**: press `a` to launch in the Android emulator
- **Web**: press `w` to run in a browser

Có thể thử starter bằng [Expo Go](https://expo.dev/go) hỗ trợ SDK 57. Nếu dùng dev client,
cần binary được build với SDK 57; dev client SDK 56 không được cập nhật native module chỉ bằng reload Metro.

Trên máy Windows hiện tại, React Native DevTools còn báo lỗi cài đặt/khởi chạy trong khi Metro
vẫn khởi động và xuất bundle được. Đây là giới hạn của công cụ debug đang được ghi nhận;
chưa xác định nguyên nhân gốc và chưa coi là đã sửa. Không cần sửa source ứng dụng để ẩn thông báo này.

## Adding components

You can add more reusable components using the CLI:

```bash
npx react-native-reusables/cli@latest add [...components]
```

> e.g. `npx react-native-reusables/cli@latest add input textarea`

If you don't specify any component names, you'll be prompted to select which components to add interactively. Use the `--all` flag to install all available components at once.

## Project Features

- ⚛️ Built with [Expo Router](https://expo.dev/router)
- 🎨 Styled with [Tailwind CSS](https://tailwindcss.com/) via [Nativewind](https://www.nativewind.dev/)
- 📦 UI powered by [React Native Reusables](https://github.com/founded-labs/react-native-reusables)
- 🚀 New Architecture enabled
- 🔥 Edge to Edge enabled
- 📱 Runs on iOS, Android, and Web

## Learn More

To dive deeper into the technologies used:

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Nativewind Docs](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com)

## Deploy with EAS

The easiest way to deploy your app is with [Expo Application Services (EAS)](https://expo.dev/eas).

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Updates](https://docs.expo.dev/eas-update/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

If you enjoy using React Native Reusables, please consider giving it a ⭐ on [GitHub](https://github.com/founded-labs/react-native-reusables). Your support means a lot!
