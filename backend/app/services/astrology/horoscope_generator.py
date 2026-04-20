"""
Vedic-influenced horoscope generator using Swiss Ephemeris.
Calculates real planetary positions (sidereal/Lahiri) and generates
meaningful horoscope content based on transit house positions.
"""

import swisseph as swe
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Tuple

# ─── Constants ───────────────────────────────────────────────────────────────

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]
SIGN_INDEX = {s.lower(): i for i, s in enumerate(SIGNS)}

PLANET_BODIES = [swe.SUN, swe.MOON, swe.MARS, swe.MERCURY, swe.JUPITER, swe.VENUS, swe.SATURN]
PLANET_NAMES  = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

NAKSHATRA_THEMES = {
    "Ashwini":          ("swift healing and new starts", "avoid rushing"),
    "Bharani":          ("transformation and responsibility", "avoid excess"),
    "Krittika":         ("sharp focus and purification", "avoid harsh criticism"),
    "Rohini":           ("growth, creativity, and abundance", "avoid stubbornness"),
    "Mrigashira":       ("curiosity and seeking", "avoid scattered energy"),
    "Ardra":            ("breakthroughs amid intensity", "seek calm"),
    "Punarvasu":        ("renewal and optimism", "avoid repetition"),
    "Pushya":           ("nurturing and stability", "avoid overprotection"),
    "Ashlesha":         ("strategic depth and intuition", "avoid holding on too tightly"),
    "Magha":            ("authority and ancestral blessings", "temper pride"),
    "Purva Phalguni":   ("creativity and romantic warmth", "avoid overindulgence"),
    "Uttara Phalguni":  ("steady partnerships and service", "avoid dependence"),
    "Hasta":            ("skill, healing, and dexterity", "avoid overthinking"),
    "Chitra":           ("beauty and fresh perspectives", "avoid superficiality"),
    "Swati":            ("independence and balance", "avoid indecision"),
    "Vishakha":         ("focused ambition and results", "avoid obsession"),
    "Anuradha":         ("devoted friendship and love", "avoid jealousy"),
    "Jyeshtha":         ("leadership and wisdom", "avoid control"),
    "Mula":             ("deep roots and transformation", "release what no longer serves"),
    "Purva Ashadha":    ("invincible enthusiasm and purification", "stay grounded"),
    "Uttara Ashadha":   ("righteous victory and patience", "trust the timing"),
    "Shravana":         ("listening, learning, and wisdom", "avoid spreading gossip"),
    "Dhanishtha":       ("prosperity and achievement", "avoid greed"),
    "Shatabhisha":      ("healing and mystical insight", "avoid isolation"),
    "Purva Bhadrapada": ("spiritual intensity and transformation", "balance fire energy"),
    "Uttara Bhadrapada":("deep compassion and wisdom", "avoid escapism"),
    "Revati":           ("completion and spiritual evolution", "embrace endings as new beginnings"),
}

TITHI_PHASE = {
    range(1,  6):  ("the waxing crescent",  "plant seeds of intention"),
    range(6,  9):  ("the first quarter",     "take decisive action"),
    range(9,  14): ("the waxing gibbous",   "build momentum"),
    range(14, 16): ("the full moon",         "celebrate and release"),
    range(16, 21): ("the waning gibbous",   "harvest and reflect"),
    range(21, 24): ("the last quarter",      "release and let go"),
    range(24, 31): ("the waning crescent",  "rest and restore"),
}

