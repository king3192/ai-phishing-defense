# 📱 PhishGuard AI — Native Android WebView Mobile App

An enterprise-grade, native Android WebView application wrapping the **AI Phishing Defense Platform** web app. Any UI or feature updates deployed to the web frontend appear in this application automatically without requiring an app store update.

---

## 🏗️ Architecture & Core Features

- **Language & Framework:** Native Kotlin, Android Studio, Gradle Kotlin DSL (`.kts`), AndroidX, Material 3.
- **SDK Targets:** `minSdk 24` (Android 7.0 Nougat), `targetSdk 35` (Android 15), `compileSdk 35`.
- **Full-Screen Immersive Layout:** Edge-to-edge system bars integration (`WindowCompat.setDecorFitsSystemWindows`), safe-area inset preservation for display notches and gesture navigation.
- **Security & Navigation Sandbox:**
  - Allowed hosts enforcement (`UrlPolicy`): strictly prevents navigation to untrusted external URLs inside the WebView.
  - Phishing link quarantine: all suspicious URLs scanned by users open exclusively in external system browsers.
  - Prohibited file scheme access: `setAllowFileAccess(false)`, `setAllowContentAccess(false)`.
  - Blocked mixed content in release mode.
  - Cleartext HTTP traffic completely disabled in release builds.
- **Hardware & Web API Integrations:**
  - **Live Camera QR Scanning:** `getUserMedia` bridged through `WebChromeClient.onPermissionRequest` and runtime camera permission handling.
  - **File & Document Uploads:** `<input type="file">` handled via `WebChromeClient.onShowFileChooser` supporting gallery, camera capture, and file attachments (images, CSV, PDF).
  - **Authenticated Report Downloads (PDF/CSV):** Authenticated cookie pass-through to native `DownloadManager` and client-side `blob:` interceptor via `JsBridge.downloadBlob` (saving to `MediaStore.Downloads`).
  - **Share Target Intent:** Registered for `android.intent.action.SEND` (`text/plain`) so users can long-press suspicious SMS or WhatsApp messages in other apps and tap **Share → PhishGuard AI** to prefill the scanner.
  - **Deep Linking / App Links:** Auto-verification for `https://ai-phishing-defense.vercel.app` routes.
- **Resilience & Offline Handling:**
  - `NetworkMonitor` with `ConnectivityManager.NetworkCallback`.
  - Custom native "No Internet Connection" overlay with automated reconnection recovery.
  - Pull-to-refresh (`SwipeRefreshLayout`) locked to top scroll position (`scrollY == 0`).
  - Double-tap back button to exit.
  - Process death and configuration change state restoration (`saveState` / `restoreState`).

---

## ⚙️ Configuration Reference

All mobile configuration values are centralized in `app/build.gradle.kts` and `res/values/config.xml`:

| Setting | Location | Production Value | Emulator / Local Dev |
|---|---|---|---|
| **App Name** | `config.xml` & `build.gradle.kts` | `PhishGuard AI` | `PhishGuard AI (Debug)` |
| **Application ID** | `app/build.gradle.kts` | `com.phishguard.ai` | `com.phishguard.ai` |
| **`BASE_URL` (Prod)** | `buildConfigField` / `config.xml` | `https://ai-phishing-defense.vercel.app/` | `https://ai-phishing-defense.vercel.app/` |
| **`DEBUG_BASE_URL`** | `buildConfigField` / `config.xml` | `http://10.0.2.2:5173/` | `http://10.0.2.2:5173/` |
| **User-Agent Suffix** | `buildConfigField` | `PhishGuardAndroidApp/1.0` | `PhishGuardAndroidApp/1.0` |
| **FLAG_SECURE** | `res/values/config.xml` | `false` (set `true` to block screenshots) | `false` |
| **Allowed Hosts** | `buildConfigField` / `config.xml` | `ai-phishing-defense.vercel.app`, `ai-phishing-defense.onrender.com` | `10.0.2.2`, `localhost`, `127.0.0.1` |

