"""
Real Panchang calculations using the ephem library.
Covers: Tithi, Nakshatra, Yoga, Karana, Choghadiya, Muhurat.
Ayanamsa: Lahiri (Chitrapaksha).
"""

import ephem
import math
from datetime import datetime, date, timedelta
import pytz

# ---------------------------------------------------------------------------
# Name tables
# ---------------------------------------------------------------------------

TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya",
]

TITHI_PAKSHA = (
    ["Shukla"] * 15 + ["Krishna"] * 14 + ["Amavasya"]
)  # 30 entries (index 0-29)

FULL_TITHI_NAMES = [
    "Shukla Pratipada", "Shukla Dwitiya", "Shukla Tritiya", "Shukla Chaturthi",
    "Shukla Panchami", "Shukla Shashthi", "Shukla Saptami", "Shukla Ashtami",
    "Shukla Navami", "Shukla Dashami", "Shukla Ekadashi", "Shukla Dwadashi",
    "Shukla Trayodashi", "Shukla Chaturdashi", "Purnima",
    "Krishna Pratipada", "Krishna Dwitiya", "Krishna Tritiya", "Krishna Chaturthi",
    "Krishna Panchami", "Krishna Shashthi", "Krishna Saptami", "Krishna Ashtami",
    "Krishna Navami", "Krishna Dashami", "Krishna Ekadashi", "Krishna Dwadashi",
    "Krishna Trayodashi", "Krishna Chaturdashi", "Amavasya",
]

NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

YOGA_NAMES = [
    "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti",
]

# Karana: 4 fixed + 7 repeating (×8) = 60 half-tithis
KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja",
    "Vanija", "Vishti",  # 7 movable (repeat)
    "Shakuni", "Chatushpada", "Naga", "Kimstughna",  # 4 fixed
]

# Choghadiya day-start sequence (index = weekday Mon=0..Sun=6 → isoweekday Sun=0)
# Mapping: 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
CHOGHADIYA_TABLE = ["Udveg", "Amrit", "Rog", "Labh", "Shubh", "Kaal", "Char", "Rog"]

# First period of day for each weekday (Sun..Sat)
DAY_CHOGHADIYA_START = {
    0: "Udveg",   # Sun
    1: "Amrit",   # Mon
    2: "Rog",     # Tue
    3: "Labh",    # Wed
    4: "Shubh",   # Thu
    5: "Char",    # Fri
    6: "Kaal",    # Sat
}

# First period of night for each weekday (Sun..Sat)
NIGHT_CHOGHADIYA_START = {
    0: "Shubh",   # Sun
    1: "Char",    # Mon
    2: "Rog",     # Tue  (placeholder – derived via offset)
    3: "Kaal",    # Wed
    4: "Amrit",   # Thu
    5: "Rog",     # Fri
    6: "Labh",    # Sat
}

# Quality labels
CHOGHADIYA_QUALITY = {
    "Amrit": "Excellent",
    "Shubh": "Good",
    "Labh": "Beneficial",
    "Char": "Neutral",
    "Udveg": "Inauspicious",
    "Rog": "Inauspicious",
    "Kaal": "Inauspicious",
}

# Offset of each choghadiya name in the cycle
_CYCLE = ["Udveg", "Amrit", "Rog", "Labh", "Shubh", "Kaal", "Char", "Rog"]


def _choghadiya_sequence(start_name: str) -> list[str]:
    """Return 8 Choghadiya names starting from start_name."""
    idx = _CYCLE.index(start_name) if start_name in _CYCLE else 0
    return [_CYCLE[(idx + i) % len(_CYCLE)] for i in range(8)]


# ---------------------------------------------------------------------------
# Lahiri ayanamsa
# ---------------------------------------------------------------------------

def lahiri_ayanamsa(jd: float) -> float:
    """Approximate Lahiri (Chitrapaksha) ayanamsa in degrees for given Julian Day."""
    # Reference: 23.85° at J2000.0 (JD 2451545.0), increasing ~50.3"/year
    J2000 = 2451545.0
    years = (jd - J2000) / 365.25
    return 23.85 + years * (50.3 / 3600.0)


def tropical_to_sidereal(tropical_deg: float, jd: float) -> float:
    """Convert tropical longitude to sidereal using Lahiri ayanamsa."""
    return (tropical_deg - lahiri_ayanamsa(jd)) % 360.0


# ---------------------------------------------------------------------------
# Core computation
# ---------------------------------------------------------------------------

