# 🚀 Deployment Checklist

Complete checklist for deploying DingDongDog to production.

---

## Pre-Deployment

### ✅ Database & Backend

- [ ] **Supabase auth trigger installed**
  ```bash
  npx supabase db execute --project-ref cxnvsqkeifgbjzrelytl --file supabase/fix_auth_trigger.sql
  ```

- [ ] **Row Level Security (RLS) policies tested**
  - Verify pet owners can only see their pets
  - Verify agents can only see assigned sessions
  - Test in Supabase Studio SQL editor

- [ ] **Google OAuth configured** (if using)
  - Google Cloud Console credentials created
  - Supabase Google provider enabled
  - Redirect URLs added

- [ ] **Email templates customized** (optional)
  - Supabase → Authentication → Email Templates
  - Customize confirmation, reset password emails

- [ ] **Database backed up**
  ```bash
  npx supabase db dump --project-ref cxnvsqkeifgbjzrelytl > backup.sql
  ```

### ✅ Environment Variables

- [ ] **Production `.env` file created**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_R2_*` variables (if using R2)

- [ ] **Cloudflare Pages env vars configured**
  - All `VITE_` variables added
  - Values match production Supabase

- [ ] **Mobile app env vars configured**
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_R2_*` variables

### ✅ Code Quality

- [ ] **Local build passes**
  ```bash
  npm run build
  ```

- [ ] **No linter errors**
  ```bash
  npm run lint
  ```

- [ ] **TypeScript compiles**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **All tests pass** (if you have tests)

### ✅ Content

- [ ] **Privacy policy page created** (required for app stores)
- [ ] **Terms of service page created**
- [ ] **Support/contact email set up**
- [ ] **Logo and branding finalized**

---

## Web App Deployment

### ✅ Cloudflare Pages Setup

- [ ] **GitHub repository pushed**
  ```bash
  git push origin main
  ```

- [ ] **Cloudflare Pages project created**
  - Framework: Vite
  - Build command: `npm run build`
  - Output directory: `dist`

- [ ] **Environment variables added** in Cloudflare dashboard

- [ ] **First deployment successful**

- [ ] **Custom domain configured** (optional)
  - DNS records added
  - SSL certificate active

### ✅ Supabase Production Settings

- [ ] **Redirect URLs updated**
  - Add production domain to allowed redirects
  - Add `/auth/callback` route

- [ ] **Site URL updated** to production URL

- [ ] **Email sender configured** (optional)
  - Custom SMTP settings
  - Branded email templates

### ✅ Google OAuth (if using)

- [ ] **Production URL added** to Google Console
  - Authorized redirect URIs updated
  - OAuth consent screen published

---

## Mobile App Deployment

### ✅ Expo Setup

- [ ] **Expo account created**
- [ ] **EAS CLI installed**
  ```bash
  npm install -g eas-cli
  eas login
  ```

- [ ] **Project initialized**
  ```bash
  cd mobile
  eas build:configure
  ```

- [ ] **`app.json` configured**
  - Bundle identifier / package name set
  - Version numbers set
  - Icons and splash screens added

### ✅ iOS Deployment

- [ ] **Apple Developer account** ($99/year)
- [ ] **Bundle identifier registered** in App Store Connect
- [ ] **iOS build created**
  ```bash
  eas build --platform ios
  ```

- [ ] **TestFlight testing completed**
- [ ] **App Store Connect metadata filled**
  - Screenshots (6.7" and 5.5")
  - Description
  - Keywords
  - Privacy policy URL

- [ ] **Submitted for review**

### ✅ Android Deployment

- [ ] **Google Play Console account** ($25 one-time)
- [ ] **Package name registered**
- [ ] **Android build created**
  ```bash
  eas build --platform android
  ```

- [ ] **Internal testing completed**
- [ ] **Play Store listing filled**
  - Screenshots (phone and tablet)
  - Feature graphic
  - Description
  - Privacy policy URL

- [ ] **Submitted for review**

---

## Post-Deployment

### ✅ Testing

- [ ] **Sign up / Sign in works**
  - Email/password
  - Google OAuth (if enabled)
  - Email confirmation received

- [ ] **Pet CRUD operations work**
  - Create pet with photo upload
  - Edit pet details
  - Delete pet

- [ ] **Session management works**
  - Create session
  - Assign agents
  - Edit/delete session

