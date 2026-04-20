"""Swiss Ephemeris integration for Vedic Panchang calculations.

Implements:
- Sunrise/Sunset/Moonrise/Moonset using astronomical engine
- Tithi, Nakshatra, Yoga, Karana calculations
- Choghadiya (day and night periods)
- Current Tithi/Yoga/Karana with end times
"""

import swisseph as swe
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Tuple, Optional
import math

# Set ephemeris path (optional, will use built-in data)
swe.set_ephe_path(None)

# Name tables
TITHI_NAMES = [
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

# Karana mapping (proper sequence with fixed karanas)
KARANA_MAP = [
    "Kimstughna",  # 0 (fixed)
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 1-7
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 8-14
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 15-21
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 22-28
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 29-35
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 36-42
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 43-49
    "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",  # 50-56
    "Shakuni", "Chatushpada", "Naga",  # 57-59 (fixed)
]

VARA_NAMES = {
    "Sunday": "Raviwar",
    "Monday": "Somwar",
    "Tuesday": "Mangalwar",
    "Wednesday": "Budhwar",
    "Thursday": "Guruwar",
    "Friday": "Shukrawar",
    "Saturday": "Shaniwar"
}

# Choghadiya sequences for each weekday
CHOGHADIYA_DAY_SEQUENCES = {
    "Sunday": ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
    "Monday": ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],
    "Tuesday": ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
    "Wednesday": ["Rog", "Kaal", "Labh", "Shubh", "Amrit", "Char", "Udveg", "Rog"],
    "Thursday": ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
    "Friday": ["Labh", "Amrit", "Char", "Rog", "Kaal", "Udveg", "Shubh", "Labh"],
    "Saturday": ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"]
}

CHOGHADIYA_NIGHT_SEQUENCES = {
    "Sunday": ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],
    "Monday": ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
    "Tuesday": ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],
    "Wednesday": ["Rog", "Udveg", "Shubh", "Amrit", "Char", "Kaal", "Labh", "Rog"],
    "Thursday": ["Labh", "Amrit", "Char", "Rog", "Kaal", "Udveg", "Shubh", "Labh"],
    "Friday": ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
    "Saturday": ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"]
}

CHOGHADIYA_QUALITY = {
    "Amrit": "Excellent",
    "Shubh": "Good",
    "Labh": "Beneficial",
    "Char": "Neutral",
    "Udveg": "Inauspicious",
    "Rog": "Inauspicious",
    "Kaal": "Inauspicious",
}

# Hindu solar months (based on Sun's sidereal rashi)
HINDU_MONTHS = [
    "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha",
    "Shravana", "Bhadrapada", "Ashwin", "Kartika",
    "Margashirsha", "Pausha", "Magha", "Phalguna"
]

# Hora: Chaldean planet order (slowest to fastest)
CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]

# Index of first hora planet for each weekday
HORA_DAY_START = {
    "Sunday": 3, "Monday": 6, "Tuesday": 2,
    "Wednesday": 5, "Thursday": 1, "Friday": 4, "Saturday": 0,
}

HORA_QUALITY = {
    "Sun": "Good", "Moon": "Beneficial", "Mars": "Inauspicious",
    "Mercury": "Neutral", "Jupiter": "Excellent",
    "Venus": "Good", "Saturn": "Inauspicious",
}

# Festivals lookup: (solar_month_0idx, tithi_1to30) -> name
# tithi 1-15 = Shukla 1-15, 16-30 = Krishna 1-15 (30 = Amavasya)
FESTIVALS_DB = {
    (0, 1):  "Ugadi / Gudi Padwa",
    (0, 9):  "Ram Navami",
    (0, 13): "Hanuman Jayanti",
    (1, 3):  "Akshaya Tritiya",
    (3, 15): "Guru Purnima",
    (4, 5):  "Nag Panchami",
    (4, 15): "Raksha Bandhan",
    (5, 4):  "Ganesh Chaturthi",
    (5, 23): "Janmashtami",
    (6, 1):  "Navratri Begins",
    (6, 10): "Dussehra / Vijaya Dashami",
    (6, 15): "Sharad Purnima",
    (7, 28): "Dhanteras",
    (7, 29): "Naraka Chaturdashi",
    (7, 30): "Diwali / Lakshmi Puja",
    (7, 17): "Bhai Dooj",
    (10, 5): "Vasant Panchami",
    (11, 14):"Holika Dahan",
    (11, 15):"Holi",
}


