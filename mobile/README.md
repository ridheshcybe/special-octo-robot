# PrepMeUp AI — Universal React Native App (Android, iOS & Web)

Universal **Android, iOS & Web** application for **PrepMeUp AI** (`https://www.prepmeupai.in`), built with **Expo SDK 52 + React Native + React Native Web + Expo Router** in the calm light academic theme (`#FAF9F6` / `#C2331B`).

---

## Features Included (Android, iOS & Web)
1. **Universal 5-Tab Navigation**:
   - **Home**: Student welcome dashboard, Semester 1 Free status, "Continue where you left off", live Daily Revision Capsule (`/api/prepmeup/daily-note`), and Study Workbench shortcuts.
   - **Subjects**: Offline-ready catalog of all 6 Semester 1 B.Tech CSE AI/ML subjects (`CSE1001`–`CSE1006`) with module accordions, topic breakdowns, and interactive simulator launchers.
   - **AI Tutor**: 24/7 syllabus-grounded AI Doubt Copilot connected to `/api/prepmeup/doubts` with subject chips and quick prompts.
   - **Tracks**: Multi-track directory showing B.Tech CSE AI/ML (Live & Free) plus CyberSecurity & Cloud Computing (AWS) marked as *"Under construction • Coming soon"*.
   - **Account**: Passwordless 6-digit Email/Phone OTP sign-in (`/api/prepmeup/auth/send-otp` & `/api/prepmeup/auth/verify-otp`) persisted securely with `expo-secure-store` on iOS/Android and `localStorage` on Web.
2. **In-App LaTeX & Simulator Bridge (`app/webview.tsx`)**:
   - Renders full KaTeX mathematical derivations, 17 HTML5 engineering simulators, and the Python 3.12 coding workbench via native `WebView` on iOS/Android and an embedded `<iframe>` with external tab launcher on Web.

---

## 1. Run Locally (Android, iOS & Web)

```bash
cd mobile
npm install
npx expo start
```

- Press **`w`** to open in your **Web Browser** (`npm run web`).
- Press **`a`** to open in **Android Emulator** (or scan the QR code with Expo Go on Android).
- Press **`i`** to open in **iOS Simulator** (or scan the QR code with the Camera app on iPhone).

---

## 2. Export Static Web Bundle

To build a production static web bundle (`mobile/dist/`) from the React Native codebase:
```bash
cd mobile
npm run build:web
```

---

## 3. Build & Ship for Android (APK & Google Play Store AAB)

Install the EAS CLI once:
```bash
npm install -g eas-cli
eas login
```

### Generate an installable Android APK (for direct testing / sharing):
```bash
cd mobile
npm run build:android:apk
```

### Generate a Production Android App Bundle (`.aab`) for Google Play Console:
```bash
cd mobile
npm run build:android:aab
```

---

## 4. Build & Ship for iOS (Apple App Store / TestFlight)

```bash
cd mobile
npm run build:ios
```
