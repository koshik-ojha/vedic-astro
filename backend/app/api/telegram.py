from fastapi import APIRouter, Request, HTTPException
from datetime import date as dt_date

from app.config import TELEGRAM_WEBHOOK_SECRET
from app.db import get_or_create_user_by_telegram, get_profile
from app.services.telegram import send_message
from app.services.astrology.daily_generator import generate_sunsign_daily, generate_personalized_daily

router = APIRouter()

HELP = (
    "Namaste 🙏\n"
    "Commands:\n"
    "/start - start\n"
    "/help - help\n"
    "daily aries  -> sun-sign daily\n"
    "personal     -> personalized daily (requires profile)\n\n"
    "To set profile quickly, use the Web app (recommended) or build a /setprofile flow."
)

@router.post("/webhook")
async def telegram_webhook(request: Request):
    # Simple shared-secret header to prevent random calls in MVP
    secret = request.headers.get("x-telegram-secret", "")
    if secret and secret != TELEGRAM_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid secret")

    payload = await request.json()
    message = payload.get("message") or payload.get("edited_message")
    if not message:
        return {"ok": True}

    chat_id = str(message["chat"]["id"])
    from_user = message.get("from", {})
    telegram_user_id = str(from_user.get("id", chat_id))
    name = from_user.get("first_name")

    user = await get_or_create_user_by_telegram(telegram_user_id, name=name)
    text = (message.get("text") or "").strip().lower()

    if text in ("/start", "start"):
        await send_message(chat_id, "Welcome!\n\n" + HELP)
        return {"ok": True}
    if text in ("/help", "help"):
        await send_message(chat_id, HELP)
        return {"ok": True}

    today = dt_date.today().isoformat()

    # Sun-sign daily
    if text.startswith("daily "):
        sign = text.replace("daily", "", 1).strip()
        if not sign:
            await send_message(chat_id, "Please send like: daily aries")
            return {"ok": True}
        content = generate_sunsign_daily(today, sign)
        await send_message(chat_id, f"🌞 {sign.title()} — {today}\n\n{content}")
        return {"ok": True}

    # Personalized daily
    if text.startswith("personal"):
        prof = await get_profile(user["id"])
        if not prof:
            await send_message(
                chat_id,
                "I don't have your birth details yet. Please set your profile in the Web app first (DOB/TOB/Place)."
            )
            return {"ok": True}
        content = generate_personalized_daily(today, prof)
        await send_message(chat_id, f"🪐 Personalized — {today}\n\n{content}")
        return {"ok": True}

    await send_message(chat_id, "I didn't understand. Type /help for options.")
    return {"ok": True}
