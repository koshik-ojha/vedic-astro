import requests
from app.config import TELEGRAM_BOT_TOKEN

TELEGRAM_API = "https://api.telegram.org"

async def send_message(chat_id: str, text: str) -> None:
    """Send a message to a Telegram chat. (Async wrapper over requests for MVP)"""
    if not TELEGRAM_BOT_TOKEN:
        # In dev, allow running without token
        return

    url = f"{TELEGRAM_API}/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": chat_id, "text": text})
