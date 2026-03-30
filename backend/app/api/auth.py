from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import jwt

from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from app.db import create_user_with_email, get_user_by_email

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


class SignupIn(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def _make_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupIn):
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_ctx.hash(payload.password)
    user = await create_user_with_email(payload.email, payload.name, hashed)
    token = _make_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}


@router.post("/login")
async def login(payload: LoginIn):
    user = await get_user_by_email(payload.email)
    if not user or not pwd_ctx.verify(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _make_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"]}}