def _get_sun_moon(date_str: str, lat: float, lon: float):
    """Return (sun_sid, moon_sid, jd, observer) for local noon on date_str."""
    y, m, d = map(int, date_str.split("-"))
    obs = ephem.Observer()
    obs.lat = str(lat)
    obs.lon = str(lon)
    obs.elevation = 0
    obs.pressure = 0  # no refraction
    obs.horizon = "-0:34"

    # Use local midnight UTC approximation; ephem uses UTC
    obs.date = ephem.Date(f"{y}/{m}/{d} 00:00:00")

    sun = ephem.Sun(obs)
    moon = ephem.Moon(obs)

    jd = float(obs.date) + 2415020.0  # ephem epoch offset

    sun_trop = math.degrees(sun.hlong)
    moon_trop = math.degrees(moon.hlong)

    sun_sid = tropical_to_sidereal(sun_trop, jd)
    moon_sid = tropical_to_sidereal(moon_trop, jd)

    return sun_sid, moon_sid, jd, obs


def _compute_tithi(sun_sid: float, moon_sid: float):
    diff = (moon_sid - sun_sid) % 360.0
    tithi_index = int(diff / 12.0)  # 0-29
    tithi_index = min(tithi_index, 29)
    name = FULL_TITHI_NAMES[tithi_index]
    # Percent completed
    percent = ((diff % 12.0) / 12.0) * 100
    return {"name": name, "index": tithi_index + 1, "percent_elapsed": round(percent, 1)}


def _compute_nakshatra(moon_sid: float):
    nak_index = int(moon_sid / (360.0 / 27)) % 27
    name = NAKSHATRA_NAMES[nak_index]
    percent = ((moon_sid % (360.0 / 27)) / (360.0 / 27)) * 100
    return {"name": name, "index": nak_index + 1, "percent_elapsed": round(percent, 1)}


def _compute_yoga(sun_sid: float, moon_sid: float):
    total = (sun_sid + moon_sid) % 360.0
    yoga_index = int(total / (360.0 / 27)) % 27
    name = YOGA_NAMES[yoga_index]
    return {"name": name, "index": yoga_index + 1}


def _compute_karana(sun_sid: float, moon_sid: float):
    diff = (moon_sid - sun_sid) % 360.0
    half_tithi_index = int(diff / 6.0)  # 0-59
    # First half-tithi (index 0) is Kimstughna (fixed), last 3 are fixed too
    # Standard mapping: index 0 = Kimstughna, 1..56 = 7 movable repeating, 57=Shakuni, 58=Chatushpada, 59=Naga
    if half_tithi_index == 0:
        name = "Kimstughna"
    elif half_tithi_index >= 57:
        fixed = ["Shakuni", "Chatushpada", "Naga"]
        name = fixed[half_tithi_index - 57]
    else:
        movable = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"]
        name = movable[(half_tithi_index - 1) % 7]
    return {"name": name, "index": half_tithi_index + 1}


def _get_sunrise_sunset(obs: ephem.Observer, date_str: str):
    """Return sunrise and sunset as UTC ephem.Date objects."""
    y, m, d = map(int, date_str.split("-"))
    obs.date = ephem.Date(f"{y}/{m}/{d} 00:00:00")
    obs.horizon = "-0:34"
    sun = ephem.Sun()
    try:
        sunrise = obs.next_rising(sun)
        sunset = obs.next_setting(sun)
    except ephem.AlwaysUpError:
        # polar summer fallback
        sunrise = ephem.Date(f"{y}/{m}/{d} 06:00:00")
        sunset = ephem.Date(f"{y}/{m}/{d} 18:00:00")
    except ephem.NeverUpError:
        sunrise = ephem.Date(f"{y}/{m}/{d} 06:00:00")
        sunset = ephem.Date(f"{y}/{m}/{d} 18:00:00")
    return sunrise, sunset


def _ephem_to_local_str(ephem_date, tz_str: str) -> str:
    """Convert ephem UTC date to local time string HH:MM."""
    try:
        tz = pytz.timezone(tz_str)
    except Exception:
        tz = pytz.UTC
    # ephem dates are Dublin Julian Day; convert to Python datetime
    dt_utc = ephem.Date(ephem_date).datetime()
    dt_local = pytz.utc.localize(dt_utc).astimezone(tz)
    return dt_local.strftime("%H:%M")


