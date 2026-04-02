from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date as dt_date

from app.db import get_profile, get_profile_by_id, get_daily_cache
from app.services.astrology.daily_generator import generate_sunsign_daily, generate_personalized_daily
from app.services.astrology.panchang import compute_full_panchang
from app.services.astrology.swiss import get_vedic_panchang

router = APIRouter()

@router.get("/today/panchang")
def today_panchang(
    lat: float = 28.6139,
    lon: float = 77.2090,
    timezone: str = "Asia/Kolkata",
    date: Optional[str] = None,
):
    d = date or dt_date.today().isoformat()
    result = compute_full_panchang(d, lat, lon, timezone)
    print(f"Panchang result keys: {list(result.keys())}")
    print(f"Has moonrise: {'moonrise' in result}, value: {result.get('moonrise', 'NOT FOUND')}")
    return result

@router.get("/today/sunsign")
async def today_sunsign(sign: str, date: Optional[str] = None):
    d = date or dt_date.today().isoformat()
    cached = await get_daily_cache(d, "sunsign", sign.lower())
    if cached:
        return {"date": d, "sign": sign, "content": cached["content"], "cached": True}
    return {"date": d, "sign": sign, "content": generate_sunsign_daily(d, sign), "cached": False}

@router.get("/today/personalized")
async def today_personalized(
    profile_id: Optional[str] = None,
    user_id: Optional[str] = None,
    date: Optional[str] = None,
):
    d = date or dt_date.today().isoformat()
    if profile_id:
        prof = await get_profile_by_id(profile_id)
    elif user_id:
        prof = await get_profile(user_id)
    else:
        raise HTTPException(status_code=400, detail="Provide profile_id or user_id")
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found. Save a profile first.")
    return {"date": d, "content": generate_personalized_daily(d, prof)}

@router.get("/vedic-panchang")
def vedic_panchang(
    lat: float = 28.6139,
    lon: float = 77.2090,
    timezone: str = "Asia/Kolkata",
    date: Optional[str] = None,
):
    """
    Get detailed Vedic Panchang using Swiss Ephemeris.
    Includes: Tithi, Nakshatra, Yoga, Karana, Vara, Choghadiya, and current timings.
    """
    d = date or dt_date.today().isoformat()
    try:
        result = get_vedic_panchang(d, lat, lon, timezone)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating panchang: {str(e)}")

