# 小手机安装包导出

这个目录是“小手机”的 Expo 安装壳，不影响原来的 Vite 项目继续开发。

当前做法：

- 原项目继续在上一级目录开发。
- 每次需要导出时，先运行 `refresh-web.ps1`，它会重新构建上一级 Vite 项目，并把 `dist` 内嵌到 Expo WebView。
- Android 安装包用 EAS 云构建生成 APK。
- iOS 安装包需要 Apple 开发者账号签名，建议走 EAS + TestFlight。

## Android APK

先登录 Expo：

```powershell
npx eas-cli login
```

然后运行：

```powershell
.\build-android-apk.ps1
```

构建完成后，EAS 会给一个 APK 下载链接，下载到手机即可安装。

## iOS

iOS 不能像 Android 一样随便给一个通用安装包。需要 Apple 开发者账号、证书和设备/TestFlight。

```powershell
npx eas-cli login
.\build-ios.ps1
```

## 后续继续开发

以后继续改上一级 `src` 即可。要导出新版本时，再进这个目录运行：

```powershell
.\refresh-web.ps1
.\build-android-apk.ps1
```
