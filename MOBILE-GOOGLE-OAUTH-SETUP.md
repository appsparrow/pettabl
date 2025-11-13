# Mobile Google OAuth Setup (iOS & Android)

## ⚠️ Important: Mobile ≠ Web

Mobile apps need **different OAuth credentials** and **native configuration** compared to web apps.

---

## Option 1: Expo AuthSession (Recommended for Development)

This works with Expo Go and is easiest for testing.

### Step 1: Install Required Packages

```bash
cd mobile
npx expo install expo-auth-session expo-web-browser expo-crypto
```

### Step 2: Update mobile/App.tsx

Replace the `signInWithGoogle` function with this:

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const signInWithGoogle = async () => {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      path: 'auth/callback'
    });
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
      },
    });
    
    if (error) Alert.alert('Error', error.message);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

### Step 3: Configure Google Cloud Console

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Create OAuth Client ID** → Choose platform:

#### For iOS:
- **Type**: iOS
- **Bundle ID**: `host.exp.exponent` (for Expo Go)
- **Or**: `com.pettabl.app` (for production build)

#### For Android:
- **Type**: Android
- **Package name**: `host.exp.exponent` (for Expo Go)
- **SHA-1 fingerprint**: Get with:
  ```bash
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

### Step 4: Add to Supabase

1. **Supabase Dashboard** → Authentication → Providers → Google
2. Add iOS Client ID
3. Add Android Client ID
4. Keep Web Client ID separate

### Step 5: Test

```bash
cd mobile
npx expo start
```

Press `w` for web or scan QR code with Expo Go.

---

## Option 2: Native Google Sign-In (Production)

For production apps (App Store / Play Store), use native SDK.

### Step 1: Install Packages

```bash
cd mobile
npx expo install @react-native-google-signin/google-signin
```

### Step 2: Configure app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.pettabl.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.pettabl.app",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

### Step 3: Get Google Services Files

**For iOS**:
1. Go to https://console.firebase.google.com
2. Add iOS app
3. Download `GoogleService-Info.plist`
4. Place in `mobile/` folder

**For Android**:
1. Same Firebase console
2. Add Android app
3. Download `google-services.json`
4. Place in `mobile/` folder

### Step 4: Update App.tsx

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure at app start
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
});

const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken!,
    });
    
    if (error) Alert.alert('Error', error.message);
    else onSignIn();
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

---

## Quick Comparison

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| **Expo AuthSession** | Development & Testing | Easy setup, works with Expo Go | Browser-based flow |
| **Native SDK** | Production | Better UX, native feel | Requires EAS build |

---

## For Testing RIGHT NOW

Use **Expo AuthSession** (Option 1):

1. Install packages:
   ```bash
   cd mobile
   npx expo install expo-auth-session expo-web-browser expo-crypto
   ```

2. The code is already in your app (I added it)

3. Set up Google OAuth for Expo Go:
   - Bundle ID: `host.exp.exponent`
   - Add to Google Cloud Console
   - Add to Supabase

4. Test with Expo Go app

---

## Troubleshooting

### "Invalid OAuth client"
- Check Bundle ID / Package name matches
- Verify Client ID in Supabase

### "Redirect URI mismatch"
- For Expo: `exp://localhost:8083/--/auth/callback`
- Add to Google Console Authorized Redirect URIs

### Button does nothing
- Check browser console for errors
- Verify Google OAuth is enabled in Supabase
- Make sure you added mobile Client IDs

---

## Production Deployment

When you deploy to App Store / Play Store:

1. ✅ Use Native SDK (Option 2)
2. ✅ Get production OAuth credentials
3. ✅ Update Bundle IDs to your actual app IDs
4. ✅ Test with TestFlight / Internal Testing

---

## TL;DR - Quick Start

**For Development** (Easiest):
```bash
cd mobile
npx expo install expo-auth-session expo-web-browser expo-crypto
```

Then set up Google OAuth for:
- Bundle ID: `host.exp.exponent`
- In Google Cloud Console
- Add iOS + Android Client IDs to Supabase

**For Production**:
Use Firebase + Native SDK (Option 2)

---

**Current Status**: 
- ✅ Code is ready
- ❌ Need Google OAuth credentials for mobile
- ✅ Web OAuth works

Follow Option 1 for quick testing!