def get_julian_day(dt: datetime) -> float:
    """Convert datetime to Julian Day."""
    year = dt.year
    month = dt.month
    day = dt.day
    hour = dt.hour + dt.minute / 60.0 + dt.second / 3600.0
    
    jd = swe.julday(year, month, day, hour)
    return jd


def get_sidereal_position(body: int, jd: float) -> float:
    """Get sidereal longitude of a body (Sun=0, Moon=1)."""
    # Use Lahiri ayanamsa (swe.SIDM_LAHIRI = 1)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Calculate position
    result = swe.calc_ut(jd, body, swe.FLG_SWIEPH + swe.FLG_SIDEREAL)
    longitude = result[0][0]  # First element is longitude
    return longitude


def get_sunrise_sunset(dt: datetime, lat: float, lon: float, tz_str: str) -> Dict:
    """Calculate sunrise and sunset times."""
    try:
        tz = pytz.timezone(tz_str)
    except:
        tz = pytz.UTC
    
    # Get date at midnight
    date_midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Julian day for the date
    jd = get_julian_day(date_midnight)
    
    # Calculate sunrise and sunset
    # rise_trans(tjdut, body, rsmi, geopos[lon,lat,alt], atpress, attemp, flags)
    # returns (res, tret_tuple): res==0 found, tret[0] is JD of event
    geopos = (lon, lat, 0.0)
    result_rise = swe.rise_trans(jd, swe.SUN, swe.CALC_RISE, geopos)
    result_set  = swe.rise_trans(jd, swe.SUN, swe.CALC_SET,  geopos)

    if result_rise[0] == 0:  # 0 = event found
        sunrise_dt = jd_to_datetime(result_rise[1][0], tz)
    else:
        sunrise_dt = date_midnight.replace(hour=6, minute=0)

    if result_set[0] == 0:
        sunset_dt = jd_to_datetime(result_set[1][0], tz)
    else:
        sunset_dt = date_midnight.replace(hour=18, minute=0)
    
    return {
        "sunrise": sunrise_dt,
        "sunset": sunset_dt,
        "sunrise_str": sunrise_dt.strftime("%H:%M"),
        "sunset_str": sunset_dt.strftime("%H:%M")
    }


def get_moonrise_moonset(dt: datetime, lat: float, lon: float, tz_str: str) -> Dict:
    """Calculate moonrise and moonset times."""
    try:
        tz = pytz.timezone(tz_str)
    except:
        tz = pytz.UTC
    
    date_midnight = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    jd = get_julian_day(date_midnight)
    
    # rise_trans(tjdut, body, rsmi, geopos[lon,lat,alt], atpress, attemp, flags)
    # returns (res, tret_tuple): res==0 found, tret[0] is JD of event
    geopos = (lon, lat, 0.0)
    result_rise = swe.rise_trans(jd, swe.MOON, swe.CALC_RISE, geopos)
    result_set  = swe.rise_trans(jd, swe.MOON, swe.CALC_SET,  geopos)

    moonrise_dt = None
    moonset_dt = None

    if result_rise[0] == 0:
        moonrise_dt = jd_to_datetime(result_rise[1][0], tz)

    if result_set[0] == 0:
        moonset_dt = jd_to_datetime(result_set[1][0], tz)
    
    return {
        "moonrise": moonrise_dt,
        "moonset": moonset_dt,
        "moonrise_str": moonrise_dt.strftime("%H:%M") if moonrise_dt else "N/A",
        "moonset_str": moonset_dt.strftime("%H:%M") if moonset_dt else "N/A"
    }


def jd_to_datetime(jd: float, tz) -> datetime:
    """Convert Julian Day to datetime in given timezone."""
    result = swe.revjul(jd)
    year, month, day, hour = int(result[0]), int(result[1]), int(result[2]), result[3]
    hours = int(hour)
    minutes = int((hour - hours) * 60)
    seconds = int(((hour - hours) * 60 - minutes) * 60)
    
    dt_utc = datetime(year, month, day, hours, minutes, seconds, tzinfo=pytz.UTC)
    return dt_utc.astimezone(tz)


