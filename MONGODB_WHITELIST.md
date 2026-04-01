# MongoDB Atlas IP Whitelist Setup

## Required Action: Whitelist Backend IPs

Your backend is deployed on **Render.com** and needs access to MongoDB Atlas. Follow these steps:

### Step-by-Step Instructions

1. **Go to MongoDB Atlas**
   - Visit: https://cloud.mongodb.com/
   - Log in with your credentials

2. **Navigate to Network Access**
   - Select your project (if you have multiple)
   - In the left sidebar, under **SECURITY**, click **Network Access**

3. **Add Render.com IP Ranges**
   
   Click **"+ ADD IP ADDRESS"** and add each of these:

   **IP Range 1:**
   ```
   74.220.48.0/24
   ```
   - Comment: `Render Backend - Range 1`
   - Click **Confirm**

   **IP Range 2:**
   ```
   74.220.56.0/24
   ```
   - Comment: `Render Backend - Range 2`
   - Click **Confirm**

4. **Verify**
   - You should see both IP ranges listed in the Network Access page
   - Status should show as "Active"

### Screenshots Reference

Your Network Access page should look like this:

```
IP Address            Comment                  Status
74.220.48.0/24       Render Backend - Range 1  Active
74.220.56.0/24       Render Backend - Range 2  Active
```

### Alternative: Allow Access from Anywhere (Less Secure)

If you're still testing or having issues:

1. Click **"+ ADD IP ADDRESS"**
2. Click **"ALLOW ACCESS FROM ANYWHERE"**
3. This will add `0.0.0.0/0`
4. **Warning**: This is less secure. Use Render IPs in production.

### For Railway.app Users

If you're deploying to Railway instead of Render:
- Railway uses dynamic IPs
- You must add `0.0.0.0/0` (allow from anywhere)
- Or use MongoDB VPC peering (paid feature)

### Troubleshooting

**Error: "MongoServerError: connection refused"**
- Solution: Check if IPs are whitelisted

**Error: "MongoServerError: authentication failed"**
- Solution: Check username/password in MONGODB_URL

**Error: "MongoServerError: network timeout"**
- Solution: 
  1. Verify IP whitelist is active
  2. Check MongoDB cluster is running
  3. Verify connection string format

### Current MongoDB Configuration

From your `.env` file:
```
MONGODB_URL=mongodb+srv://koshikojha_db_user:BUoA78mU4Zzt2i5Z@vedicastrobot.hdkhfcb.mongodb.net/?appName=vedicastrobot
MONGODB_DB_NAME=vedic_astro_bot
```

- **Cluster**: vedicastrobot.hdkhfcb.mongodb.net
- **Database**: vedic_astro_bot
- **User**: koshikojha_db_user

### Testing the Connection

After adding IPs, test from your local machine:

```bash
# Test with MongoDB shell
mongosh "mongodb+srv://koshikojha_db_user:BUoA78mU4Zzt2i5Z@vedicastrobot.hdkhfcb.mongodb.net/?appName=vedicastrobot"

# Or using Python
python -c "from motor.motor_asyncio import AsyncIOMotorClient; import asyncio; async def test(): client = AsyncIOMotorClient('mongodb+srv://koshikojha_db_user:BUoA78mU4Zzt2i5Z@vedicastrobot.hdkhfcb.mongodb.net/?appName=vedicastrobot'); await client.admin.command('ping'); print('Connected!'); asyncio.run(test())"
```

### After Whitelisting

Once you've added the IPs:
1. **Redeploy** your backend on Render (if already deployed)
2. Or **Deploy** for the first time
3. Check the logs in Render dashboard
4. You should see: `Connected to MongoDB: vedic_astro_bot`

### Need Help?

- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas/security/ip-access-list/
- Render Docs: https://render.com/docs/web-services#accessing-databases

---

**✅ Once completed**, your backend will be able to connect to MongoDB and handle authentication (login/signup) properly.