# Planet-in-house interpretations: (sentence, advice)
PLANET_HOUSE = {
    ("Sun", 1):  ("The Sun illuminates your first house of self, boosting personal magnetism and vitality.", "Step forward with purpose."),
    ("Sun", 2):  ("Solar energy energises your second house, spotlighting finances and self-worth.", "Make deliberate financial moves."),
    ("Sun", 3):  ("The Sun activates your third house of communication, favouring writing, learning, and short trips.", "Express your ideas confidently."),
    ("Sun", 4):  ("Solar light falls on your fourth house, bringing focus to home, family, and emotional roots.", "Tend to your domestic life."),
    ("Sun", 5):  ("The Sun shines in your fifth house, igniting creativity, romance, and joy.", "Let your authentic self shine."),
    ("Sun", 6):  ("Solar energy activates your sixth house of health and daily routines.", "Prioritise wellness and service."),
    ("Sun", 7):  ("The Sun illuminates your seventh house, highlighting partnerships and one-on-one connections.", "Invest in your relationships."),
    ("Sun", 8):  ("Solar energy moves through your eighth house, triggering deep transformation and shared resources.", "Face change with courage."),
    ("Sun", 9):  ("The Sun brightens your ninth house of higher learning, philosophy, and long journeys.", "Expand your world view."),
    ("Sun", 10): ("Solar energy peaks in your tenth house of career and public reputation.", "Pursue your professional ambitions."),
    ("Sun", 11): ("The Sun activates your eleventh house, expanding your social network and long-term goals.", "Connect with your community."),
    ("Sun", 12): ("Solar energy moves through your twelfth house, inviting introspection and spiritual growth.", "Seek inner wisdom."),

    ("Moon", 1):  ("The Moon transits your first house, heightening emotional sensitivity and personal magnetism.", "Trust your instincts."),
    ("Moon", 2):  ("Lunar energy touches your second house, linking emotional security to material comfort.", "Find stability through gratitude."),
    ("Moon", 3):  ("The Moon activates your third house, blending emotion and communication beautifully.", "Share your feelings openly."),
    ("Moon", 4):  ("The Moon is in your fourth house, its natural home — home life feels nurturing and restorative.", "Spend time with loved ones."),
    ("Moon", 5):  ("Lunar energy enlivens your fifth house, elevating romance, creativity, and playfulness.", "Embrace joy and spontaneity."),
    ("Moon", 6):  ("The Moon transits your sixth house, connecting emotional wellbeing to health and routine.", "Establish nourishing habits."),
    ("Moon", 7):  ("Lunar energy highlights your seventh house, making relationships emotionally charged and meaningful.", "Listen with an open heart."),
    ("Moon", 8):  ("The Moon moves through your eighth house, deepening intuition and surfacing hidden emotions.", "Trust your deeper perceptions."),
    ("Moon", 9):  ("Lunar energy brightens your ninth house, inspiring philosophical reflection and a love of learning.", "Follow your curiosity."),
    ("Moon", 10): ("The Moon transits your tenth house, weaving emotion into your professional life and public image.", "Act with integrity and warmth."),
    ("Moon", 11): ("Lunar energy activates your eleventh house, bringing emotional fulfilment through friendships and groups.", "Lean on your social circle."),
    ("Moon", 12): ("The Moon moves through your twelfth house, inviting quiet reflection and spiritual receptivity.", "Rest and rejuvenate."),

    ("Mars", 1):  ("Mars charges your first house with boldness, energy, and drive.", "Channel ambition constructively."),
    ("Mars", 2):  ("Mars activates your second house, fuelling financial ambition and a desire to earn more.", "Work hard, spend wisely."),
    ("Mars", 3):  ("Martian energy sharpens your third house, making communication assertive and travel active.", "Speak with intention."),
    ("Mars", 4):  ("Mars moves through your fourth house, bringing dynamic energy — and possible tension — to home life.", "Address issues calmly."),
    ("Mars", 5):  ("Mars ignites your fifth house of passion, romance, and creative fire.", "Pursue what excites you."),
    ("Mars", 6):  ("Martian energy boosts your sixth house, sharply increasing work productivity and physical vitality.", "Push through challenges."),
    ("Mars", 7):  ("Mars activates your seventh house, intensifying passion in relationships while requiring patience.", "Choose cooperation over conflict."),
    ("Mars", 8):  ("Mars moves through your eighth house, driving transformation and surfacing buried desires.", "Face the depths with courage."),
    ("Mars", 9):  ("Martian energy lights up your ninth house, inspiring adventurous thinking and a drive for truth.", "Explore boldly."),
    ("Mars", 10): ("Mars activates your tenth house, supercharging career ambition and leadership ability.", "Seize professional opportunities."),
    ("Mars", 11): ("Martian energy fuels your eleventh house, intensifying social goals and group initiatives.", "Lead your network forward."),
    ("Mars", 12): ("Mars moves through your twelfth house, energising behind-the-scenes work and inner battles.", "Work quietly but powerfully."),

    ("Mercury", 1):  ("Mercury transits your first house, sharpening mental clarity and enhancing communication.", "Articulate your ideas boldly."),
    ("Mercury", 2):  ("Mercurial energy activates your second house, favouring financial negotiations and planning.", "Negotiate and analyse wisely."),
    ("Mercury", 3):  ("Mercury is in your third house — its natural home — supercharging communication, learning, and travel.", "Write, speak, and connect."),
    ("Mercury", 4):  ("Mercury transits your fourth house, sparking meaningful conversations about home and family.", "Have heartfelt discussions."),
    ("Mercury", 5):  ("Mercurial energy brightens your fifth house, making you witty, creative, and romantically eloquent.", "Express your playful intellect."),
    ("Mercury", 6):  ("Mercury activates your sixth house, boosting analytical thinking and work efficiency.", "Solve problems with precision."),
    ("Mercury", 7):  ("Mercurial energy illuminates your seventh house, making contract negotiations and partnership talks productive.", "Communicate clearly in relationships."),
    ("Mercury", 8):  ("Mercury transits your eighth house, favouring deep research and financial analysis.", "Investigate thoroughly."),
    ("Mercury", 9):  ("Mercurial energy expands your ninth house, stimulating higher learning and philosophical thinking.", "Explore new ideas."),
    ("Mercury", 10): ("Mercury activates your tenth house, making professional communication especially effective.", "Make your voice heard publicly."),
    ("Mercury", 11): ("Mercurial energy lights up your eleventh house, enhancing networking, technology, and group ideas.", "Collaborate and innovate."),
    ("Mercury", 12): ("Mercury transits your twelfth house, favouring private reflection and meditative journalling.", "Think deeply before acting."),

    ("Jupiter", 1):  ("Jupiter graces your first house with expansion, wisdom, and natural good fortune.", "Welcome abundance openly."),
    ("Jupiter", 2):  ("Jupiterian energy blesses your second house, attracting financial growth and deeper self-worth.", "Invest in your future confidently."),
    ("Jupiter", 3):  ("Jupiter expands your third house, multiplying opportunities for learning, travel, and positive connections.", "Share your wisdom generously."),
    ("Jupiter", 4):  ("Jupiterian energy brightens your fourth house, blessing home, family, and emotional foundations.", "Strengthen your roots."),
    ("Jupiter", 5):  ("Jupiter flourishes in your fifth house, magnifying romance, creativity, and joyful self-expression.", "Celebrate life fully."),
    ("Jupiter", 6):  ("Jupiterian energy supports your sixth house, improving health prospects and making work more rewarding.", "Serve others with joy."),
    ("Jupiter", 7):  ("Jupiter blesses your seventh house, bringing harmony, expansion, and good fortune in partnerships.", "Build meaningful alliances."),
    ("Jupiter", 8):  ("Jupiterian energy moves through your eighth house, bringing hidden blessings through transformation.", "Trust the greater plan."),
    ("Jupiter", 9):  ("Jupiter shines in your ninth house — its own domain — bringing exceptional wisdom, travel, and spiritual growth.", "Seek your highest truth."),
    ("Jupiter", 10): ("Jupiterian energy elevates your tenth house, attracting career recognition and professional expansion.", "Aim for your highest calling."),
    ("Jupiter", 11): ("Jupiter blesses your eleventh house, multiplying social opportunities and helping long-held dreams come true.", "Think expansively."),
    ("Jupiter", 12): ("Jupiterian energy moves through your twelfth house, bringing spiritual blessings and karmic rewards.", "Serve and transcend."),

    ("Venus", 1):  ("Venus graces your first house, enhancing charm, beauty, and the art of attraction.", "Radiate your most magnetic self."),
    ("Venus", 2):  ("Venusian energy flows through your second house, attracting financial comfort and aesthetic pleasures.", "Enjoy life's comforts mindfully."),
    ("Venus", 3):  ("Venus activates your third house, making communication warm, loving, and artistically inspired.", "Express love through words."),
    ("Venus", 4):  ("Venusian energy beautifies your fourth house, creating harmony and warmth in home and family life.", "Create a loving sanctuary."),
    ("Venus", 5):  ("Venus shines in your fifth house — the house of love — making romance, creativity, and pleasure abundant.", "Follow your heart with joy."),
    ("Venus", 6):  ("Venusian energy harmonises your sixth house, bringing beauty and pleasure into health routines and work.", "Balance effort with enjoyment."),
    ("Venus", 7):  ("Venus blesses your seventh house, bringing love, harmony, and deep beauty to all close relationships.", "Cherish and deepen your bonds."),
    ("Venus", 8):  ("Venusian energy deepens your eighth house, inviting transformative love and shared abundance.", "Trust intimacy as a path to growth."),
    ("Venus", 9):  ("Venus brightens your ninth house, inspiring a love of learning, philosophy, and romantic adventures.", "Expand your heart through exploration."),
    ("Venus", 10): ("Venusian energy elevates your tenth house, bringing artistic recognition and professional charm.", "Let your grace lead your career."),
    ("Venus", 11): ("Venus activates your eleventh house, making social life warm, pleasurable, and full of heartfelt connections.", "Enjoy the beauty of friendship."),
    ("Venus", 12): ("Venusian energy flows through your twelfth house, nurturing private romance, artistic solitude, and inner beauty.", "Cultivate beauty within."),

    ("Saturn", 1):  ("Saturn transits your first house, calling for discipline, patience, and genuine self-development.", "Build steadily; lasting results take time."),
    ("Saturn", 2):  ("Saturnine energy disciplines your second house, demanding careful budgeting and long-term financial planning.", "Earn, save, and build wisely."),
    ("Saturn", 3):  ("Saturn moves through your third house, requiring care and precision in all communication and learning.", "Think carefully before speaking."),
    ("Saturn", 4):  ("Saturnine energy tests your fourth house, bringing home and family responsibilities that strengthen foundations.", "Reinforce what truly matters."),
    ("Saturn", 5):  ("Saturn transits your fifth house, requiring patient effort in creative pursuits and romantic endeavours.", "Commit deeply to what you love."),
    ("Saturn", 6):  ("Saturnine energy grounds your sixth house, rewarding consistent health habits and diligent work.", "Maintain discipline in daily life."),
    ("Saturn", 7):  ("Saturn tests your seventh house, strengthening the bonds that are genuine and releasing those that are not.", "Choose your commitments wisely."),
    ("Saturn", 8):  ("Saturnine energy moves through your eighth house, requiring courage and discipline in times of transformation.", "Face challenges with steadfast resolve."),
    ("Saturn", 9):  ("Saturn grounds your ninth house, testing beliefs and rewarding structured, serious learning.", "Pursue wisdom with patience."),
    ("Saturn", 10): ("Saturnine energy focuses on your tenth house, demanding hard work but ultimately delivering lasting career success.", "Rise through persistent effort."),
    ("Saturn", 11): ("Saturn disciplines your eleventh house, requiring patient work toward long-term social goals and aspirations.", "Play the long game."),
    ("Saturn", 12): ("Saturnine energy moves through your twelfth house, clearing karmic patterns through introspection and release.", "Let go of what no longer serves you."),
}

