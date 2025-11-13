# 🚀 Cloudflare R2 Storage Setup Guide

This guide will walk you through setting up Cloudflare R2 for image storage in your DingDong Pet Pal app.

---

## 📋 What You Need to Provide

After setting up R2 in Cloudflare, you'll need these 6 values:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
R2_ENDPOINT=
```

---

## 🎯 Step 1: Where to Add Your R2 Credentials

### For Web App (Desktop)

1. **Create `.env.local` file** in the root directory:

```bash
cd /Users/siva/Documents/GitHub/dingdong-pet-pal
cp env.local.example .env.local
```

2. **Edit `.env.local`** and replace the placeholder values:

```env
# Supabase Configuration (keep existing)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Cloudflare R2 Configuration (ADD YOUR VALUES HERE)
VITE_R2_ACCOUNT_ID=your-actual-account-id
VITE_R2_ACCESS_KEY_ID=your-actual-access-key-id
VITE_R2_SECRET_ACCESS_KEY=your-actual-secret-access-key
VITE_R2_BUCKET_NAME=dingdong-pet-images
VITE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
VITE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

### For Mobile App (React Native/Expo)

1. **Create `.env` file** in the `mobile/` directory:

```bash
cd /Users/siva/Documents/GitHub/dingdong-pet-pal/mobile
touch .env
```

2. **Edit `mobile/.env`** and add your R2 credentials:

```env
# Cloudflare R2 Configuration (ADD YOUR VALUES HERE)
EXPO_PUBLIC_R2_ACCOUNT_ID=your-actual-account-id
EXPO_PUBLIC_R2_ACCESS_KEY_ID=your-actual-access-key-id
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=your-actual-secret-access-key
EXPO_PUBLIC_R2_BUCKET_NAME=dingdong-pet-images
EXPO_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
EXPO_PUBLIC_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

> **Note**: Mobile uses `EXPO_PUBLIC_` prefix instead of `VITE_`

---

## 🔑 Step 2: Getting Your R2 Values from Cloudflare

### Where Each Value Comes From:

1. **`R2_ACCOUNT_ID`**
   - Found in: R2 dashboard → Overview
   - Looks like: `abc123def456ghi789`

2. **`R2_ACCESS_KEY_ID`**
   - Found in: R2 → Manage R2 API Tokens → Create API Token
   - Looks like: `a1b2c3d4e5f6g7h8i9j0`

3. **`R2_SECRET_ACCESS_KEY`**
   - Found in: Same as above (shown only once!)
   - Looks like: `xyz789uvw456rst123`

4. **`R2_BUCKET_NAME`**
   - The name you chose when creating the bucket
   - Example: `dingdong-pet-images`

5. **`R2_PUBLIC_URL`**
   - **Option A (Quick)**: Enable R2.dev subdomain in bucket settings
     - Format: `https://pub-[hash].r2.dev`
   - **Option B (Production)**: Use custom domain
     - Format: `https://images.yourapp.com`

6. **`R2_ENDPOINT`**
   - Found in: R2 dashboard → Bucket settings
   - Format: `https://[account-id].r2.cloudflarestorage.com`

---

## 📝 Example with Real Values

Here's what it looks like with actual values (don't use these!):

### Web App `.env.local`:
```env
VITE_R2_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0
VITE_R2_ACCESS_KEY_ID=k1l2m3n4o5p6q7r8s9t0
VITE_R2_SECRET_ACCESS_KEY=u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6
VITE_R2_BUCKET_NAME=dingdong-pet-images
VITE_R2_PUBLIC_URL=https://pub-abc123xyz789.r2.dev
VITE_R2_ENDPOINT=https://a1b2c3d4e5f6g7h8i9j0.r2.cloudflarestorage.com
```

