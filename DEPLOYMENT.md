# Deployment Guide - Vedic Astro

This guide will help you deploy your application to production with:
- **Frontend**: Vercel (https://vedic-astro-phi.vercel.app/)
- **Backend**: Render.com or Railway.app

## 🚀 Backend Deployment (Render.com)

### Step 1: Create a Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### Step 2: Deploy the Backend

#### Option A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"**

#### Option B: Manual Setup
1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository
3. Configure:
   - **Name**: `vedic-astro-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `PYTHONPATH=/opt/render/project/src uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 3: Whitelist Backend IPs in MongoDB Atlas

**Important**: Your backend needs to connect to MongoDB. Add these IP addresses to your MongoDB Atlas whitelist:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster → **Network Access** (in Security section)
3. Click **"Add IP Address"**
4. Add these Render.com IPs:
   ```
   74.220.48.0/24
   74.220.56.0/24
   ```
5. For each IP:
   - Click **"Add IP Address"**
   - Paste the IP range (e.g., `74.220.48.0/24`)
   - Add a comment: "Render Backend"
   - Click **"Confirm"**

**Note**: If you're using Railway instead of Render, you'll need to add `0.0.0.0/0` (allow from anywhere) as Railway uses dynamic IPs.

### Step 4: Set Environment Variables in Render

In your Render web service, go to **Environment** tab and add:

```bash
MONGODB_URL=mongodb+srv://koshikojha_db_user:BUoA78mU4Zzt2i5Z@vedicastrobot.hdkhfcb.mongodb.net/?appName=vedicastrobot
MONGODB_DB_NAME=vedic_astro_bot
JWT_SECRET=vedic-astro-super-secret-key-change-in-production-to-random-string
JWT_EXPIRE_MINUTES=10080
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=change-me-to-random-string
APP_BASE_URL=https://your-backend-url.onrender.com
TWILIO_ACCOUNT_SID=ACe3d721a5f012c25cb27a8040bcf37608
TWILIO_AUTH_TOKEN=6840c83678e1de7ad087015e8b98a7a8
TWILIO_WHATSAPP_NUMBER=+14155238886
RECIPIENT_WHATSAPP_NUMBER=+918320709710
PYTHONPATH=/opt/render/project/src
```

**Important**: 
- Replace `your-backend-url` with your actual Render URL (e.g., `vedic-astro-backend.onrender.com`)
- Keep your MongoDB credentials secure
- Generate a new random `JWT_SECRET` for production

### Step 5: Deploy
1. Click **"Create Web Service"** or **"Apply Blueprint"**
2. Wait for deployment (usually 2-5 minutes)
3. Copy your backend URL (e.g., `https://vedic-astro-backend.onrender.com`)
4. Check logs to verify MongoDB connection is successful

---

## 🌐 Frontend Deployment (Vercel)

Your frontend is already deployed at: **https://vedic-astro-phi.vercel.app/**

### Update Frontend to Use Production Backend

#### Step 1: Set Environment Variable in Vercel
1. Go to [vercel.com](https://vercel.com) and open your project
2. Go to **Settings** → **Environment Variables**
3. Add this variable:
   - **Name**: `NEXT_PUBLIC_BACKEND_URL`
   - **Value**: `https://your-backend-url.onrender.com` (your Render backend URL)
   - **Environment**: Check all (Production, Preview, Development)
4. Click **"Save"**

#### Step 2: Redeploy Frontend
1. Go to **Deployments** tab
2. Click the "..." menu on the latest deployment
3. Click **"Redeploy"** to apply the new environment variable

OR just push a new commit to trigger redeployment.

---

## 🔧 Alternative: Railway.app (Instead of Render)

Railway is another great option for backend deployment:

### Deploy to Railway:
1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository and choose `backend` folder
4. Railway will auto-detect Python
5. Add environment variables (same as above)
6. In **Settings**:
   - **Start Command**: `PYTHONPAT

**MongoDB Whitelist for Railway**: Railway uses dynamic IPs, so in MongoDB Atlas, whitelist `0.0.0.0/0` (allow from anywhere) or use a MongoDB connection string with VPC peering.H=/app uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

---

## ✅ Testing Your Deployment

### Test Backend:
```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Expected response:
{"status":"ok"}

# Test signup
curl -X POST https://your-backend-url.onrender.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Expected: Returns token and user data
```

### Test Frontend:
1. Visit https://vedic-astro-phi.vercel.app/
2. Try to register or login
3. Check browser console for any CORS errors (should be none)

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a random string (use `openssl rand -hex 32`)
- [ ] Update `TELEGRAM_WEBHOOK_SECRET` to a random string
- [ ] Verify MongoDB credentials are secure
- [ ] Check CORS settings allow only your frontend URL
- [ ] Enable HTTPS (Render/Railway/Vercel provide this by default)
- [ ] Review all environment variables for sensitive data

---

## 🐛 Troubleshooting

### Backend won't start:
- Check logs in Render/Railway dashboard
- **MongoDB connection fails**: Check if backend IPs are whitelisted in MongoDB Atlas:
  - For Render.com: Add `74.220.48.0/24` and `74.220.56.0/24`
  - For Railway: Add `0.0.0.0/0` (allow from anywhere)
- Verify `PYTHONPATH` is set correctly
- Verify MongoDB connection string is correct

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_BACKEND_URL` is set in Vercel
- Check CORS settings in `backend/app/main.py`
- Verify backend is running (check health endpoint)

### Authentication errors:
- Verify `JWT_SECRET` is the same in all environments
- Check MongoDB connection is working
- Verify user collection exists in database

---

## 📝 Environment Variables Summary

### Backend (.env)
```bash
MONGODB_URL=mongodb+srv://...
MONGODB_DB_NAME=vedic_astro_bot
JWT_SECRET=random-secret-here
JWT_EXPIRE_MINUTES=10080
APP_BASE_URL=https://your-backend-url.onrender.com
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_WEBHOOK_SECRET=random-secret
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=+14155238886
RECIPIENT_WHATSAPP_NUMBER=+918320709710
PYTHONPATH=/opt/render/project/src
```

### Frontend (Vercel Environment Variables)
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
```

---

## 🎉 You're Done!

Your application should now be fully deployed and accessible at:
- **Frontend**: https://vedic-astro-phi.vercel.app/
- **Backend**: https://your-backend-url.onrender.com/

Need help? Check the logs in your deployment platform's dashboard.