# Opening sentences based on moon phase
MOON_PHASE_OPENINGS = {
    "waxing crescent":  "As the crescent Moon grows in the sky, fresh energy supports new intentions.",
    "first quarter":    "With the Moon at its first quarter, the cosmic tides favour decisive action.",
    "waxing gibbous":   "The swelling Moon amplifies your efforts — momentum is building strongly.",
    "full moon":        "Under the radiant full Moon, emotions and insights reach their peak.",
    "waning gibbous":   "As the Moon begins to wane, it is time to harvest, reflect, and share your gains.",
    "last quarter":     "With the Moon in its last quarter, release what no longer serves your highest good.",
    "waning crescent":  "The fading crescent invites rest, introspection, and quiet restoration.",
}

PERIOD_CLOSINGS = {
    "daily": [
        "Stay centred, move with intention, and trust the energy of the day.",
        "Breathe deeply, act mindfully, and make the most of today's cosmic gifts.",
        "Keep your focus clear and your heart open — today holds real promise.",
    ],
    "weekly": [
        "The week ahead rewards those who plan thoughtfully and act with confidence.",
        "Use this week's planetary support to move closer to your most meaningful goals.",
        "Stay adaptable, remain present, and allow this week to unfold with grace.",
    ],
    "monthly": [
        "This month invites sustained effort and meaningful growth — embrace the journey.",
        "Allow the month's planetary energies to guide you toward your deeper purpose.",
        "Stay committed to your vision this month; the stars are aligning in your favour.",
    ],
}

