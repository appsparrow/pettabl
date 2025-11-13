# Google OAuth Setup Guide

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select a Project**: Click the project dropdown → "New Project"
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required fields:
     - App name: **DingDongDog**
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: **DingDongDog Web**
   - Authorized redirect URIs:
     ```
     https://cxnvsqkeifgbjzrelytl.supabase.co/auth/v1/callback
     http://localhost:5173/auth/callback
     http://localhost:8083/auth/callback
     ```
   - Click "Create"
   - **Copy the Client ID and Client Secret**

## Step 2: Configure Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/cxnvsqkeifgbjzrelytl
2. **Navigate to Authentication** → **Providers**
3. **Find Google** and toggle it on
4. **Paste your credentials**:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
5. **Save**

## Step 3: Add Redirect URL to Site URL

1. In Supabase → **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   http://localhost:5173/*
   http://localhost:8083/*
   https://your-production-domain.com/*
   ```

## Step 4: Test

- Restart your dev servers
- Click "Sign in with Google"
- You should be redirected to Google login
- After authentication, redirected back to your app

## Troubleshooting

- **"redirect_uri_mismatch"**: Check that the redirect URI in Google Console exactly matches Supabase callback URL
- **"Access blocked"**: Make sure OAuth consent screen is published (or add test users)
- **No profile created**: Make sure the `handle_new_user` trigger is installed in Supabase

## Production Deployment

When deploying to production:
1. Add production domain to Google OAuth redirect URIs
2. Add production domain to Supabase redirect URLs
3. Update `site_url` in Supabase Auth settings