### Mobile App `mobile/.env`:
```env
EXPO_PUBLIC_R2_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0
EXPO_PUBLIC_R2_ACCESS_KEY_ID=k1l2m3n4o5p6q7r8s9t0
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6
EXPO_PUBLIC_R2_BUCKET_NAME=dingdong-pet-images
EXPO_PUBLIC_R2_PUBLIC_URL=https://pub-abc123xyz789.r2.dev
EXPO_PUBLIC_R2_ENDPOINT=https://a1b2c3d4e5f6g7h8i9j0.r2.cloudflarestorage.com
```

---

## 🧪 Step 3: Test Your Setup

After adding your credentials:

### Test Web App:
```bash
cd /Users/siva/Documents/GitHub/dingdong-pet-pal
npm run dev
```

### Test Mobile App:
```bash
cd /Users/siva/Documents/GitHub/dingdong-pet-pal/mobile
npm start
```

Try uploading a pet photo to verify R2 is working!

---

## 🎨 What's Been Set Up

### ✅ Completed Setup:

1. **Dependencies Installed**:
   - `@aws-sdk/client-s3` - S3-compatible client for R2
   - `@aws-sdk/lib-storage` - Multipart upload support
   - `buffer` (mobile) - Buffer polyfill for React Native

2. **Utility Files Created**:
   - `src/lib/r2-storage.ts` - Web app R2 utilities
   - `mobile/src/lib/r2-storage.ts` - Mobile app R2 utilities

3. **Features Included**:
   - ✅ Image compression (automatically resizes to 1200px max width)
   - ✅ Unique filename generation (timestamp + random string)
   - ✅ Folder organization (`pets/`, `activities/`, `profiles/`)
   - ✅ Delete functionality
   - ✅ Multi-image upload support
   - ✅ Configuration validation

---

## 🔧 How to Use in Your Code

### Upload a Pet Photo (Web):
```typescript
import { uploadImageToR2 } from '@/lib/r2-storage';

async function handlePetPhotoUpload(file: File) {
  try {
    const imageUrl = await uploadImageToR2(file, 'pets', true);
    console.log('Image uploaded:', imageUrl);
    // Save imageUrl to database
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Upload an Activity Photo (Mobile):
```typescript
import { uploadImageToR2 } from '../lib/r2-storage';
import * as ImagePicker from 'expo-image-picker';

async function handleActivityPhoto() {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    const imageUrl = await uploadImageToR2(result.assets[0].uri, 'activities', true);
    console.log('Activity photo uploaded:', imageUrl);
    // Save to database
  }
}
```

### Delete an Image:
```typescript
import { deleteImageFromR2 } from '@/lib/r2-storage';

async function deletePetPhoto(photoUrl: string) {
  await deleteImageFromR2(photoUrl);
  console.log('Image deleted');
}
```

---

## 🛡️ Security Notes

1. **Never commit `.env.local` or `mobile/.env`** - They're gitignored
2. **Keep your Secret Access Key secure** - It's shown only once
3. **Use R2.dev subdomain for testing** - Set up custom domain for production
4. **Enable bucket versioning** - Protects against accidental deletions

---

## ❓ Troubleshooting

### Error: "Failed to upload image"
- ✅ Check all 6 environment variables are set correctly
- ✅ Verify R2 bucket public access is enabled
- ✅ Ensure API token has Object Read & Write permissions

### Error: "Access Denied"
- ✅ Verify Access Key ID and Secret Access Key are correct
- ✅ Check API token is scoped to the correct bucket

### Images upload but don't display
- ✅ Enable public access on your R2 bucket
- ✅ Verify `R2_PUBLIC_URL` is correct
- ✅ Check CORS settings if accessing from web

---

## 📚 Next Steps

Once R2 is configured:

1. ✅ Test uploading a pet photo from Profile screen
2. ✅ Test uploading activity photos from Agent dashboard
3. ✅ Verify images display correctly in both web and mobile
4. ✅ Set up custom domain (optional, for production)
5. ✅ Configure CDN caching (optional, for performance)

---

**Ready to add your R2 credentials? Follow the steps above and let me know if you need any help!** 🚀

