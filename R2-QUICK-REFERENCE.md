# 🎯 R2 Setup Quick Reference

## Where to Add Your R2 Credentials

### **WEB APP** → `.env.local` (root directory)
```env
VITE_R2_ACCOUNT_ID=
VITE_R2_ACCESS_KEY_ID=
VITE_R2_SECRET_ACCESS_KEY=
VITE_R2_BUCKET_NAME=
VITE_R2_PUBLIC_URL=
VITE_R2_ENDPOINT=
```

### **MOBILE APP** → `mobile/.env`
```env
EXPO_PUBLIC_R2_ACCOUNT_ID=
EXPO_PUBLIC_R2_ACCESS_KEY_ID=
EXPO_PUBLIC_R2_SECRET_ACCESS_KEY=
EXPO_PUBLIC_R2_BUCKET_NAME=
EXPO_PUBLIC_R2_PUBLIC_URL=
EXPO_PUBLIC_R2_ENDPOINT=
```

---

## 📋 Value Mapping

| What You Have | Where It Goes |
|---------------|---------------|
| Account ID | `R2_ACCOUNT_ID` |
| Access Key ID | `R2_ACCESS_KEY_ID` |
| Secret Access Key | `R2_SECRET_ACCESS_KEY` |
| Bucket Name | `R2_BUCKET_NAME` |
| Public URL (R2.dev or custom) | `R2_PUBLIC_URL` |
| Endpoint URL | `R2_ENDPOINT` |

---

## 🚀 After Adding Credentials

1. **Restart your dev servers**:
   ```bash
   # Web
   npm run dev
   
   # Mobile
   cd mobile && npm start
   ```

2. **Test by uploading a pet photo** from the Profile screen

3. **If it works**, you'll see images stored at your `R2_PUBLIC_URL`

---

## 💡 Quick Tips

- ✅ Use `VITE_` prefix for web app
- ✅ Use `EXPO_PUBLIC_` prefix for mobile app
- ✅ Don't commit these files (they're gitignored)
- ✅ Secret Access Key is shown only once - save it!
- ✅ Enable public access on your R2 bucket

---

**Need detailed instructions? See `R2-SETUP-GUIDE.md`**

