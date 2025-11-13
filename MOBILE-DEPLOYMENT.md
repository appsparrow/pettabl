# Mobile App Deployment Guide

## Overview

DingDongDog mobile app is built with **Expo** (React Native) and can be deployed to:
- 📱 **iOS App Store** (Apple devices)
- 🤖 **Google Play Store** (Android devices)
- 🌐 **Web** (Progressive Web App)

---

## Prerequisites

1. **Expo Account**: Sign up at https://expo.dev/signup
2. **Apple Developer Account** ($99/year): https://developer.apple.com (for iOS)
3. **Google Play Console** ($25 one-time): https://play.google.com/console (for Android)

---

## Current Development Setup

The mobile app is located in `/mobile/` and runs with:

```bash
cd /Users/siva/Documents/GitHub/pettabl/mobile
npx expo start --port 8083
```

Test on:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan QR code with Expo Go app
- **Web Browser**: Press `w`

---

## Deployment Options

### Option 1: Expo Go (Quick Preview)

**Best for**: Testing and sharing with beta users

1. **Install Expo Go**:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Run the app**:
   ```bash
   cd mobile
   npx expo start --port 8083
   ```

3. **Share via QR code** or send link to testers

**Limitations**: Requires Expo Go app, limited native modules

---

### Option 2: Expo EAS Build (Recommended)

**Best for**: Production apps, full native capabilities

#### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

#### Step 2: Initialize EAS

```bash
cd /Users/siva/Documents/GitHub/pettabl/mobile
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

#### Step 3: Configure App

Update `mobile/app.json`:
```json
{
  "expo": {
    "name": "DingDongDog",
    "slug": "dingdongdog",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "ios": {
      "bundleIdentifier": "com.dingdongdog.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "DingDongDog needs access to your photos to upload pet images.",
        "NSCameraUsageDescription": "DingDongDog needs access to your camera to take pet photos."
      }
    },
    "android": {
      "package": "com.dingdongdog.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

#### Step 4: Build for iOS

```bash
eas build --platform ios
```

Options:
- **Development build**: For testing
- **Simulator build**: For Xcode Simulator
- **App Store build**: For production

You'll need:
- Apple Team ID
- App Store Connect API Key (or Apple ID credentials)

#### Step 5: Build for Android

```bash
eas build --platform android
```

Generates an `.apk` (for testing) or `.aab` (for Play Store).

#### Step 6: Submit to Stores

**iOS App Store**:
```bash
eas submit --platform ios
```

**Google Play Store**:
```bash
eas submit --platform android
```

---

### Option 3: Standalone Web Build

Deploy mobile web version to Cloudflare Pages:

```bash
cd mobile
npx expo export --platform web
```

Output goes to `mobile/dist/`. Deploy to Cloudflare Pages following same process as main web app.

---

## Environment Variables for Production

Create `mobile/.env.production`:

```env
# Supabase Production
EXPO_PUBLIC_SUPABASE_URL=https://cxnvsqkeifgbjzrelytl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key

# R2 Production
EXPO_PUBLIC_R2_ACCOUNT_ID=your-account-id
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your-access-key
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your-secret-key
EXPO_PUBLIC_R2_BUCKET_NAME=R2-Pettabl
EXPO_PUBLIC_R2_PUBLIC_URL=your-r2-public-url
EXPO_PUBLIC_R2_ENDPOINT=your-r2-endpoint
```

---

## Testing Before Release

### iOS TestFlight

```bash
eas build --platform ios --profile preview
eas submit --platform ios
```

Testers can install via TestFlight app.

### Android Internal Testing

Upload `.aab` to Play Console → Internal Testing track.

---

## Over-the-Air (OTA) Updates

After initial app store release, push updates without re-submitting:

```bash
cd mobile
eas update --branch production
```

Users get updates automatically on next app launch.

**Note**: Only works for JavaScript/React changes, not native code.

---

## App Store Assets

### Required Images

1. **App Icon** (1024×1024): `mobile/assets/icon.png`
2. **Splash Screen**: `mobile/assets/splash-icon.png`
3. **Screenshots**:
   - iOS: 6.7" (iPhone 14 Pro Max) and 5.5" (iPhone 8 Plus)
   - Android: 5.5" phone and 10" tablet

### App Store Listing

**Name**: DingDongDog

**Subtitle**: Modern Pet Care Coordination

**Description**:
```
DingDongDog makes pet care coordination effortless! Whether you're a pet owner (Fur Boss) or a trusted caretaker (Fur Agent), our app helps you:

🐶 Manage multiple pets with custom profiles
📅 Create smart schedules for feeding, walks, and playtime
📸 Track activities with photo updates and notes
👥 Coordinate seamlessly with caretakers
🔒 Keep your pet's data secure and private

Perfect for:
• Pet owners who travel frequently
• Families sharing pet care responsibilities
• Professional pet sitters and dog walkers
• Anyone who wants organized, transparent pet care

Download now and give your furry friends the care they deserve! 🐾
```

**Keywords**: pet care, dog walker, pet sitter, pet tracker, pet schedule

**Category**: Lifestyle

**Support URL**: https://dingdongdog.com/support

**Privacy Policy URL**: https://dingdongdog.com/privacy

---

## Versioning

Update version numbers in `mobile/app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "ios": {
      "buildNumber": "2"  // iOS build number (increment each build)
    },
    "android": {
      "versionCode": 2   // Android version code (increment each build)
    }
  }
}
```

---

## Cost Estimate

- **Expo EAS Build**: Free tier includes 30 builds/month
- **Apple Developer**: $99/year
- **Google Play Console**: $25 one-time
- **EAS Submit**: Included in free tier
- **EAS Update (OTA)**: Unlimited on free tier

---

## Troubleshooting

### Build Fails

**Error**: Missing credentials
- Run `eas credentials` to configure

**Error**: Invalid bundle identifier
- Ensure `bundleIdentifier` (iOS) and `package` (Android) are unique

### App Rejected

**Common issues**:
- Missing privacy policy URL
- Incomplete App Store Connect metadata
- Screenshots don't match app functionality

### OTA Updates Not Working

- Ensure `runtimeVersion` matches in `app.json`
- Check network connectivity on device
- Verify update was published: `eas update:list`

---

## Monitoring & Analytics

### Expo Analytics

Built into Expo Dashboard: https://expo.dev/accounts/[your-account]/projects/dingdongdog

### Crash Reporting

Consider integrating:
- Sentry: https://sentry.io
- Bugsnag: https://www.bugsnag.com

---

## CI/CD Pipeline (Advanced)

Automate builds with GitHub Actions:

`.github/workflows/mobile-deploy.yml`:
```yaml
name: EAS Build
on:
  push:
    branches:
      - main
    paths:
      - 'mobile/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g eas-cli
      - run: cd mobile && npm install
      - run: eas build --platform all --non-interactive --no-wait
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Next Steps

1. ✅ Test locally with Expo Go
2. 📱 Create Expo account and project
3. 🔨 Run first EAS build
4. 🧪 Distribute via TestFlight/Internal Testing
5. 🚀 Submit to App Store and Play Store
6. 📊 Monitor analytics and crash reports
7. 🔄 Push OTA updates as needed

---

**Need Help?**
- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Store Policies: https://play.google.com/about/developer-content-policy/

