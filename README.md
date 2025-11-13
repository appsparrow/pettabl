# 🐕 DingDongDog - Modern Pet Care Coordination

Seamlessly coordinate pet care between owners and caretakers. Track activities, manage schedules, and keep your furry friends happy — anywhere, anytime.

---

## 🚀 Quick Start

### Web App

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Mobile App

```bash
cd mobile
npm install
npx expo start --port 8083
```

Scan QR code with Expo Go app (iOS/Android)

---

## 📱 Platforms

- **Web**: React + Vite + Tailwind + shadcn/ui
- **iOS**: Expo + React Native
- **Android**: Expo + React Native

---

## 🎯 Features

- 🐶 **Multi-Pet Management** - Multiple pets, each with profiles & schedules
- 👥 **Role-Based Access** - Pet Owners (Fur Boss) & Caretakers (Fur Agents)
- 📅 **Smart Scheduling** - Custom care plans for feeding, walks, playtime
- 📸 **Activity Tracking** - Photo uploads, notes, timestamps
- 🔐 **Secure Auth** - Email/password + Google OAuth
- ☁️ **Cloud Storage** - Cloudflare R2 for images
- 🔄 **Real-time Updates** - Supabase for backend
- 📱 **Mobile-First** - Beautiful UX on all devices

---

## 🛠️ Tech Stack

**Frontend**:
- React 18 + TypeScript
- Vite (web) + Expo (mobile)
- Tailwind CSS + shadcn/ui
- React Router + React Navigation
- TanStack Query

**Backend**:
- Supabase (PostgreSQL + Auth + Storage)
- Cloudflare R2 (Image storage)
- Row Level Security (RLS)

**Deployment**:
- Cloudflare Pages (web)
- Expo EAS (mobile)

---

## 📚 Documentation

### Deployment
- [🚀 Deployment Summary](./DEPLOYMENT-SUMMARY.md) - **Start here!**
- [☁️ Cloudflare Pages Deployment](./CLOUDFLARE-DEPLOYMENT.md)
- [📱 Mobile App Deployment](./MOBILE-DEPLOYMENT.md)
- [✅ Deployment Checklist](./DEPLOYMENT-CHECKLIST.md)

### Setup Guides
- [🔐 Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md)
- [💾 Local Development Setup](./LOCAL-SETUP.md)
- [🗄️ Supabase Backup & Restore](./supabase/backups/README.md)

### Architecture
- [📖 API Documentation](./API-DOCUMENTATION.md)
- [🏗️ Native App PRD](./NATIVE-APP-PRD.md)

---

## 🚀 Deployment Status

✅ **Web App**: Ready for Cloudflare Pages  
✅ **Mobile App**: Ready for Expo EAS  
✅ **Database**: Supabase production-ready  
✅ **Auth**: Email + Google OAuth configured  
✅ **Landing Page**: Marketing site included

**Next step**: See [DEPLOYMENT-SUMMARY.md](./DEPLOYMENT-SUMMARY.md)

---

## 🗂️ Project Structure

```
pettabl/
├── src/                      # Web app source
│   ├── pages/               # React pages
│   │   ├── Landing.tsx      # Marketing landing page
│   │   ├── Auth.tsx         # Sign in/up with Google OAuth
│   │   ├── BossDashboard.tsx
│   │   └── AgentDashboard.tsx
│   ├── components/          # Reusable components
│   ├── integrations/        # Supabase client
│   └── lib/                 # Utilities
├── mobile/                   # Mobile app (Expo)
│   ├── src/
│   │   ├── screens/         # Mobile screens
│   │   ├── components/      # Mobile components
│   │   └── lib/             # Mobile utilities
│   └── App.tsx
├── supabase/                # Database migrations & backups
│   ├── migrations/          # SQL migrations
│   └── backups/             # Database backups
└── public/                  # Static assets
```

---

## 🔐 Environment Variables

### Web App (`.env.local`)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

VITE_R2_ACCOUNT_ID=your-r2-account-id
VITE_R2_ACCESS_KEY_ID=your-r2-access-key
VITE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
VITE_R2_BUCKET_NAME=your-bucket-name
VITE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
VITE_R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

### Mobile App (`mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

EXPO_PUBLIC_R2_ACCOUNT_ID=your-r2-account-id
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your-r2-access-key
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your-r2-secret-key
EXPO_PUBLIC_R2_BUCKET_NAME=your-bucket-name
EXPO_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
EXPO_PUBLIC_R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com
```

---

## 🧪 Testing

```bash
# Web app
npm run build           # Test production build
npm run dev             # Start dev server

# Mobile app
cd mobile
npx expo start          # Start Expo dev server
npx expo start --ios    # Open iOS simulator
npx expo start --android # Open Android emulator
```

---

## 📦 Scripts

### Web App

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

### Mobile App

- `npm start` - Start Expo dev server
- `npm run ios` - Open iOS simulator
- `npm run android` - Open Android emulator
- `npm run web` - Open in web browser

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Expo](https://expo.dev)
- [Supabase](https://supabase.com)
- [Cloudflare](https://cloudflare.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 Support

- **Email**: support@dingdongdog.com
- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues

---

**Made with ❤️ for pets everywhere** 🐕🐈

---

*Last Updated: November 13, 2025*