# Which planets matter most per period type
PERIOD_PLANETS = {
    "daily":   ["Moon", "Sun", "Mercury"],           # fast-moving, changes daily
    "weekly":  ["Moon", "Mars", "Mercury", "Venus"],  # inner planets
    "monthly": ["Sun", "Jupiter", "Saturn", "Mars"],  # slower, big-picture
}


# ─── Calculations ─────────────────────────────────────────────────────────────

def _get_julian_day(dt: datetime) -> float:
    utc_dt = dt.astimezone(pytz.UTC)
    return swe.julday(utc_dt.year, utc_dt.month, utc_dt.day,
                      utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0)


def get_planet_positions(date_str: str, tz_str: str = "Asia/Kolkata") -> Dict[str, Dict]:
    """Return sidereal sign index and longitude for each planet."""
    try:
        tz = pytz.timezone(tz_str)
    except Exception:
        tz = pytz.UTC

    year, month, day = map(int, date_str.split("-"))
    dt = datetime(year, month, day, 12, 0, 0, tzinfo=tz)
    jd = _get_julian_day(dt)

    swe.set_sid_mode(swe.SIDM_LAHIRI)
    positions = {}
    for body, name in zip(PLANET_BODIES, PLANET_NAMES):
        result = swe.calc_ut(jd, body, swe.FLG_SWIEPH + swe.FLG_SIDEREAL)
        lon = result[0][0]
        positions[name] = {
            "longitude": lon,
            "sign_idx":  int(lon / 30) % 12,
            "sign":      SIGNS[int(lon / 30) % 12],
        }
    return positions


