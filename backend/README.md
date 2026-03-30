# Backend (FastAPI) — Free Vedic Astrology Bot

This backend provides:
- Telegram webhook endpoint
- User profile endpoints
- Astrology endpoints (template-based MVP)
- Daily generation job endpoint

## Quickstart (local)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Notes
- This MVP is **template-based** (no paid LLM).
- Plug in `pyswisseph` later inside `app/services/astrology/swiss.py`.
