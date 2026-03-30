from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional

from app.db import upsert_profile, get_profile, list_profiles, delete_profile_by_id, update_profile_by_id
from app.api.deps import get_current_user

router = APIRouter()


class ProfileIn(BaseModel):
    profile_name: str = Field(default="My Profile")
    dob: str = Field(..., description="YYYY-MM-DD")
    tob: Optional[str] = Field(None, description="HH:MM (24h)")
    place_name: str
    lat: float
    lon: float
    timezone: str = "Asia/Kolkata"
    ayanamsa: str = "lahiri"
    sun_sign: Optional[str] = None


# ── JWT-protected endpoints ────────────────────────────────────────────────

@router.post("/profile")
async def save_profile(payload: ProfileIn, current_user=Depends(get_current_user)):
    """Save (create or update) a named profile for the logged-in user."""
    return await upsert_profile(current_user["id"], payload.model_dump())


@router.get("/profiles")
async def list_user_profiles(current_user=Depends(get_current_user)):
    """List all profiles for the logged-in user."""
    profiles = await list_profiles(current_user["id"])
    return {"profiles": profiles}


@router.put("/profile/{profile_id}")
async def update_profile(profile_id: str, payload: ProfileIn, current_user=Depends(get_current_user)):
    """Update an existing profile by ID."""
    try:
        return await update_profile_by_id(profile_id, current_user["id"], payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/profile/{profile_id}")
async def remove_profile(profile_id: str, current_user=Depends(get_current_user)):
    """Delete a profile by ID."""
    try:
        await delete_profile_by_id(profile_id, current_user["id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"ok": True}


# ── Legacy endpoint (backward compat for Telegram) ──────────────────────────

@router.get("/profile/legacy/{user_id}")
async def read_profile_legacy(user_id: str):
    prof = await get_profile(user_id)
    if not prof:
        raise HTTPException(status_code=404, detail="Profile not found")
    return prof