def _get_moon_nakshatra(moon_lon: float) -> str:
    idx = int(moon_lon / (360 / 27))
    return NAKSHATRAS[min(idx, 26)]


def _get_tithi(sun_lon: float, moon_lon: float) -> int:
    diff = (moon_lon - sun_lon) % 360
    return max(1, min(30, int(diff / 12) + 1))


def _get_moon_phase(tithi: int) -> str:
    for r, phase_tuple in TITHI_PHASE.items():
        if tithi in r:
            return phase_tuple[0].replace("the ", "")
    return "waning crescent"


def _get_house(planet_sign_idx: int, sun_sign_idx: int) -> int:
    """Transit house = planet sign relative to natal sun sign (Whole Sign)."""
    return (planet_sign_idx - sun_sign_idx) % 12 + 1


# ─── Horoscope Generators ────────────────────────────────────────────────────

def generate_horoscope(sign: str, period: str, date_str: str) -> str:
    """
    Generate a horoscope reading for `sign` (e.g. 'aries') for the given
    `period` ('daily' | 'weekly' | 'monthly') and `date_str` (YYYY-MM-DD).
    """
    sign_lower = sign.strip().lower()
    if sign_lower not in SIGN_INDEX:
        return f"Unknown sign '{sign}'. Please use a standard zodiac sign name."

    sun_sign_idx = SIGN_INDEX[sign_lower]
    positions    = get_planet_positions(date_str)

    moon_lon  = positions["Moon"]["longitude"]
    sun_lon   = positions["Sun"]["longitude"]
    nakshatra = _get_moon_nakshatra(moon_lon)
    tithi     = _get_tithi(sun_lon, moon_lon)
    phase     = _get_moon_phase(tithi)

    # ── Opening based on moon phase
    opening = MOON_PHASE_OPENINGS.get(phase, "The cosmic energies are active and dynamic.")

    # ── Planet-in-house sentences for this period
    relevant_planets = PERIOD_PLANETS.get(period, PERIOD_PLANETS["daily"])
    sentences = []
    for pname in relevant_planets:
        if pname not in positions:
            continue
        house = _get_house(positions[pname]["sign_idx"], sun_sign_idx)
        key   = (pname, house)
        if key in PLANET_HOUSE:
            sentence, _ = PLANET_HOUSE[key]
            sentences.append(sentence)

    # ── Nakshatra influence (especially for daily)
    nak_themes = NAKSHATRA_THEMES.get(nakshatra, ("cosmic awareness", "stay present"))
    nak_positive, nak_caution = nak_themes
    nak_sentence = (
        f"The Moon in {nakshatra} nakshatra brings themes of {nak_positive}; "
        f"{nak_caution}."
    )

    # ── Closing advice
    import hashlib
    seed = int(hashlib.md5(f"{sign}{date_str}{period}".encode()).hexdigest(), 16)
    closings = PERIOD_CLOSINGS.get(period, PERIOD_CLOSINGS["daily"])
    closing = closings[seed % len(closings)]

    # ── Assemble paragraph
    sign_display = sign_lower.capitalize()
    if period == "daily":
        parts = [
            f"{sign_display}, {opening}",
            " ".join(sentences[:2]),
            nak_sentence,
            closing,
        ]
    elif period == "weekly":
        parts = [
            f"{sign_display}, this week {opening.lower()}",
            " ".join(sentences[:3]),
            nak_sentence,
            closing,
        ]
    else:  # monthly
        parts = [
            f"{sign_display}, this month {opening.lower()}",
            " ".join(sentences[:3]),
            (f"The Moon's journey through the nakshatras this month — beginning in {nakshatra} "
             f"with its themes of {nak_positive} — sets a recurring emotional backdrop."),
            closing,
        ]

    return " ".join(p for p in parts if p.strip())
