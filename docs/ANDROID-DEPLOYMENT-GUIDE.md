# Android App Deployment Guide (Google Play Store)

Complete guide for deploying your Pettabl app to Android devices via Google Play Store.

---

## 📋 Prerequisites

1. **Google Play Console Account** ($25 one-time fee)
   - Visit [play.google.com/console](https://play.google.com/console)
   - Sign up with a Google account
   - Pay the $25 registration fee (one-time, lifetime)

2. **Expo Account** (free)
   - Already set up if you did iOS builds

3. **EAS CLI** (already installed)

---

## 🔧 Step 1: Update app.json for Android

Your `app.json` needs Android package name and version code. Update it:

```json
{
  "expo": {
    "android": {
      "package": "com.fizent.pettabl",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    }
  }
}
```

**Important:**
- `package`: Must be unique (like `com.fizent.pettabl` or `com.yourcompany.pettabl`)
- `versionCode`: Increment for each build (1, 2, 3...)
- `version`: Keep at "1.0.0" for now (user-facing version)

---

## 🔑 Step 2: Set Up Google Play Console

### 2.1 Create Developer Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Sign in with your Google account
3. Accept the Developer Agreement
4. Pay the **$25 registration fee** (one-time, credit card)
5. Complete your developer profile

### 2.2 Create Your App

1. In Google Play Console, click **Create app**
2. Fill in:
   - **App name**: `Pettabl`
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check all that apply (Privacy Policy, etc.)
3. Click **Create app**

### 2.3 Set Up App Store Listing (Basic)

**📋 Complete store listing content is ready!** See `docs/GOOGLE-PLAY-STORE-LISTING.md` for:
- Short description (80 chars)
- Full description (2 versions: concise & extended)
- Screenshot suggestions
- Visual asset requirements
- Privacy policy guidance

**Quick Copy-Paste:**
- **App name**: Pettabl
- **Short description**: `Coordinate in-home pet care with trusted sitters. Schedules, checklists & photo proof.`
- **Full description**: Copy from `GOOGLE-PLAY-STORE-LISTING.md`
- **App icon**: Upload 512x512 PNG (use `assets/icon.png` if it's 512x512)
- **Feature graphic**: 1024x500 PNG (optional for now)
- **Screenshots**: At least 2 (see guide for suggestions)

**You can save as draft** and complete later. For closed testing, minimal info is fine.

---

## 🔐 Step 3: Configure Android Credentials

### Option A: Let EAS Manage (Recommended for First Time)

EAS can automatically create and manage your signing key:

```bash
cd mobile
eas credentials
```

When prompted:
1. Select **Android**
2. Select **production** (or your build profile)
3. Choose **Set up new keystore** or **Let EAS manage**
4. EAS will create a keystore and store it securely

**Important:** EAS will store your keystore. You can download it later if needed.

### Option B: Use Your Own Keystore (Advanced)

If you want to manage your own keystore:

```bash
cd mobile
eas credentials
# Select Android → production → Upload keystore
```

You'll need:
- Keystore file (`.jks` or `.keystore`)
- Keystore password
- Key alias
- Key password

---

## 🏗️ Step 4: Build Android App

### Build for Internal Testing

```bash
cd mobile
eas build --platform android --profile production
```

This will:
- Build your app in the cloud (~10-15 minutes)
- Generate an `.aab` (Android App Bundle) file
- Store it in EAS servers

### Build Output

After build completes, you'll get:
- **Download URL** for the `.aab` file
- **Build ID** for tracking

---

## 📤 Step 5: Upload to Google Play Console

### Option A: Automatic Upload (Recommended)

EAS can automatically upload to Google Play:

```bash
cd mobile
eas submit --platform android
```

You'll need to authenticate with Google:
1. EAS will open a browser
2. Sign in with your Google account
3. Grant permissions to EAS
4. EAS uploads the build automatically

### Option B: Manual Upload

1. **Download the `.aab` file** from EAS build page
2. Go to Google Play Console → Your App → **Production** (or **Testing**)
3. Click **Create new release**
4. Upload the `.aab` file
5. Add release notes (optional)
6. Click **Save** → **Review release** → **Start rollout**

---

## 🧪 Step 6: Set Up Internal Testing (Closed Group)

This is like TestFlight for Android - perfect for your 2-week closed testing.

### 6.1 Create Internal Testing Track

1. In Google Play Console → Your App
2. Go to **Testing** → **Internal testing**
3. Click **Create new release**
4. Upload your `.aab` file (or use EAS submit)
5. Add release notes
6. Click **Save**

### 6.2 Add Testers

1. Go to **Testers** tab
2. Click **Create email list**
3. Add tester emails (up to 100 for internal testing)
4. Copy the **opt-in URL**
5. Share the URL with your testers

**Testers will:**
- Click the opt-in URL
- Join the testing program
- Get the app from Play Store (it appears like a normal app)

### 6.3 Release to Testers

1. Go back to **Releases** tab
2. Click **Review release**
3. Click **Start rollout to Internal testing**

**Note:** First release might take a few hours to process. Subsequent releases are faster.

---

## 📱 Step 7: Testers Install the App

Your testers will:

1. **Click the opt-in URL** you shared
2. **Join the testing program** (one-time)
3. **Open Google Play Store** on their Android device
4. **Search for "Pettabl"** or go to the Play Store link
5. **Install** like a normal app

The app will appear in Play Store as if it's published, but only testers can see it.

---

## 🚀 Step 8: Production Release (After 2 Weeks)

When ready to go public:

### 8.1 Update Version

In `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Increment user-facing version
    "android": {
      "versionCode": 2  // Increment build number
    }
  }
}
```

### 8.2 Build Production Version

```bash
cd mobile
eas build --platform android --profile production
```

### 8.3 Complete App Store Listing

In Google Play Console, complete:
- **Store listing** (description, screenshots, etc.)
- **Content rating** (questionnaire)
- **Privacy policy** (required)
- **App access** (if restricted)
- **Ads** (if applicable)
- **Data safety** (privacy information)

### 8.4 Submit for Review

1. Go to **Production** → **Create new release**
2. Upload the new `.aab` file
3. Add release notes
4. Click **Review release**
5. Complete all required sections (content rating, etc.)
6. Click **Start rollout to Production**

**Review time:** Usually 1-3 days for first submission

---

## 📊 Version Management

### Version vs Version Code

- **`version`** (in app.json): User-facing version (e.g., "1.0.0", "1.0.1")
- **`versionCode`**: Internal build number (must always increase: 1, 2, 3...)

**Example:**
```json
{
  "version": "1.0.0",  // Users see this
  "android": {
    "versionCode": 1   // Google Play uses this
  }
}
```

For next build:
```json
{
  "version": "1.0.1",  // or keep "1.0.0" if minor fix
  "android": {
    "versionCode": 2   // MUST increment
  }
}
```

---

## 🔄 EAS Auto-Increment

Your `eas.json` has `"autoIncrement": true` for production, which means EAS will automatically increment `versionCode` for you! Just make sure `versionCode` starts correctly.

---

## 🆚 Android vs iOS Differences

| Feature | iOS (TestFlight) | Android (Internal Testing) |
|---------|------------------|----------------------------|
| **Account Cost** | $99/year | $25 one-time |
| **Review Required** | Yes (first external) | No (for internal) |
| **Processing Time** | 10-30 min | 1-3 hours (first), then faster |
| **Tester Limit** | 10,000 external | 100 internal, unlimited closed |
| **File Format** | `.ipa` | `.aab` (App Bundle) |
| **Signing** | Certificates + Provisioning | Keystore |

---

## 🐛 Common Issues

### Issue: "Package name already exists"

**Fix:** Change `package` in `app.json` to something unique:
```json
"package": "com.fizent.pettabl"  // Make it unique
```

### Issue: "Version code must be higher"

**Fix:** Increment `versionCode` in `app.json`:
```json
"versionCode": 2  // Must be higher than previous
```

### Issue: "Upload failed"

**Fix:**
- Make sure you're uploading `.aab` (not `.apk`)
- Check file size (should be reasonable)
- Try manual upload if EAS submit fails

### Issue: "App not appearing for testers"

**Fix:**
- Wait 1-3 hours for first release to process
- Make sure testers clicked the opt-in URL
- Check that release is "Rolled out" (not "Draft")

---

## ✅ Quick Checklist

Before building:

- [ ] Updated `app.json` with `package` and `versionCode`
- [ ] Created Google Play Console account ($25 paid)
- [ ] Created app in Play Console
- [ ] Set up Android credentials via `eas credentials`
- [ ] Built app: `eas build --platform android --profile production`
- [ ] Uploaded to Play Console (via `eas submit` or manual)
- [ ] Created internal testing release
- [ ] Added testers and shared opt-in URL

---

## 📚 Additional Resources

- **Google Play Console**: [play.google.com/console](https://play.google.com/console)
- **EAS Build Docs**: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction)
- **Android App Bundle**: [developer.android.com/guide/app-bundle](https://developer.android.com/guide/app-bundle)

---

## 💡 Pro Tips

1. **Use Internal Testing First**: No review needed, perfect for closed groups
2. **Keep Version Codes Simple**: Start at 1, increment by 1 each time
3. **Test on Real Devices**: Android has many device variations
4. **Monitor Crashes**: Google Play Console shows crash reports
5. **Use Staged Rollouts**: For production, roll out to 10% → 50% → 100%

---

**Last Updated:** Current session  
**Status:** Complete Android deployment guide