def calculate_tithi(sun_lon: float, moon_lon: float) -> Dict:
    """Calculate Tithi based on Moon-Sun angular separation."""
    diff = (moon_lon - sun_lon) % 360
    tithi_index = int(diff / 12)
    
    if tithi_index >= 30:
        tithi_index = 29
    
    percent = ((diff % 12) / 12) * 100
    
    return {
        "name": TITHI_NAMES[tithi_index],
        "index": tithi_index + 1,
        "percent_elapsed": round(percent, 1)
    }


def calculate_nakshatra(moon_lon: float) -> Dict:
    """Calculate Nakshatra based on sidereal Moon longitude."""
    nakshatra_index = int(moon_lon / (360 / 27))
    
    if nakshatra_index >= 27:
        nakshatra_index = 26
    
    percent = ((moon_lon % (360 / 27)) / (360 / 27)) * 100
    pada = int((moon_lon % (360 / 27)) / ((360 / 27) / 4)) + 1
    
    return {
        "name": NAKSHATRA_NAMES[nakshatra_index],
        "index": nakshatra_index + 1,
        "percent_elapsed": round(percent, 1),
        "pada": pada
    }


def calculate_yoga(sun_lon: float, moon_lon: float) -> Dict:
    """Calculate Yoga based on sum of Sun and Moon longitudes."""
    total = (sun_lon + moon_lon) % 360
    yoga_index = int(total / (360 / 27))
    
    if yoga_index >= 27:
        yoga_index = 26
    
    percent = ((total % (360 / 27)) / (360 / 27)) * 100
    
    return {
        "name": YOGA_NAMES[yoga_index],
        "index": yoga_index + 1,
        "percent_elapsed": round(percent, 1)
    }


def calculate_karana(sun_lon: float, moon_lon: float) -> Dict:
    """Calculate Karana (half-tithi)."""
    diff = (moon_lon - sun_lon) % 360
    karana_index = int(diff / 6)
    
    if karana_index >= 60:
        karana_index = 59
    
    name = KARANA_MAP[karana_index] if karana_index < len(KARANA_MAP) else "Unknown"
    
    return {
        "name": name,
        "index": karana_index + 1
    }


def calculate_vara(dt: datetime) -> Dict:
    """Calculate Vara (weekday)."""
    weekday_name = dt.strftime("%A")
    vara_name = VARA_NAMES.get(weekday_name, weekday_name)
    
    return {
        "english": weekday_name,
        "sanskrit": vara_name
    }


