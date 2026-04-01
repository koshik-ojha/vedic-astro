# VERCEL DEPLOYMENT FIX - CHECKLIST

## ❌ Problem
Frontend on Vercel is trying to connect to `https://vedic-astro-backend-rox2.onrender.com` instead of production backend

## ✅ Solution Checklist

### Step 1: Get Your Backend URL
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your backend service (e.g., `vedic-astro-backend`)
3. Copy the URL at the top (e.g., `https://vedic-astro-backend.onrender.com`)

### Step 2: Configure Vercel Environment Variable
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `vedic-astro`
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add new variable:
   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://your-backend-url.onrender.com
   ```
   (Replace with YOUR actual Render backend URL)
6. Check ALL environments: ✅ Production ✅ Preview ✅ Development
7. Click **Save**

### Step 3: Redeploy on Vercel
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots (⋮)** on the right
4. Click **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)

### Step 4: Push Backend Update (CORS Fix)
```bash
git add backend/app/main.py
git commit -m "Fix CORS for Vercel deployment"
git push
```

### Step 5: Verify MongoDB Whitelist
Make sure these IPs are whitelisted in MongoDB Atlas:
- `74.220.48.0/24`
- `74.220.56.0/24`

### Step 6: Test
1. Open: https://vedic-astro-phi.vercel.app/
2. Try to login
3. Open browser DevTools (F12) → Network tab
4. Verify requests go to your Render URL (not localhost)

## 🐛 Debugging

### How to verify the backend URL in production:
1. Open: https://vedic-astro-phi.vercel.app/
2. Press F12 (DevTools)
3. Go to Console tab
4. Type: `console.log(process.env.NEXT_PUBLIC_BACKEND_URL)`
5. This should show your Render URL (not localhost)

### Common Issues:
1. **"Failed to fetch"** → Backend might be sleeping (Render free tier). Visit backend URL to wake it up
2. **CORS error** → Make sure backend is redeployed with CORS fix
3. **404 errors** → Check backend URL is correct (no trailing slash)
4. **Still showing localhost** → Clear Vercel cache: Settings → Clear Cache & Redeploy

## 📝 Environment Variables Reference

**Vercel (Frontend):**
- `NEXT_PUBLIC_BACKEND_URL` = Your Render backend URL

**Render (Backend):**
- `MONGODB_URL` = Your MongoDB connection string
- `JWT_SECRET` = Your JWT secret
- `TELEGRAM_BOT_TOKEN` = (if using Telegram)
- Add more as needed from backend/.env.example
