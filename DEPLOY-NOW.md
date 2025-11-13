# 🚀 Deploy Pettabl to Cloudflare Pages - Quick Guide

## ✅ Pre-Deployment Checklist

- [x] Build tested locally (successful!)
- [x] Logo updated to use `logo-pettabl.png`
- [x] Google OAuth hidden (can re-enable later)
- [x] Connected to remote Supabase

## 📋 Deployment Steps

### Step 1: Push to GitHub

```bash
cd /Users/siva/Documents/GitHub/pettabl
git add .
git commit -m "feat: Ready for Cloudflare Pages deployment with updated logo"
git push origin main
```

### Step 2: Create Cloudflare Pages Project

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Sign in with your account

2. **Create New Project**
   - Click "Workers & Pages" in sidebar
   - Click "Create application"
   - Click "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub**
   - Authorize Cloudflare to access GitHub
   - Select `pettabl` repository
   - Click "Begin setup"

4. **Configure Build Settings**

   **Project name**: `pettabl` (or your choice)

   **Production branch**: `main`

   **Framework preset**: `Vite`

   **Build command**:
   ```
   npm run build
   ```

   **Build output directory**:
   ```
   dist
   ```

   **Root directory**: (leave empty)

5. **Add Environment Variables**

   Click "Add variable" for each:

   ```
   VITE_SUPABASE_URL
   Value: https://cxnvsqkeifgbjzrelytl.supabase.co

   VITE_SUPABASE_PUBLISHABLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bnZzcWtlaWZnYmp6cmVseXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODg2MzcsImV4cCI6MjA3ODU2NDYzN30.3osNI5MuIbhBF4z2yZ-gP6O7q4vtb6sq-R-Ddy6Kezw
   ```

   **Optional R2 Variables** (if you have R2 configured):
   ```
   VITE_R2_ACCOUNT_ID
   VITE_R2_ACCESS_KEY_ID
   VITE_R2_SECRET_ACCESS_KEY
   VITE_R2_BUCKET_NAME
   VITE_R2_PUBLIC_URL
   VITE_R2_ENDPOINT
   ```

6. **Deploy**
   - Click "Save and Deploy"
   - Wait 2-5 minutes for build to complete
   - You'll get a URL like: `https://pettabl.pages.dev`

### Step 3: Update Supabase Settings

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/cxnvsqkeifgbjzrelytl

2. **Update Redirect URLs**
   - Go to: Authentication → URL Configuration
   - Add to **Redirect URLs**:
     ```
     https://your-project.pages.dev/*
     ```
   - Update **Site URL**:
     ```
     https://your-project.pages.dev
     ```
   - Click "Save"

### Step 4: Test Your Deployment

1. Visit your Cloudflare Pages URL
2. Test the landing page
3. Click "Get Started Free"
4. Try signing up with email
5. Check email for confirmation
6. Sign in
7. Test creating a pet

## 🎉 Success!

Your web app is now live on Cloudflare Pages!

## 📱 Next: Deploy Mobile App

See `MOBILE-DEPLOYMENT.md` for mobile deployment instructions.

## 🔄 Automatic Updates

Every time you push to `main`, Cloudflare automatically rebuilds and deploys:

```bash
git add .
git commit -m "your changes"
git push origin main
```

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Cloudflare dashboard
- Ensure all dependencies are in `package.json`
- Test build locally first: `npm run build`

### Environment Variables Not Working
- Variable names must start with `VITE_`
- Redeploy after changing env vars
- Check for typos in variable names

### Can't Sign Up/In
- Verify Supabase URL is correct
- Check Supabase redirect URLs match your domain
- Look at browser console for errors

## 📊 Monitor Your App

- **Deployments**: https://dash.cloudflare.com → Your Project → Deployments
- **Analytics**: Workers & Pages → Your Project → Analytics
- **Logs**: Deployments → View details → Functions log

---

**Your deployment URL will be**: `https://pettabl-xxx.pages.dev`

Replace `xxx` with your unique Cloudflare subdomain.