---

## 🚀 How to Open and Run

### 1. Open in Android Studio
1. Launch **Android Studio** (Ladybug, Koala, or Iguana).
2. Select **File → Open...** and navigate to the `android/` directory inside this repository.
3. Allow Gradle to sync dependencies automatically.

### 2. Run on an Android Emulator
1. Start an Android Virtual Device (AVD) running API 24 to API 35.
2. Select the `app` run configuration.
3. Click the green **Run (▶)** button.
4. The app will launch with the branded dark-navy splash screen and load `https://ai-phishing-defense.vercel.app/`.

### 3. Run on a Physical Device
1. Enable **Developer Options** and **USB Debugging** on your Android device:
   - Go to **Settings → About Phone** and tap **Build Number** 7 times.
   - Go to **Settings → System → Developer options** and toggle on **USB Debugging**.
2. Connect your device to your computer via USB.
3. Select your physical phone in the device dropdown and click **Run (▶)**.

---

## 🔑 Building a Signed Release APK / AAB

### Step 1: Generate a Release Keystore
Run the following command in PowerShell / Terminal (replace with your secure password):

```bash
keytool -genkeypair -v -keystore phishguard-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias phishguard -storepass YourSecurePassword123 -keypass YourSecurePassword123 -dname "CN=PhishGuard, OU=Security, O=AI Phishing Defense, L=Tokyo, C=JP"
```

### Step 2: Configure Credentials in `local.properties`
Open or create `android/local.properties` (this file is excluded by `.gitignore` and will never be committed):

```properties
RELEASE_STORE_FILE=../phishguard-release.jks
RELEASE_STORE_PASSWORD=YourSecurePassword123
RELEASE_KEY_ALIAS=phishguard
RELEASE_KEY_PASSWORD=YourSecurePassword123
```

*(Alternatively, you can export these as environment variables on your CI/CD server: `RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, `RELEASE_KEY_PASSWORD`)*.

### Step 3: Build the Release Binaries
Navigate to the `android/` folder:

```bash
# Build Signed Release APK
./gradlew assembleRelease

# Build Google Play App Bundle (AAB)
./gradlew bundleRelease
```

Generated binaries will be located at:
- **Release APK:** `app/build/outputs/apk/release/app-release.apk`
- **Release AAB:** `app/build/outputs/bundle/release/app-release.aab`

---

## 🔔 Firebase Cloud Messaging (FCM) Push Notifications

Push notification handling is pre-wired in `AppFirebaseMessagingService.kt` and isolated so the app compiles and runs cleanly with or without Firebase:

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Add an Android app with package name `com.phishguard.ai`.
3. Download `google-services.json` and place it in the `android/app/` directory:
   ```
   android/app/google-services.json
   ```
4. The build script automatically detects the file and applies the Google Services Gradle plugin.

---

## 🛠️ Troubleshooting Guide

### 1. Blank White Page on Launch
- **Cause:** Backend server is asleep or initial cold start delay on free tier.
- **Fix:** The app shows `ServerWakeBanner` during cold start. Ensure your device has internet access and verify the backend responds at `https://ai-phishing-defense.onrender.com/health`.

### 2. Camera Not Opening for QR Scanner
- **Cause:** Android runtime permission was denied or dismissed.
- **Fix:** Open **Settings → Apps → PhishGuard AI → Permissions → Camera** and select **Allow while using the app**.

### 3. PDF / CSV Report Downloads Failing
- **Cause:** Storage permissions on older devices (Android 9 or below).
- **Fix:** On Android 10+, files are saved via `MediaStore.Downloads` without needing storage permissions. On Android 9 and older, grant Storage permission when prompted.

### 4. Cleartext Traffic Blocked Error (in Local Dev)
- **Cause:** Trying to load `http://` URLs in a release build.
- **Fix:** Release builds strictly require HTTPS. To test local HTTP servers (like `http://10.0.2.2:5173`), build using the `debug` build variant.