- [ ] **Activity logging works**
  - Log feed/walk/letout activities
  - Upload activity photos
  - View activity history

- [ ] **Role switching works**
  - Boss dashboard shows correct data
  - Agent dashboard shows assignments
  - Profile page displays correctly

- [ ] **Mobile app works**
  - iOS app launches
  - Android app launches
  - All features functional

### ✅ Monitoring

- [ ] **Cloudflare Analytics enabled**
  - Pages → Analytics tab
  - Web Analytics activated

- [ ] **Supabase monitoring configured**
  - Database activity dashboard
  - Auth logs reviewed

- [ ] **Error tracking set up** (optional)
  - Sentry / Bugsnag integrated
  - Error notifications configured

- [ ] **Uptime monitoring** (optional)
  - UptimeRobot / Pingdom configured
  - Alerts set up

### ✅ Performance

- [ ] **Lighthouse score checked**
  - Performance > 90
  - Accessibility > 90
  - Best Practices > 90
  - SEO > 90

- [ ] **Mobile performance tested**
  - Load time < 3 seconds
  - Smooth animations
  - No lag on older devices

- [ ] **CDN caching verified**
  - Static assets cached
  - Cache headers correct

### ✅ Security

- [ ] **HTTPS enforced** (auto via Cloudflare)
- [ ] **API keys secured**
  - Only anon key exposed client-side
  - Service role key never in frontend

- [ ] **RLS policies tested**
  - No unauthorized data access
  - SQL injection attempts fail

- [ ] **Rate limiting configured** (optional)
  - Cloudflare rate limiting rules
  - Supabase connection limits reviewed

---

## Marketing & Launch

### ✅ Pre-Launch

- [ ] **Landing page live**
  - Clear value proposition
  - Strong CTA
  - Mobile responsive

- [ ] **Social media accounts created**
  - Twitter/X
  - Instagram
  - Facebook (optional)

- [ ] **Launch announcement draft**
- [ ] **Press kit prepared** (optional)

### ✅ Launch Day

- [ ] **Announce on social media**
- [ ] **Post on Product Hunt** (optional)
- [ ] **Share in relevant communities**
  - Reddit (r/startups, r/pets)
  - Indie Hackers
  - Hacker News (Show HN)

- [ ] **Email friends/beta testers**

### ✅ Post-Launch

- [ ] **Collect user feedback**
  - In-app feedback form
  - Email support inbox
  - Social media mentions

- [ ] **Monitor reviews**
  - App Store reviews
  - Play Store reviews
  - Reply to feedback

- [ ] **Track metrics**
  - Sign-ups per day
  - Active users
  - Retention rate
  - Conversion rate

---

## Maintenance

### ✅ Weekly

- [ ] Check Cloudflare deployment status
- [ ] Review Supabase usage/limits
- [ ] Monitor error logs
- [ ] Review app store reviews

### ✅ Monthly

- [ ] Update dependencies
  ```bash
  npm update
  ```
- [ ] Review analytics
- [ ] Backup database
- [ ] Review and respond to feedback

### ✅ As Needed

- [ ] Push OTA updates (mobile)
  ```bash
  cd mobile
  eas update --branch production
  ```

- [ ] Deploy web updates (auto via git push)
  ```bash
  git push origin main
  ```

- [ ] Scale Supabase plan (if needed)

---

## Emergency Procedures

### 🚨 If Site is Down

1. Check Cloudflare Pages status: https://www.cloudflarestatus.com
2. Check Supabase status: https://status.supabase.com
3. Review recent deployments, rollback if needed
4. Check DNS settings

### 🚨 If Data is Lost

1. Stop accepting new data
2. Restore from latest Supabase backup
3. Notify affected users
4. Review backup procedures

### 🚨 If Security Breach

1. Rotate all API keys immediately
2. Reset affected user passwords
3. Review RLS policies
4. Audit access logs in Supabase
5. Notify users if personal data compromised

---

## Support Channels

- **Email**: support@dingdongdog.com
- **GitHub Issues**: For bug reports
- **Discord/Slack**: For community support (optional)

---

## Resources

- [Cloudflare Deployment Guide](./CLOUDFLARE-DEPLOYMENT.md)
- [Mobile Deployment Guide](./MOBILE-DEPLOYMENT.md)
- [Google OAuth Setup](./GOOGLE-OAUTH-SETUP.md)
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)

---

**Ready to deploy? Start with the Database & Backend section! 🚀**

