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

# Start the server using one of these methods:

# Method 1: Using the startup script (Windows)
.\start.ps1

# Method 2: Using the startup script (Linux/Mac)
chmod +x start.sh
./start.sh

# Method 3: Manual command
# Windows PowerShell:
$env:PYTHONPATH = "$pwd"; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Linux/Mac:
PYTHONPATH=$(pwd) python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Notes
- This MVP is **template-based** (no paid LLM).
- Plug in `pyswisseph` later inside `app/services/astrology/swiss.py`.
