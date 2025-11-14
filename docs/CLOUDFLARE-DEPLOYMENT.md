# Cloudflare Pages Deployment Guide (Expo Web Build)

## Overview

Pettabl now deploys the Expo-based web experience (identical to the app running at port **8083**) to Cloudflare Pages. The legacy Vite marketing build is no longer used for production.

---

## Prerequisites

1. **Cloudflare account** with Pages access.
2. **GitHub repository** containing the latest Pettabl code.
3. **Supabase project** with production keys (`EXPO_PUBLIC_SUPABASE_*`).
4. **Node 18+** locally for testing (`npm` ships with it).

---

## Step 1 — Prepare the Expo Web Build

All commands run inside the `mobile/` directory.

```bash
cd /Users/siva/Documents/GitHub/pettabl/mobile
npm install
```

> ℹ️ Run `npm install` whenever dependencies change. Cloudflare will do the same during each deployment.

### 1.1 Environment Variables

Ensure `mobile/.env` contains production values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://cxnvsqkeifgbjzrelytl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional R2 config
EXPO_PUBLIC_R2_ACCOUNT_ID=<id>
EXPO_PUBLIC_R2_ACCESS_KEY_ID=<key>
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=<secret>
EXPO_PUBLIC_R2_BUCKET_NAME=<bucket>
EXPO_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
EXPO_PUBLIC_R2_ENDPOINT=https://<id>.r2.cloudflarestorage.com
```

The `EXPO_PUBLIC_*` prefix is required so values are embedded in the web export.

### 1.2 Local Web Export (sanity check)

```bash
npx expo export --platform web --output-dir dist-web --clear
npx serve dist-web   # optional: preview locally
```

Confirm the build renders the web dashboard exactly like the 8083 dev server.

---

## Step 2 — Push Changes to GitHub

Commit your work (including any updated docs/landing page copy):

```bash
cd /Users/siva/Documents/GitHub/pettabl
git add .
git commit -m "prep expo web deployment"
git push origin main
```

---

## Step 3 — Configure Cloudflare Pages

### 3.1 Create/Update Pages Project

1. Visit <https://dash.cloudflare.com> → **Workers & Pages**.
2. Create a new Pages project (or edit existing) connected to the `pettabl` repo.
3. Under **Build settings**, set:
   - **Framework preset:** Other
   - **Root directory:** `mobile`
   - **Build command:** `npx expo export --platform web --output-dir dist --clear`
   - **Build output directory:** `dist`
4. Under **Environment Variables**, add the same `EXPO_PUBLIC_*` values as in `mobile/.env`.

> ✅ Cloudflare will install dependencies via `npm install` (no `bun.lockb` file should exist—already ignored).

### 3.2 Trigger Deployment

Click **Save and Deploy**. The Expo export typically finishes within 3–5 minutes. The output hosts the same UI served locally at `http://localhost:8083`.

---

## Step 4 — Optional Custom Domain

1. In the Pages project, open **Custom domains**.
2. Add `pettabl.com` or the desired subdomain.
3. Follow the DNS instructions; SSL is provisioned automatically.

---

## Step 5 — Supabase Auth Redirects

Update Supabase → **Authentication → URL Configuration** to include the final domain:

```
https://pettabl.pages.dev/*
https://pettabl.com/*
```

Set **Site URL** to the production domain as well. OAuth (Google) should continue using `https://cxnvsqkeifgbjzrelytl.supabase.co/auth/v1/callback`.

---

## Step 6 — Validation Checklist

- [ ] Cloudflare deployment status is `Success`.
- [ ] Landing page displays "Coming Soon" badges for iOS/Android.
- [ ] Pet Boss / Pet Watcher flows work end-to-end (create pet, create watch, switch roles).
- [ ] Uploading activity photos stores/retrieves media correctly.

If any front-end issues appear, rebuild locally with `npx expo start --web` (port 8083) to reproduce before redeploying.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails: `expo` not found | Ensure `npm install` executed in `mobile/` and package-lock is committed. |
| Missing env vars at runtime | Double-check Cloudflare project settings → Environment variables (must start with `EXPO_PUBLIC_`). |
| Old Vite site still served | Verify Pages project root is `mobile` and redeploy; purge CDN cache if necessary. |

---

The Cloudflare Pages deployment now mirrors the Expo web build you view on port **8083** during development.