def _time_diff_hours_minutes(start_ephem, end_ephem) -> str:
    """Calculate time difference and return as 'Xh Ym' format."""
    diff_minutes = _ephem_to_minutes(end_ephem) - _ephem_to_minutes(start_ephem)
    hours = int(diff_minutes // 60)
    minutes = int(diff_minutes % 60)
    return f"{hours}h {minutes}m"


def _get_moonrise_moonset(obs: ephem.Observer, date_str: str):
    """Get moonrise and moonset times for the given date."""
    y, m, d = map(int, date_str.split("-"))
    obs.date = ephem.Date(f"{y}/{m}/{d} 00:00:00")
    obs.horizon = "-0:34"
    moon = ephem.Moon()
    try:
        moonrise = obs.next_rising(moon)
        moonset = obs.next_setting(moon)
    except (ephem.AlwaysUpError, ephem.NeverUpError):
        # Fallback if moon doesn't rise/set
        moonrise = None
        moonset = None
    return moonrise, moonset


def _ephem_to_minutes(ephem_date) -> float:
    """Convert ephem date to minutes-since-epoch (for arithmetic)."""
    return float(ephem_date) * 24 * 60  # days → minutes


def _minutes_to_ephem(minutes: float) -> ephem.Date:
    return ephem.Date(minutes / (24 * 60))


def _compute_choghadiya(obs: ephem.Observer, date_str: str, tz_str: str):
    """Compute day and night Choghadiya periods."""
    sunrise, sunset = _get_sunrise_sunset(obs, date_str)

    # Next midnight after sunset (approx)
    y, m, d = map(int, date_str.split("-"))
    next_day = date(y, m, d) + timedelta(days=1)
    nd_y, nd_m, nd_d = next_day.year, next_day.month, next_day.day
    obs.date = ephem.Date(f"{nd_y}/{nd_m}/{nd_d} 00:00:00")
    sun = ephem.Sun()
    try:
        next_sunrise = obs.next_rising(sun)
    except Exception:
        next_sunrise = ephem.Date(f"{nd_y}/{nd_m}/{nd_d} 06:00:00")

    sr_min = _ephem_to_minutes(sunrise)
    ss_min = _ephem_to_minutes(sunset)
    nsr_min = _ephem_to_minutes(next_sunrise)

    day_duration = ss_min - sr_min
    night_duration = nsr_min - ss_min

    day_period = day_duration / 8.0
    night_period = night_duration / 8.0

    # Weekday of date (0=Mon..6=Sun in Python; we need Sun=0..Sat=6)
    weekday_py = date(y, m, d).weekday()  # Mon=0..Sun=6
    weekday_sun0 = (weekday_py + 1) % 7   # Sun=0,Mon=1,...,Sat=6

    day_start_name = DAY_CHOGHADIYA_START.get(weekday_sun0, "Udveg")
    night_start_name = NIGHT_CHOGHADIYA_START.get(weekday_sun0, "Shubh")

    day_seq = _choghadiya_sequence(day_start_name)
    night_seq = _choghadiya_sequence(night_start_name)

    def build_periods(seq, start_min, period_min):
        periods = []
        for i, name in enumerate(seq):
            s = start_min + i * period_min
            e = s + period_min
            periods.append({
                "name": name,
                "quality": CHOGHADIYA_QUALITY.get(name, "Neutral"),
                "start": _ephem_to_local_str(_minutes_to_ephem(s), tz_str),
                "end": _ephem_to_local_str(_minutes_to_ephem(e), tz_str),
            })
        return periods

    return {
        "day": build_periods(day_seq, sr_min, day_period),
        "night": build_periods(night_seq, ss_min, night_period),
        "sunrise": _ephem_to_local_str(sunrise, tz_str),
        "sunset": _ephem_to_local_str(sunset, tz_str),
    }


def _compute_muhurat(obs: ephem.Observer, date_str: str, tz_str: str):
    """Compute key Muhurats for the day."""
    sunrise, sunset = _get_sunrise_sunset(obs, date_str)

    sr_min = _ephem_to_minutes(sunrise)
    ss_min = _ephem_to_minutes(sunset)

    # Brahma Muhurta: 96–48 min before sunrise
    brahma_start = sr_min - 96
    brahma_end = sr_min - 48

    # Abhijit: midday ±24 min
    midday = (sr_min + ss_min) / 2
    abhijit_start = midday - 24
    abhijit_end = midday + 24

    # Vijaya: 3h20m (200 min) before sunset
    vijaya_start = ss_min - 200
    vijaya_end = ss_min - 176

    # Godhuli: sunset ±24 min
    godhuli_start = ss_min - 24
    godhuli_end = ss_min + 24

    # Nishita: midnight ±24 min
    midnight = ss_min + (sr_min + 24 * 60 - ss_min) / 2
    nishita_start = midnight - 24
    nishita_end = midnight + 24

    def fmt(minutes):
        return _ephem_to_local_str(_minutes_to_ephem(minutes), tz_str)

    return [
        {
            "name": "Brahma Muhurta",
            "description": "Auspicious for meditation and spiritual practice",
            "start": fmt(brahma_start),
            "end": fmt(brahma_end),
            "quality": "Excellent",
        },
        {
            "name": "Abhijit Muhurta",
            "description": "Most powerful auspicious period of the day",
            "start": fmt(abhijit_start),
            "end": fmt(abhijit_end),
            "quality": "Excellent",
        },
        {
            "name": "Vijaya Muhurta",
            "description": "Auspicious for victory and new beginnings",
            "start": fmt(vijaya_start),
            "end": fmt(vijaya_end),
            "quality": "Good",
        },
        {
            "name": "Godhuli Muhurta",
            "description": "Sacred twilight period, good for auspicious activities",
            "start": fmt(godhuli_start),
            "end": fmt(godhuli_end),
            "quality": "Good",
        },
        {
            "name": "Nishita Muhurta",
            "description": "Sacred midnight period for deep spiritual practice",
            "start": fmt(nishita_start),
            "end": fmt(nishita_end),
            "quality": "Good",
        },
    ]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_full_panchang(
    date_str: str,
    lat: float = 28.6139,
    lon: float = 77.2090,
    timezone: str = "Asia/Kolkata",
):
    """Compute full Panchang for a given date and location."""
    sun_sid, moon_sid, jd, obs = _get_sun_moon(date_str, lat, lon)

    tithi = _compute_tithi(sun_sid, moon_sid)
    nakshatra = _compute_nakshatra(moon_sid)
    yoga = _compute_yoga(sun_sid, moon_sid)
    karana = _compute_karana(sun_sid, moon_sid)
    choghadiya = _compute_choghadiya(obs, date_str, timezone)
    muhurat = _compute_muhurat(obs, date_str, timezone)

    # Weekday name
    y, m, d = map(int, date_str.split("-"))
    weekday_name = date(y, m, d).strftime("%A")

    # Get sunrise/sunset for day/night duration
    try:
        sunrise_ephem, sunset_ephem = _get_sunrise_sunset(obs, date_str)
        
        # Get moonrise/moonset
        moonrise_ephem, moonset_ephem = _get_moonrise_moonset(obs, date_str)
        moonrise_str = _ephem_to_local_str(moonrise_ephem, timezone) if moonrise_ephem else "N/A"
        moonset_str = _ephem_to_local_str(moonset_ephem, timezone) if moonset_ephem else "N/A"
        
        # Calculate day and night durations
        # Day duration = sunset - sunrise
        day_duration = _time_diff_hours_minutes(sunrise_ephem, sunset_ephem)
        
        # Night duration = 24h - day duration (approximately)
        # More accurately: next sunrise - sunset
        y, m, d = map(int, date_str.split("-"))
        next_day = date(y, m, d) + timedelta(days=1)
        nd_y, nd_m, nd_d = next_day.year, next_day.month, next_day.day
        obs.date = ephem.Date(f"{nd_y}/{nd_m}/{nd_d} 00:00:00")
        sun = ephem.Sun()
        obs.horizon = "-0:34"
        try:
            next_sunrise_ephem = obs.next_rising(sun)
            night_duration = _time_diff_hours_minutes(sunset_ephem, next_sunrise_ephem)
        except Exception as e:
            print(f"Error calculating night duration: {e}")
            night_duration = "N/A"
    except Exception as e:
        print(f"Error in moon/duration calculations: {e}")
        import traceback
        traceback.print_exc()
        moonrise_str = "N/A"
        moonset_str = "N/A"
        day_duration = "N/A"
        night_duration = "N/A"
    
    # Hindu month (simplified - based on nakshatra at new moon or full moon)
    # For now, return a placeholder - proper calculation requires lunisolar calendar
    hindu_month = "N/A"  # TODO: Implement proper Hindu month calculation

    return {
        "date": date_str,
        "weekday": weekday_name,
        "location": {"lat": lat, "lon": lon, "timezone": timezone},
        "tithi": tithi,
        "nakshatra": nakshatra,
        "yoga": yoga,
        "karana": karana,
        "sunrise": choghadiya["sunrise"],
        "sunset": choghadiya["sunset"],
        "moonrise": moonrise_str,
        "moonset": moonset_str,
        "day_duration": day_duration,
        "night_duration": night_duration,
        "hindu_month": hindu_month,
        "choghadiya": {
            "day": choghadiya["day"],
            "night": choghadiya["night"],
        },
        "muhurat": muhurat,
    }


# Backward-compat alias used by existing astro.py import
def compute_simple_panchang(date_str: str, lat: float, lon: float):
    return compute_full_panchang(date_str, lat, lon)
