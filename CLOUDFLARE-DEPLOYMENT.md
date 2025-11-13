# Cloudflare Pages Deployment Guide

## Overview

DingDongDog consists of:
- **Web App** (React + Vite) - Deploy to Cloudflare Pages
- **Mobile App** (Expo/React Native) - Deploy via Expo/App Stores

This guide covers deploying the web app to Cloudflare Pages.

---

## Prerequisites

1. **Cloudflare Account**: Sign up at https://dash.cloudflare.com/sign-up
2. **GitHub Repository**: Your code pushed to GitHub
3. **Supabase Project**: Remote Supabase instance configured
4. **R2 Storage** (Optional): Cloudflare R2 for image uploads

---

## Step 1: Prepare for Deployment

### 1.1 Install Dependencies (if not done)

```bash
cd /Users/siva/Documents/GitHub/pettabl
npm install
```

### 1.2 Test Local Build

```bash
npm run build
```

Ensure build completes without errors.

### 1.3 Verify Environment Variables

Make sure your `.env.local` contains:
```env
VITE_SUPABASE_URL=https://cxnvsqkeifgbjzrelytl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

VITE_R2_ACCOUNT_ID=your-account-id
VITE_R2_ACCESS_KEY_ID=your-access-key
VITE_R2_SECRET_ACCESS_KEY=your-secret-key
VITE_R2_BUCKET_NAME=your-bucket-name
VITE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
VITE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

---

## Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Cloudflare Pages deployment"
git push origin main
```

---

## Step 3: Create Cloudflare Pages Project

### 3.1 Connect GitHub

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" in the sidebar
3. Click "Create application" → "Pages" tab
4. Click "Connect to Git"
5. Authorize Cloudflare to access your GitHub
6. Select `pettabl` repository

### 3.2 Configure Build Settings

**Framework preset**: `Vite`

**Build settings**:
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` (leave empty or use `/`)

**Environment variables** (Click "Add variable"):
```
VITE_SUPABASE_URL = https://cxnvsqkeifgbjzrelytl.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = <your-anon-key>

VITE_R2_ACCOUNT_ID = <your-r2-account-id>
VITE_R2_ACCESS_KEY_ID = <your-r2-access-key>
VITE_R2_SECRET_ACCESS_KEY = <your-r2-secret-key>
VITE_R2_BUCKET_NAME = R2-Pettabl
VITE_R2_PUBLIC_URL = <your-r2-public-url>
VITE_R2_ENDPOINT = <your-r2-endpoint>
```

### 3.3 Deploy

1. Click "Save and Deploy"
2. Cloudflare will build and deploy your app
3. Wait 2-5 minutes for first deployment
4. You'll get a URL like: `https://pettabl.pages.dev`

---

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain

1. In Cloudflare Pages project → "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain: `dingdongdog.com` or `app.dingdongdog.com`
4. Follow DNS instructions

### 4.2 SSL Certificate

Cloudflare automatically provisions SSL certificates (HTTPS).

---

## Step 5: Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your production URL to **Redirect URLs**:
   ```
   https://pettabl.pages.dev/*
   https://dingdongdog.com/*
   ```

3. Update **Site URL**:
   ```
   https://pettabl.pages.dev
   ```

---

## Step 6: Update Google OAuth (if using)

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://cxnvsqkeifgbjzrelytl.supabase.co/auth/v1/callback
   ```
4. Save

---

## Step 7: Test Deployment

1. Visit your Cloudflare Pages URL
2. Test sign up / sign in
3. Test Google OAuth
4. Create a pet and session
5. Upload a photo (test R2)

---

## Automatic Deployments

Cloudflare Pages automatically redeploys when you push to `main`:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

Monitor deployments at: https://dash.cloudflare.com → Your Project → Deployments

---

## Troubleshooting

### Build Fails

**Error**: `vite: command not found`
- **Fix**: Ensure `package.json` has `"vite"` in `devDependencies`

**Error**: Module not found
- **Fix**: Run `npm install` locally, commit `package-lock.json`

### Environment Variables Not Working

- Double-check variable names start with `VITE_`
- Redeploy after changing env vars
- Clear Cloudflare cache: Pages Settings → Functions → Purge cache

### OAuth Redirect Issues

- Verify redirect URLs match exactly in Google Console and Supabase
- Check browser console for errors
- Ensure Supabase site URL is production URL

---

## Performance Optimization

### Enable Caching

Cloudflare Pages automatically caches static assets. No action needed.

### Preview Deployments

Every pull request gets a unique preview URL. Great for testing!

---

## Rollback

If a deployment breaks:

1. Go to Cloudflare Pages → Deployments
2. Find a working deployment
3. Click "..." → "Rollback to this deployment"

---

## Cost

- **Cloudflare Pages**: Free tier includes unlimited requests
- **Supabase**: Free tier includes 500MB database + 50K monthly active users
- **R2**: First 10GB storage free, then $0.015/GB/month

---

## Next Steps

- ✅ Web app deployed to Cloudflare Pages
- 📱 Deploy mobile app (see `MOBILE-DEPLOYMENT.md`)
- 🚀 Set up analytics (Cloudflare Web Analytics)
- 📧 Configure email templates in Supabase

---

**Need Help?**
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Supabase Docs: https://supabase.com/docs

