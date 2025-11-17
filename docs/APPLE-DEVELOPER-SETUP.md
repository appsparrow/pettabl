# Apple Developer Account Setup for EAS Build

## Problem: "You have no team associated with your Apple account"

This error occurs when EAS can't find your Apple Developer team. Here's how to fix it:

---

## ✅ Solution 1: Use App Store Connect API Key (Recommended)

This is the **most reliable and secure** method. It doesn't require 2FA and works better for CI/CD.

### Step 1: Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **Users and Access** → **Keys** tab
3. Click **+** to create a new key
4. Give it a name: `EAS Build Key` (or similar)
5. Select **App Manager** or **Admin** role
6. Click **Generate**
7. **Download the `.p8` file** (you can only download it once!)
8. **Copy the Key ID** (shown on the page)
9. **Copy the Issuer ID** (found at the top of the Keys page)
                
### Step 2: Configure EAS with API Key

Run this command in your `mobile/` directory:

```bash
cd mobile
eas credentials
```

When prompted:
1. Select **iOS**
2. Select **production** (or the profile you're using)
3. Choose **Set up App Store Connect API Key**
4. Enter:
   - **Key ID**: (from Step 1)
   - **Issuer ID**: (from Step 1)
   - **Path to .p8 file**: `/path/to/your/key.p8` (or drag and drop)

### Step 3: Verify Team

After setup, EAS should automatically detect your team. You can verify with:

```bash
eas build:configure
```

---

## ✅ Solution 2: Use Apple ID Authentication

If you prefer using your Apple ID (requires 2FA):

### Step 1: Clear Existing Credentials (if any)

```bash
cd mobile
eas credentials
# Select iOS → production → Remove credentials
```

### Step 2: Authenticate with Apple ID

```bash
eas credentials
# Select iOS → production → Set up Apple ID
# Enter your Apple ID email
# Enter your password
# Complete 2FA if prompted
```

### Step 3: Select Your Team

If you have multiple teams, EAS will ask you to select one. Choose the team associated with your paid Developer account.

---

## 🔍 Troubleshooting

### Issue: "No team found" even with paid account

**Possible causes:**
1. **Apple ID not linked to Developer account**
   - Go to [developer.apple.com](https://developer.apple.com)
   - Sign in with your Apple ID
   - Verify you see "Membership" showing "Apple Developer Program"
   - If not, you need to accept the membership invitation

2. **Wrong Apple ID**
   - Make sure you're using the Apple ID that's associated with your Developer account
   - Check in App Store Connect → Users and Access → Users

3. **Team ID not visible**
   - Your account might be an individual account (not organization)
   - Individual accounts still work, but the team selection might be different

### Issue: "Authentication failed"

**Fix:**
- Use App Store Connect API Key instead (Solution 1)
- API keys are more reliable and don't require 2FA

### Issue: "Permission denied"

**Fix:**
- Make sure your Apple ID has **App Manager** or **Admin** role in App Store Connect
- Go to App Store Connect → Users and Access → Users
- Check your role and permissions

---

## 📋 Quick Checklist

Before building, verify:

- [ ] You have a **paid Apple Developer account** ($99/year)
- [ ] Your Apple ID is **linked** to the Developer account
- [ ] You can access [App Store Connect](https://appstoreconnect.apple.com)
- [ ] You've set up credentials via `eas credentials`
- [ ] Your `app.json` has `bundleIdentifier` set (e.g., `com.fizent.pettabl`)
- [ ] Your `eas.json` is configured

---

## 🚀 After Credentials Are Set Up

Once credentials are configured, you can build:

```bash
cd mobile
eas build --platform ios --profile production
```

EAS will:
1. Use your stored credentials
2. Build the app in the cloud
3. Upload to App Store Connect automatically
4. Make it available in TestFlight

---

## 💡 Best Practice: Use API Keys

**Why App Store Connect API Keys are better:**
- ✅ No 2FA required during builds
- ✅ More secure (can be revoked easily)
- ✅ Works better in CI/CD environments
- ✅ No password expiration issues
- ✅ Can be shared with team members safely

**When to use Apple ID:**
- Quick testing
- Personal projects only
- You don't mind 2FA prompts

---

## 📞 Still Having Issues?

1. **Check your Apple Developer membership:**
   - Visit [developer.apple.com/account](https://developer.apple.com/account)
   - Verify "Membership" shows active status

2. **Verify App Store Connect access:**
   - Visit [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - You should see "My Apps" or be able to create a new app

3. **Check EAS project:**
   ```bash
   eas project:info
   ```
   This shows your project configuration

4. **Contact Expo Support:**
   - If credentials are set but still failing
   - Expo Discord: [discord.gg/expo](https://discord.gg/expo)
   - Expo Forums: [forums.expo.dev](https://forums.expo.dev)

---

**Last Updated:** Current session  
**Status:** Guide for fixing Apple Developer authentication

