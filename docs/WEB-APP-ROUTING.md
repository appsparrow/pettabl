# Web App Routing Configuration

## Overview

The web app is now accessible at `/auth` while the landing page remains at `/` and is not linked to the app.

---

## URL Structure

### Landing Page
- **URL:** `/` (root)
- **Purpose:** Marketing/landing page
- **Access:** Public, no authentication required
- **Content:** Features, waitlist signup, "Coming Soon" banners
- **No links to app:** Landing page does not navigate to `/auth`

### Web App
- **URL:** `/auth`
- **Purpose:** Full web application (auth + dashboards)
- **Access:** 
  - Unauthenticated users see Auth screen (Sign In/Sign Up)
  - Authenticated users see the full app (dashboards, pets, etc.)
- **Content:** Complete Pettabl functionality

---

## Routing Behavior

### Unauthenticated Users

**At `/`:**
- Shows Landing page
- Can sign up for waitlist
- No navigation to `/auth` from landing page

**At `/auth`:**
- Shows Auth screen (Sign In/Sign Up)
- Can authenticate via email/password or Google OAuth
- After authentication, automatically shows the app

### Authenticated Users

**At `/`:**
- Automatically redirected to `/auth`
- Landing page is not accessible when logged in

**At `/auth`:**
- Shows full web application
- Access to all features (dashboards, pets, schedules, etc.)

---

## Technical Implementation

### URL-Based Routing

React Navigation's `linking` configuration maps URLs to routes:

```typescript
const linking = {
  prefixes: ['/'],
  config: {
    screens: {
      Landing: '/',
      Auth: '/auth',
    },
  },
};
```

### Automatic Redirects

- Authenticated users visiting `/` are redirected to `/auth` via `useEffect`
- Uses `window.history.replaceState()` for seamless redirect

### Initial Route Detection

On page load, the app checks `window.location.pathname`:
- If path is `/auth` or starts with `/auth/` → Show Auth route
- Otherwise → Show Landing route

---

## Testing

### Test Scenarios

1. **Visit `/` (not logged in)**
   - ✅ Should show landing page
   - ✅ No "Get Started" button that navigates to auth

2. **Visit `/auth` (not logged in)**
   - ✅ Should show Auth screen (Sign In/Sign Up)

3. **Sign in at `/auth`**
   - ✅ Should show full app after authentication

4. **Visit `/` (logged in)**
   - ✅ Should automatically redirect to `/auth`
   - ✅ Should show full app

5. **Visit `/auth` (logged in)**
   - ✅ Should show full app directly

---

## Mobile App

**No changes** - Mobile app behavior remains the same:
- Opens directly to Auth screen (no landing page)
- After authentication, shows dashboards

---

## Deployment Considerations

### Cloudflare Pages

When deploying to Cloudflare Pages:

1. **Root path (`/`)** serves the landing page
2. **Auth path (`/auth`)** serves the web app
3. Both routes are handled by the same Expo web build
4. React Navigation handles client-side routing

### SPA Configuration

The app is a Single Page Application (SPA), so:
- All routes are handled client-side
- No server-side routing needed
- Cloudflare Pages should serve `index.html` for all routes

**Cloudflare Pages Configuration:**
- Build output: `dist/` (from `expo export --platform web`)
- Single Page Application: Yes
- All routes serve `index.html`

---

## Future Enhancements

Potential improvements:
- Add `/auth/dashboard` for direct dashboard access
- Add `/auth/pets/:id` for direct pet detail links
- Add `/auth/sessions/:id` for direct session links
- Implement proper deep linking for shared content

---

## Summary

✅ **Landing page** at `/` - Marketing only, no app links  
✅ **Web app** at `/auth` - Full functionality  
✅ **Automatic redirects** - Authenticated users at `/` → `/auth`  
✅ **Mobile unchanged** - Still opens to Auth screen  

**Last Updated:** Current session  
**Status:** ✅ Implemented and ready for testing