def calculate_day_night_duration(sunrise: datetime, sunset: datetime, next_sunrise: datetime) -> Dict:
    """Calculate day and night durations."""
    day_duration = sunset - sunrise
    night_duration = next_sunrise - sunset
    
    def format_duration(td: timedelta) -> str:
        total_seconds = int(td.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m"
    
    return {
        "day_duration": format_duration(day_duration),
        "night_duration": format_duration(night_duration)
    }


def calculate_choghadiya(sunrise: datetime, sunset: datetime, next_sunrise: datetime, weekday: str) -> Dict:
    """Calculate Choghadiya periods for day and night."""
    day_duration = (sunset - sunrise).total_seconds()
    night_duration = (next_sunrise - sunset).total_seconds()
    
    day_period = day_duration / 8
    night_period = night_duration / 8
    
    day_sequence = CHOGHADIYA_DAY_SEQUENCES.get(weekday, CHOGHADIYA_DAY_SEQUENCES["Sunday"])
    night_sequence = CHOGHADIYA_NIGHT_SEQUENCES.get(weekday, CHOGHADIYA_NIGHT_SEQUENCES["Sunday"])
    
    day_choghadiya = []
    for i, name in enumerate(day_sequence):
        start_time = sunrise + timedelta(seconds=i * day_period)
        end_time = sunrise + timedelta(seconds=(i + 1) * day_period)
        day_choghadiya.append({
            "name": name,
            "start": start_time.strftime("%H:%M"),
            "end": end_time.strftime("%H:%M"),
            "quality": CHOGHADIYA_QUALITY.get(name, "Neutral")
        })
    
    night_choghadiya = []
    for i, name in enumerate(night_sequence):
        start_time = sunset + timedelta(seconds=i * night_period)
        end_time = sunset + timedelta(seconds=(i + 1) * night_period)
        night_choghadiya.append({
            "name": name,
            "start": start_time.strftime("%H:%M"),
            "end": end_time.strftime("%H:%M"),
            "quality": CHOGHADIYA_QUALITY.get(name, "Neutral")
        })
    
    return {
        "day": day_choghadiya,
        "night": night_choghadiya
    }


def find_tithi_end_time(jd_start: float, sun_lon: float, moon_lon: float, current_time: datetime, tz) -> Optional[str]:
    """Find when current tithi ends using binary search."""
    diff = (moon_lon - sun_lon) % 360
    current_tithi = int(diff / 12)
    next_boundary = (current_tithi + 1) * 12
    
    # Search forward up to 2 days
    jd_end = jd_start + 2
    jd_low = jd_start
    jd_high = jd_end
    
    for _ in range(50):  # Max iterations
        jd_mid = (jd_low + jd_high) / 2
        sun_mid = get_sidereal_position(swe.SUN, jd_mid)
        moon_mid = get_sidereal_position(swe.MOON, jd_mid)
        diff_mid = (moon_mid - sun_mid) % 360
        
        if abs(diff_mid - next_boundary) < 0.01:
            end_dt = jd_to_datetime(jd_mid, tz)
            return end_dt.strftime("%H:%M")
        
        if diff_mid < next_boundary:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    
    return None


def find_yoga_end_time(jd_start: float, sun_lon: float, moon_lon: float, current_time: datetime, tz) -> Optional[str]:
    """Find when current yoga ends using binary search."""
    total = (sun_lon + moon_lon) % 360
    current_yoga = int(total / (360 / 27))
    next_boundary = (current_yoga + 1) * (360 / 27)
    
    jd_end = jd_start + 2
    jd_low = jd_start
    jd_high = jd_end
    
    for _ in range(50):
        jd_mid = (jd_low + jd_high) / 2
        sun_mid = get_sidereal_position(swe.SUN, jd_mid)
        moon_mid = get_sidereal_position(swe.MOON, jd_mid)
        total_mid = (sun_mid + moon_mid) % 360
        
        if abs(total_mid - next_boundary) < 0.01:
            end_dt = jd_to_datetime(jd_mid, tz)
            return end_dt.strftime("%H:%M")
        
        if total_mid < next_boundary:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    
    return None


def find_karana_end_time(jd_start: float, sun_lon: float, moon_lon: float, current_time: datetime, tz) -> Optional[str]:
    """Find when current karana ends using binary search."""
    diff = (moon_lon - sun_lon) % 360
    current_karana = int(diff / 6)
    next_boundary = (current_karana + 1) * 6
    
    jd_end = jd_start + 1
    jd_low = jd_start
    jd_high = jd_end
    
    for _ in range(50):
        jd_mid = (jd_low + jd_high) / 2
        sun_mid = get_sidereal_position(swe.SUN, jd_mid)
        moon_mid = get_sidereal_position(swe.MOON, jd_mid)
        diff_mid = (moon_mid - sun_mid) % 360
        
        if abs(diff_mid - next_boundary) < 0.01:
            end_dt = jd_to_datetime(jd_mid, tz)
            return end_dt.strftime("%H:%M")
        
        if diff_mid < next_boundary:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    
    return None


def calculate_muhurta(sunrise: datetime, sunset: datetime, next_sunrise: datetime) -> List[Dict]:
    """Calculate auspicious Muhurtas based on sunrise/sunset."""
    day_secs = (sunset - sunrise).total_seconds()
    night_secs = (next_sunrise - sunset).total_seconds()
    muhurta_unit = day_secs / 15  # one muhurta = day/15

    midday   = sunrise + timedelta(seconds=day_secs / 2)
    midnight = sunset  + timedelta(seconds=night_secs / 2)

    return [
        {
            "name": "Brahma Muhurta",
            "start": (sunrise - timedelta(minutes=96)).strftime("%H:%M"),
            "end":   (sunrise - timedelta(minutes=48)).strftime("%H:%M"),
            "quality": "Excellent",
            "description": "Ideal for meditation, study and spiritual practice",
        },
        {
            "name": "Abhijit Muhurta",
            "start": (midday - timedelta(minutes=24)).strftime("%H:%M"),
            "end":   (midday + timedelta(minutes=24)).strftime("%H:%M"),
            "quality": "Excellent",
            "description": "Most powerful period, ideal for all auspicious activities",
        },
        {
            "name": "Vijaya Muhurta",
            "start": (sunset - timedelta(seconds=2 * muhurta_unit)).strftime("%H:%M"),
            "end":   (sunset - timedelta(seconds=muhurta_unit)).strftime("%H:%M"),
            "quality": "Good",
            "description": "Auspicious for victory and new beginnings",
        },
        {
            "name": "Godhuli Muhurta",
            "start": (sunset - timedelta(minutes=24)).strftime("%H:%M"),
            "end":   (sunset + timedelta(minutes=24)).strftime("%H:%M"),
            "quality": "Good",
            "description": "Sacred twilight period, good for prayers and auspicious activities",
        },
        {
            "name": "Nishita Muhurta",
            "start": (midnight - timedelta(minutes=24)).strftime("%H:%M"),
            "end":   (midnight + timedelta(minutes=24)).strftime("%H:%M"),
            "quality": "Good",
            "description": "Sacred midnight period for deep spiritual practice",
        },
    ]


def calculate_hora(sunrise: datetime, sunset: datetime, next_sunrise: datetime, weekday: str) -> List[Dict]:
    """Calculate 24 Hora (planetary hours) for day and night."""
    start_idx = HORA_DAY_START[weekday]
    day_secs   = (sunset - sunrise).total_seconds()
    night_secs = (next_sunrise - sunset).total_seconds()
    day_hora_dur   = day_secs / 12
    night_hora_dur = night_secs / 12

    horas = []
    for i in range(12):
        planet = CHALDEAN_ORDER[(start_idx + i) % 7]
        horas.append({
            "period": "Day",
            "hora_number": i + 1,
            "planet": planet,
            "start": (sunrise + timedelta(seconds=i * day_hora_dur)).strftime("%H:%M"),
            "end":   (sunrise + timedelta(seconds=(i + 1) * day_hora_dur)).strftime("%H:%M"),
            "quality": HORA_QUALITY.get(planet, "Neutral"),
        })
    for i in range(12):
        planet = CHALDEAN_ORDER[(start_idx + 12 + i) % 7]
        horas.append({
            "period": "Night",
            "hora_number": i + 1,
            "planet": planet,
            "start": (sunset + timedelta(seconds=i * night_hora_dur)).strftime("%H:%M"),
            "end":   (sunset + timedelta(seconds=(i + 1) * night_hora_dur)).strftime("%H:%M"),
            "quality": HORA_QUALITY.get(planet, "Neutral"),
        })
    return horas


def calculate_hindu_calendar(sun_lon: float, tithi_index: int) -> Dict:
    """Calculate Hindu month, paksha, and paksha day."""
    solar_month_idx = int(sun_lon / 30) % 12
    month = HINDU_MONTHS[solar_month_idx]

    if tithi_index <= 15:
        paksha = "Shukla Paksha"
        paksha_day = tithi_index
    else:
        paksha = "Krishna Paksha"
        paksha_day = tithi_index - 15

    return {"month": month, "paksha": paksha, "paksha_day": paksha_day}


def get_festivals(solar_month_idx: int, tithi_index: int) -> List[str]:
    """Return festivals for given solar month and tithi."""
    festivals = []
    key = (solar_month_idx, tithi_index)
    if key in FESTIVALS_DB:
        festivals.append(FESTIVALS_DB[key])
    return festivals


def get_vedic_panchang(date_str: str, lat: float, lon: float, tz_str: str = "UTC") -> Dict:
    """
    Calculate complete Vedic Panchang for a given date and location.
    
    Args:
        date_str: Date in YYYY-MM-DD format
        lat: Latitude
        lon: Longitude
        tz_str: Timezone string (e.g., 'Asia/Kolkata')
    
    Returns:
        Complete panchang dictionary with all elements
    """
    try:
        tz = pytz.timezone(tz_str)
    except:
        tz = pytz.UTC
    
    # Parse date
    year, month, day = map(int, date_str.split("-"))
    dt = datetime(year, month, day, 12, 0, 0, tzinfo=tz)  # Noon
    
    # Get Julian day
    jd = get_julian_day(dt)
    
    # Get sidereal positions
    sun_lon = get_sidereal_position(swe.SUN, jd)
    moon_lon = get_sidereal_position(swe.MOON, jd)
    
    # Calculate sunrise/sunset
    sun_data = get_sunrise_sunset(dt, lat, lon, tz_str)
    
    # Calculate moonrise/moonset
    moon_data = get_moonrise_moonset(dt, lat, lon, tz_str)
    
    # Get next day's sunrise for night duration
    next_day = dt + timedelta(days=1)
    next_sun_data = get_sunrise_sunset(next_day, lat, lon, tz_str)
    
    # Calculate all panchang elements
    tithi = calculate_tithi(sun_lon, moon_lon)
    nakshatra = calculate_nakshatra(moon_lon)
    yoga = calculate_yoga(sun_lon, moon_lon)
    karana = calculate_karana(sun_lon, moon_lon)
    vara = calculate_vara(dt)
    
    # Calculate durations
    durations = calculate_day_night_duration(
        sun_data["sunrise"],
        sun_data["sunset"],
        next_sun_data["sunrise"]
    )
    
    # Calculate Choghadiya
    choghadiya = calculate_choghadiya(
        sun_data["sunrise"],
        sun_data["sunset"],
        next_sun_data["sunrise"],
        vara["english"]
    )

    # Calculate Muhurta, Hora, Hindu calendar, Festivals
    muhurta = calculate_muhurta(sun_data["sunrise"], sun_data["sunset"], next_sun_data["sunrise"])
    hora = calculate_hora(sun_data["sunrise"], sun_data["sunset"], next_sun_data["sunrise"], vara["english"])
    hindu_cal = calculate_hindu_calendar(sun_lon, tithi["index"])
    solar_month_idx = int(sun_lon / 30) % 12
    festivals = get_festivals(solar_month_idx, tithi["index"])

    # Calculate current element end times
    current_jd = get_julian_day(datetime.now(tz))
    current_sun = get_sidereal_position(swe.SUN, current_jd)
    current_moon = get_sidereal_position(swe.MOON, current_jd)

    tithi_end = find_tithi_end_time(current_jd, current_sun, current_moon, datetime.now(tz), tz)
    yoga_end = find_yoga_end_time(current_jd, current_sun, current_moon, datetime.now(tz), tz)
    karana_end = find_karana_end_time(current_jd, current_sun, current_moon, datetime.now(tz), tz)

    # Get current Choghadiya
    now = datetime.now(tz)
    current_choghadiya = None
    if sun_data["sunrise"] <= now <= sun_data["sunset"]:
        for period in choghadiya["day"]:
            period_start = datetime.strptime(period["start"], "%H:%M").replace(
                year=now.year, month=now.month, day=now.day, tzinfo=tz
            )
            period_end = datetime.strptime(period["end"], "%H:%M").replace(
                year=now.year, month=now.month, day=now.day, tzinfo=tz
            )
            if period_start <= now <= period_end:
                current_choghadiya = period
                break
    else:
        for period in choghadiya["night"]:
            period_start = datetime.strptime(period["start"], "%H:%M").replace(
                year=now.year, month=now.month, day=now.day, tzinfo=tz
            )
            period_end = datetime.strptime(period["end"], "%H:%M").replace(
                year=now.year, month=now.month, day=now.day, tzinfo=tz
            )
            if period_start <= now <= period_end:
                current_choghadiya = period
                break

    return {
        "date": date_str,
        "location": {"latitude": lat, "longitude": lon, "timezone": tz_str},
        "sun": {
            "sunrise": sun_data["sunrise_str"],
            "sunset": sun_data["sunset_str"]
        },
        "moon": {
            "moonrise": moon_data["moonrise_str"],
            "moonset": moon_data["moonset_str"]
        },
        "tithi": tithi,
        "nakshatra": nakshatra,
        "yoga": yoga,
        "karana": karana,
        "vara": vara,
        "durations": durations,
        "hindu_calendar": hindu_cal,
        "festivals": festivals,
        "muhurta": muhurta,
        "hora": hora,
        "choghadiya": choghadiya,
        "current": {
            "tithi": {**tithi, "end_time": tithi_end},
            "yoga": {**yoga, "end_time": yoga_end},
            "karana": {**karana, "end_time": karana_end},
            "choghadiya": current_choghadiya
        }
    }
