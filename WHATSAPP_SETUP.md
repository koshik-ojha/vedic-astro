# WhatsApp Contact Form Integration Setup

This guide explains how to set up the WhatsApp notification system for your contact form.

## Overview

When users submit the contact form on your website, you'll receive a WhatsApp message with their details instantly on your phone (+91 8128305710).

## Setup Options

You have two options to set up WhatsApp notifications:

### Option 1: Using Twilio (Recommended)

Twilio is a reliable and professional messaging service with a free trial.

#### Steps:

1. **Sign up for Twilio**
   - Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Create a free account (you'll get $15 free credit)

2. **Get your credentials**
   - After signing up, go to your [Twilio Console](https://console.twilio.com)
   - Copy your **Account SID** and **Auth Token**

3. **Set up WhatsApp Sandbox**
   - In Twilio Console, go to "Messaging" → "Try it out" → "Send a WhatsApp message"
   - Follow the instructions to join the sandbox (send a code to Twilio's WhatsApp number)
   - Your sandbox number will be something like: `+1 415 523 8886`

4. **Configure your environment variables**
   - Create/edit `.env` file in the `backend/` directory:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=+14155238886
   RECIPIENT_WHATSAPP_NUMBER=+918128305710
   ```

5. **Install dependencies and restart**
   ```bash
   cd backend
   pip install httpx
   # Restart your backend server
   ```

#### Important Notes:
- The free sandbox requires you to "opt-in" by sending a code to Twilio's WhatsApp number
- For production use without the sandbox, you'll need to:
  - Request WhatsApp Business approval from Twilio
  - This gives you your own WhatsApp Business number
  - Cost: ~$1-2 per month + message costs

### Option 2: Using a Webhook (Alternative)

If you don't want to use Twilio, you can use webhook services like Make.com, Zapier, or similar.

#### Using Make.com (formerly Integromat):

1. **Create a Make.com account**
   - Sign up at [https://www.make.com](https://www.make.com)

2. **Create a new scenario**
   - Create a new scenario
   - Add "Webhooks" → "Custom webhook" as the trigger
   - Copy the webhook URL

3. **Add WhatsApp action**
   - Add "WhatsApp" module
   - Connect your WhatsApp account
   - Configure it to send the message to your number

4. **Configure environment variable**
   ```env
   WHATSAPP_WEBHOOK_URL=https://hook.make.com/your-webhook-id
   ```

5. **Update the backend code**
   - In `backend/app/services/whatsapp.py`, change the import:
   ```python
   from app.services.whatsapp import send_whatsapp_via_webhook as send_whatsapp_message
   ```

#### Using CallMeBot (Simplest, but limited):

1. **Register your WhatsApp number**
   - Send "I allow callmebot to send me messages" to +34 644 44 50 78 (WhatsApp)
   - You'll receive an API key

2. **Configure environment**
   ```env
   WHATSAPP_WEBHOOK_URL=https://api.callmebot.com/whatsapp.php?phone=918128305710&text={message}&apikey=YOUR_API_KEY
   ```

## Testing

1. **Start your backend server**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start your frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the form**
   - Go to `http://localhost:3000`
   - Scroll to the contact form
   - Fill in and submit
   - Check your WhatsApp for the message!

## Troubleshooting

### Messages not being sent?

1. **Check backend logs**
   - Look for error messages in your terminal
   - The backend will log if credentials are missing

2. **Verify environment variables**
   ```bash
   cd backend
   python -c "from app.config import *; print(TWILIO_ACCOUNT_SID, RECIPIENT_WHATSAPP_NUMBER)"
   ```

3. **Test Twilio credentials manually**
   ```bash
   curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json \
     --data-urlencode "From=whatsapp:+14155238886" \
     --data-urlencode "To=whatsapp:+918128305710" \
     --data-urlencode "Body=Test message" \
     -u YOUR_SID:YOUR_AUTH_TOKEN
   ```

### Development mode (no WhatsApp configured)

If you don't configure WhatsApp credentials, the form will still work! Messages will be:
- Logged to the backend console
- Form will show success to the user
- This is perfect for testing

## Security Notes

- **Never commit `.env` file** to git
- Keep your Twilio Auth Token secret
- For production, use environment variables in your hosting platform (Render, Vercel, etc.)

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform:
   - Render.com: Dashboard → Environment → Environment Variables
   - Railway: Project Settings → Variables
   - Vercel: Project Settings → Environment Variables

2. **For frontend** (Vercel/Netlify):
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
   ```

3. **For backend** (Render/Railway):
   - Add all the environment variables from `.env.example`
   - Make sure to include your Twilio credentials

## Cost Estimate

- **Development/Testing**: Free (Twilio trial credit)
- **Production with Twilio**:
  - WhatsApp sandbox: Free but requires opt-in
  - WhatsApp Business API: ~$1-2/month + $0.005-0.01 per message
- **Alternative services**:
  - Make.com: Free tier (1000 operations/month)
  - Zapier: Free tier (100 tasks/month)
  - CallMeBot: Free

## Support

If you encounter issues:
1. Check the backend logs
2. Verify your Twilio credentials
3. Make sure your WhatsApp number is correctly formatted (+918128305710)
4. Test with a simple curl command first

## Next Steps

After setting up, you can:
1. Customize the WhatsApp message format in `backend/app/api/contact.py`
2. Add email notifications as backup
3. Store form submissions in MongoDB
4. Add auto-reply messages to users
