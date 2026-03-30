from typing import Dict, Any

SUNSIGN_TEMPLATES = {
    "aries": "Today favors initiative. Keep communication clear and avoid rushing decisions.",
    "taurus": "Focus on stability and finishing pending tasks. Avoid overindulgence.",
    "gemini": "Great day for learning and networking. Double-check details.",
    "cancer": "Prioritize home and emotional balance. Gentle routines help.",
    "leo": "Confidence is high—lead with kindness. Avoid ego clashes.",
    "virgo": "Good for organizing and health routines. Don’t overthink.",
    "libra": "Harmony matters. Choose diplomacy and set boundaries politely.",
    "scorpio": "Deep focus helps. Avoid unnecessary confrontations.",
    "sagittarius": "Explore new ideas. Keep commitments realistic.",
    "capricorn": "Strong for career planning. Take one practical step.",
    "aquarius": "Innovation flows. Collaborate and stay open-minded.",
    "pisces": "Creativity and intuition are high. Ground yourself with structure.",
}

def generate_sunsign_daily(date_str: str, sign: str) -> str:
    s = (sign or "").strip().lower()
    base = SUNSIGN_TEMPLATES.get(s, "Share your sign (e.g., aries) for a daily message.")
    return base + f"\n\n(Template MVP • Date: {date_str})"

def generate_personalized_daily(date_str: str, profile: Dict[str, Any]) -> str:
    # MVP: simple personalization from profile fields
    place = profile.get("place_name", "your location")
    dob = profile.get("dob", "your DOB")
    tob = profile.get("tob") or "unknown time"
    ay = profile.get("ayanamsa", "lahiri")
    return (
        f"Based on your profile ({dob}, {tob}, {place}) using {ay.title()} ayanamsa, "
        "today is best for steady progress. Focus on 1–2 priorities, avoid impulsive choices, "
        "and keep routines consistent.\n\n"
        "(MVP: replace with natal+transit calculations from Swiss Ephemeris.)"
    )
