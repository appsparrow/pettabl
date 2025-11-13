# 🚀 Quick Setup: Google OAuth for Mobile (5 Minutes)

## ✅ Current Status

- ✅ Code is ready
- ✅ Packages installed
- ✅ Redirect URL: `exp://192.168.86.189:8083/--/auth/callback`
- ❌ Google OAuth NOT configured for mobile

---

## 🎯 Why It's Not Working

**Google OAuth requires**:
1. ✅ Web Client ID (you have this - web works!)
2. ❌ **iOS Client ID** (missing!)
3. ❌ **Android Client ID** (missing!)

Without iOS/Android Client IDs, the button opens a browser but gets rejected by Google.

---

## 📝 5-Minute Fix

### Step 1: Go to Google Cloud Console

https://console.cloud.google.com/apis/credentials

(Use the same project where you set up web OAuth)

### Step 2: Create iOS OAuth Client

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. **Application type**: iOS
3. **Name**: Pettabl iOS (Expo Go)
4. **Bundle ID**: `host.exp.exponent`
   - This is for Expo Go development
   - For production, use `com.pettabl.app`
5. Click **"Create"**
6. **Copy the iOS Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 3: Create Android OAuth Client

1. Click **"Create Credentials"** → **"OAuth client ID"**
2. **Application type**: Android
3. **Name**: Pettabl Android (Expo Go)
4. **Package name**: `host.exp.exponent`
   - This is for Expo Go development
   - For production, use `com.pettabl.app`
5. **SHA-1**: Leave blank for Expo Go
6. Click **"Create"**
7. **Copy the Android Client ID**

### Step 4: Add to Supabase

1. Go to: https://supabase.com/dashboard/project/cxnvsqkeifgbjzrelytl
2. Click **Authentication** → **Providers** → **Google**
3. **Additional Client IDs** section:
   - iOS Client ID: `paste-ios-client-id`
   - Android Client ID: `paste-android-client-id`
4. **Authorized Client IDs**: Leave existing web client ID
5. Click **Save**

### Step 5: Add Redirect URIs in Google Console

For **EACH** OAuth client (Web, iOS, Android):

1. Edit the client
2. **Authorized redirect URIs**, add:
   ```
   https://cxnvsqkeifgbjzrelytl.supabase.co/auth/v1/callback
   exp://192.168.86.189:8083/--/auth/callback
   ```
3. Save

### Step 6: Test!

1. **Restart Expo** (important!):
   ```bash
   # In terminal, press Ctrl+C
   cd /Users/siva/Documents/GitHub/pettabl/mobile
   npx expo start --clear --port 8083
   ```

2. Open: `http://localhost:8083`
3. Click **"Sign in with Google"**
4. Should open browser → Google login → redirect back to app

---

## 🔍 Expected Flow

1. Click "Sign in with Google" button
2. Browser opens with Google login
3. Select Google account
4. Authorize Pettabl
5. Browser redirects back to app
6. **Success!** Signed in

---

## ❌ Troubleshooting

### "Invalid OAuth Client"
- Check Bundle ID is exactly: `host.exp.exponent`
- Verify iOS/Android Client IDs are added to Supabase

### "Redirect URI Mismatch"
- Add `exp://192.168.86.189:8083/--/auth/callback` to ALL OAuth clients
- Add Supabase callback URL too

### Browser Opens But Nothing Happens
- Check Supabase logs: Authentication → Logs
- Look for errors in Expo console (terminal)
- Verify Client IDs are correct

### Button Does Nothing
- Restart Expo dev server
- Clear Metro cache: `npx expo start --clear`
- Check browser console for errors

---

## 📱 Production Notes

When you deploy to App Store / Play Store:

1. Create NEW OAuth clients with:
   - iOS Bundle ID: `com.pettabl.app`
   - Android Package: `com.pettabl.app`
2. Update `mobile/app.json`:
   ```json
   {
     "ios": {
       "bundleIdentifier": "com.pettabl.app"
     },
     "android": {
       "package": "com.pettabl.app"
     }
   }
   ```
3. Add production Client IDs to Supabase

---

## 📋 Checklist

- [ ] Created iOS OAuth Client (Bundle ID: `host.exp.exponent`)
- [ ] Created Android OAuth Client (Package: `host.exp.exponent`)
- [ ] Added iOS Client ID to Supabase
- [ ] Added Android Client ID to Supabase
- [ ] Added redirect URIs to Google OAuth clients
- [ ] Restarted Expo dev server
- [ ] Tested: Click "Sign in with Google"
- [ ] Success: Logged in via Google!

---

## 🎉 That's It!

Once you complete these steps, Google OAuth will work on mobile. The code is already done!

---

**Current Redirect URL**: `exp://192.168.86.189:8083/--/auth/callback`

**Google Console**: https://console.cloud.google.com/apis/credentials

**Supabase Dashboard**: https://supabase.com/dashboard/project/cxnvsqkeifgbjzrelytl

