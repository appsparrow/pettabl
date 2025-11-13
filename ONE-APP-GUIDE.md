# 🎯 One Unified App - Pettabl

## ✅ What Changed

You now have **ONE unified React Native + Web app** on **port 8083**!

---

## 📱 How It Works

### Single Codebase
- **Location**: `/mobile/` folder
- **Technology**: Expo (React Native + React Native Web)
- **Port**: 8083
- **Runs**: iOS, Android, AND Web

### Smart Routing

**On Web** (`http://localhost:8083`):
1. Opens → **Landing Page** (marketing)
2. Click "Get Started" → Auth (Sign In/Up)
3. After login → Dashboard

**On Mobile** (iOS/Android via Expo Go):
1. Opens → **Auth Screen** directly (no landing page)
2. After login → Dashboard

---

## 🚀 One Command to Rule Them All

```bash
cd /Users/siva/Documents/GitHub/pettabl/mobile
npx expo start --port 8083
```

That's it! This serves:
- ✅ **Web**: `http://localhost:8083`
- ✅ **iOS**: Expo Go app (scan QR)
- ✅ **Android**: Expo Go app (scan QR)

---

## 🌐 URLs

### Development
- **Web App**: http://localhost:8083
- **Landing Page**: http://localhost:8083 (on web only)
- **Auth**: http://localhost:8083/auth (web navigates here)
- **Mobile**: Scan QR code with Expo Go

### Production
- **Web**: Deploy to Cloudflare Pages / Vercel
- **iOS**: App Store (via Expo EAS)
- **Android**: Play Store (via Expo EAS)

---

## 📂 Project Structure

```
mobile/
├── App.tsx                      # Main app, routing
├── src/
│   ├── screens/
│   │   ├── LandingScreen.tsx    # 🆕 Landing page (web only)
│   │   ├── BossDashboard.tsx    # Pet owner dashboard
│   │   ├── AgentDashboard.tsx   # Caretaker dashboard
│   │   └── ...
│   ├── components/              # Shared components
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   └── theme/
│       └── colors.ts           # Design system
└── package.json
```

---

## 🎨 Features

### Landing Page (Web Only)
- Hero section with CTA
- 6 feature cards
- Call-to-action section
- Footer with links
- **Auto-navigates** to Auth on "Get Started"

### Auth Screen (Mobile + Web)
- Sign In / Sign Up tabs
- Email + Password
- Google OAuth button
- Email confirmation flow

### Dashboards (Mobile + Web)
- Boss Dashboard (pet owners)
- Agent Dashboard (caretakers)
- Profile management
- Pet CRUD
- Session management
- Activity tracking

---

## 🔥 Benefits

### Before (2 Separate Apps)
- ❌ Web app on port 8080 (Vite)
- ❌ Mobile app on port 8083 (Expo)
- ❌ Two separate codebases
- ❌ Duplicate components
- ❌ Different routing

### After (1 Unified App)
- ✅ **One codebase** for everything
- ✅ **One port** (8083)
- ✅ **Shared components**
- ✅ **Single Supabase config**
- ✅ **One deployment** (Expo EAS)
- ✅ Web AND mobile from same code!

---

## 🚀 Development Workflow

### Start Development
```bash
cd /Users/siva/Documents/GitHub/pettabl/mobile
npx expo start --port 8083
```

### Test on Web
```
http://localhost:8083
```

### Test on iOS
```
Press 'i' in terminal (opens simulator)
Or scan QR with Expo Go app
```

### Test on Android
```
Press 'a' in terminal (opens emulator)
Or scan QR with Expo Go app
```

---

## 📦 Deployment

### Web (Cloudflare Pages or Vercel)
```bash
cd mobile
npx expo export --platform web
# Upload dist/ folder to Cloudflare Pages
```

### iOS (App Store)
```bash
cd mobile
eas build --platform ios
eas submit --platform ios
```

### Android (Play Store)
```bash
cd mobile
eas build --platform android
eas submit --platform android
```

---

## 🎯 Google OAuth Setup

**Same OAuth works for ALL platforms!**

1. Set up in Google Cloud Console
2. Add credentials to Supabase
3. Works on web, iOS, AND Android

See: `MOBILE-GOOGLE-OAUTH-SETUP.md`

---

## 🔧 Environment Variables

**One `.env` file**: `/mobile/.env`

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://cxnvsqkeifgbjzrelytl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# R2 Storage
EXPO_PUBLIC_R2_ACCOUNT_ID=your-account-id
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your-access-key
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your-secret-key
EXPO_PUBLIC_R2_BUCKET_NAME=R2-Pettabl
EXPO_PUBLIC_R2_PUBLIC_URL=your-r2-url
EXPO_PUBLIC_R2_ENDPOINT=your-r2-endpoint
```

---

## 📋 What Happened to the Old Web App?

The standalone Vite web app (`/src/`) is **no longer needed**. 

Everything is now in `/mobile/` which handles both mobile AND web.

You can delete:
- Old web build outputs
- Port 8080 references
- Duplicate components

**Keep**:
- `/mobile/` - Your unified app
- `/supabase/` - Database migrations
- Documentation files

---

## ✅ Checklist

- [x] One codebase (`/mobile/`)
- [x] One port (8083)
- [x] Landing page on web
- [x] Auth screen on mobile
- [x] Google OAuth integrated
- [x] Shared Supabase config
- [x] Works on iOS, Android, Web

---

## 🎉 You're All Set!

**Open**: http://localhost:8083

**On Web**: You'll see the beautiful landing page  
**On Mobile**: You'll see the auth screen  

**One app, all platforms!** 🚀

---

**Need Help?**
- Google OAuth: `MOBILE-GOOGLE-OAUTH-SETUP.md`
- Deployment: `MOBILE-DEPLOYMENT.md`
- Quick OAuth: `QUICK-GOOGLE-OAUTH-MOBILE.md`

