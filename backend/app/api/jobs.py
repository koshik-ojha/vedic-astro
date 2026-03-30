from fastapi import APIRouter, Header, HTTPException
from datetime import date as dt_date

from app.config import TELEGRAM_WEBHOOK_SECRET
from app.db import put_daily_cache
from app.services.astrology.daily_generator import generate_sunsign_daily
from app.services.astrology.panchang import compute_simple_panchang

router = APIRouter()

SIGNS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]

@router.post("/generate_daily")
async def generate_daily(x_job_secret: str | None = Header(default=None)):
    # Use the same secret env for MVP. Set GitHub Actions to send header: X-Job-Secret
    if x_job_secret and x_job_secret != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid secret")

    today = dt_date.today().isoformat()

    # Cache panchang for a default location (Delhi). You can store multiple locations later.
    panchang = compute_simple_panchang(today, 28.6139, 77.2090)
    await put_daily_cache(today, "panchang", "delhi", panchang)

    for s in SIGNS:
        msg = generate_sunsign_daily(today, s)
        await put_daily_cache(today, "sunsign", s, msg)

    return {"ok": True, "date": today, "cached": {"panchang": 1, "sunsign": len(SIGNS)}}
