# Vedic Astrology Bot — Free Starter (Telegram + Web)

This repo includes two projects:
- `backend/` — Python FastAPI API server (Telegram webhook + astrology endpoints)
- `frontend/` — Next.js web UI to test the backend

## Run locally
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Telegram webhook
After deploying backend, set webhook to:
- `https://YOUR_BACKEND/telegram/webhook`

Then message your bot.
