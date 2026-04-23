"""Complete Vedic Panchang engine — pyswisseph, Lahiri ayanamsa, all 52 fields.
End times via binary search from sunrise JD (precision ~1 min).
Amrit Kalam / Varjyam use traditional ghati offset tables (~30 min tolerance).
"""

import swisseph as swe
from datetime import datetime, timedelta, date as dt_date
import pytz
from typing import Dict, List, Optional
import math

swe.set_ephe_path(None)

# ── Name tables ───────────────────────────────────────────────────────────────

TITHI_NAMES = [
    "Shukla Pratipada","Shukla Dwitiya","Shukla Tritiya","Shukla Chaturthi",
    "Shukla Panchami","Shukla Shashthi","Shukla Saptami","Shukla Ashtami",
    "Shukla Navami","Shukla Dashami","Shukla Ekadashi","Shukla Dwadashi",
    "Shukla Trayodashi","Shukla Chaturdashi","Purnima",
    "Krishna Pratipada","Krishna Dwitiya","Krishna Tritiya","Krishna Chaturthi",
    "Krishna Panchami","Krishna Shashthi","Krishna Saptami","Krishna Ashtami",
    "Krishna Navami","Krishna Dashami","Krishna Ekadashi","Krishna Dwadashi",
    "Krishna Trayodashi","Krishna Chaturdashi","Amavasya",
]

NAKSHATRA_NAMES = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
    "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
    "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
    "Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
    "Uttara Bhadrapada","Revati",
]

YOGA_NAMES = [
    "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma",
    "Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra",
    "Siddhi","Vyatipata","Variyan","Parigha","Shiva","Siddha","Sadhya","Shubha",
    "Shukla","Brahma","Indra","Vaidhriti",
]

# 60 half-tithis: index 0=Kimstughna(fixed), 1-56=7 movable×8, 57-59=fixed
KARANA_MAP = ["Kimstughna"] + ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti"] * 8 + ["Shakuni","Chatushpada","Naga"]

RASHI_NAMES = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya",
               "Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"]

VARA_NAMES = {
    "Sunday":"Raviwar","Monday":"Somwar","Tuesday":"Mangalwar",
    "Wednesday":"Budhwar","Thursday":"Guruwar","Friday":"Shukrawar","Saturday":"Shaniwar",
}

HINDU_MONTHS = ["Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
                "Ashwin","Kartika","Margashirsha","Pausha","Magha","Phalguna"]

RITU_NAMES = ["Vasanta","Grishma","Varsha","Sharada","Hemanta","Shishira"]

SAMVATSAR_NAMES = [
    "Prabhava","Vibhava","Shukla","Pramoda","Prajapati","Angirasa","Shrimukha","Bhava",
    "Yuva","Dhatri","Ishvara","Bahudhanya","Pramathi","Vikrama","Vrisha","Chitrabhanu",
    "Subhanu","Tarana","Parthiva","Vyaya","Sarvajit","Sarvadharin","Virodhi","Vikriti",
    "Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi","Hevilambi","Vilambi",
    "Vikari","Sharvari","Plava","Shubhakrit","Shobhakrit","Krodhi","Vishvavasu",
    "Parabhava","Plavanga","Kilaka","Saumya","Sadharana","Virodhakrit","Paritapi",
    "Pramadi","Ananda","Rakshasa","Nala","Pingala","Kalayukti","Siddharthi","Raudra",
    "Durmati","Dundubhi","Rudhirodgari","Raktakshi","Krodhana","Kshaya",
]

# ── Choghadiya (corrected) ────────────────────────────────────────────────────
# Cycle: Udveg=0, Char=1, Labh=2, Amrit=3, Kaal=4, Shubh=5, Rog=6
_CGH = ["Udveg","Char","Labh","Amrit","Kaal","Shubh","Rog"]

_DAY_START  = {"Sunday":0,"Monday":3,"Tuesday":6,"Wednesday":2,"Thursday":5,"Friday":1,"Saturday":4}
_NIGHT_START = {"Sunday":3,"Monday":4,"Tuesday":1,"Wednesday":6,"Thursday":3,"Friday":6,"Saturday":5}

CHOGHADIYA_QUALITY = {
    "Amrit":"Excellent","Shubh":"Good","Labh":"Beneficial",
    "Char":"Neutral","Udveg":"Inauspicious","Rog":"Inauspicious","Kaal":"Inauspicious",
}

def _choghadiya_seq(weekday: str, day: bool) -> List[str]:
    start = _DAY_START[weekday] if day else _NIGHT_START[weekday]
    return [_CGH[(start + i) % 7] for i in range(8)]

# ── Inauspicious period slots ─────────────────────────────────────────────────
# 1-based slot index within (sunrise→sunset) ÷ 8 equal parts
_RAHU   = {"Sunday":8,"Monday":2,"Tuesday":7,"Wednesday":5,"Thursday":6,"Friday":4,"Saturday":3}
_YAMA   = {"Sunday":6,"Monday":5,"Tuesday":4,"Wednesday":3,"Thursday":2,"Friday":1,"Saturday":7}
_GULIKA = {"Sunday":7,"Monday":6,"Tuesday":5,"Wednesday":4,"Thursday":3,"Friday":2,"Saturday":1}

# Dur Muhurtam: 1-based muhurta (day ÷ 15 equal parts from sunrise)
_DUR = {
    "Sunday":[4,11],"Monday":[7],"Tuesday":[2,11],"Wednesday":[10],
    "Thursday":[6],"Friday":[4,8],"Saturday":[2],
}

# ── Hora ──────────────────────────────────────────────────────────────────────
_CHALDEAN = ["Saturn","Jupiter","Mars","Sun","Venus","Mercury","Moon"]
_HORA_START = {"Sunday":3,"Monday":6,"Tuesday":2,"Wednesday":5,"Thursday":1,"Friday":4,"Saturday":0}
HORA_QUALITY = {"Sun":"Good","Moon":"Beneficial","Mars":"Inauspicious",
                "Mercury":"Neutral","Jupiter":"Excellent","Venus":"Good","Saturn":"Inauspicious"}

# ── Amrit Kalam & Varjyam — offset in ghatis from sunrise (1 ghati=24 min, dur=4 ghatis) ──
_AMRIT_GHATI = [20,27,24,23,29,18, 3,26, 9,12,25, 6,15,24,21,19, 4,10, 5,22, 8,28,29,17, 7,11,16]
_VARJYAM_GHATI = [ 1,15, 6, 8,22, 5,16,20,28,24, 9,25, 3,12,18,14,29, 7, 2,27,21,10,17,26,13, 4,11]

# ── Special yogas ─────────────────────────────────────────────────────────────
_SARVARTHA = {
    "Sunday":   {"Hasta","Mula","Pushya","Ashwini","Punarvasu"},
    "Monday":   {"Rohini","Mrigashira","Hasta","Shatabhisha","Pushya","Punarvasu","Uttara Phalguni","Uttara Ashadha","Uttara Bhadrapada"},
    "Tuesday":  {"Ashwini","Krittika","Mrigashira","Punarvasu","Shatabhisha","Vishakha","Hasta"},
    "Wednesday":{"Ashwini","Anuradha","Hasta","Krittika","Mrigashira","Jyeshtha","Revati","Rohini"},
    "Thursday": {"Punarvasu","Pushya","Anuradha","Hasta","Shravana","Rohini","Uttara Phalguni"},
    "Friday":   {"Anuradha","Shravana","Revati","Pushya","Rohini","Ashwini","Mrigashira"},
    "Saturday": {"Rohini","Swati","Shravana","Dhanishtha","Uttara Bhadrapada"},
}
_AMRIT_SIDDHI = {
    "Sunday":"Hasta","Monday":"Mrigashira","Tuesday":"Ashwini",
    "Wednesday":"Anuradha","Thursday":"Pushya","Friday":"Revati","Saturday":"Rohini",
}
_RAVI_YOGA_NAK = {
    "Sunday":"Hasta","Monday":"Rohini","Tuesday":"Mrigashira","Wednesday":"Ashlesha",
    "Thursday":"Punarvasu","Friday":"Revati","Saturday":"Vishakha",
}
_SIDDHI_YOGA = {
    "Sunday":{1,6,11},"Monday":{3,8,13},"Tuesday":{5,10,15},"Wednesday":{2,7,12},
    "Thursday":{4,9,14},"Friday":{1,6,11},"Saturday":{3,8,13},
}
_DWI_VARA  = {"Sunday","Monday","Friday"}
_DWI_TITHI = {2,7,12}
_TRI_VARA  = {"Tuesday","Wednesday","Saturday"}
_TRI_TITHI = {3,8,13}
_PUSHKAR_NAKS = {"Krittika","Punarvasu","Uttara Phalguni","Vishakha","Uttara Ashadha","Purva Bhadrapada"}

# Ganda Moola: nakshatra 0-index in set
_GANDA_MOOLA_IDX = {0, 8, 9, 17, 18, 26}

# Tarabalam
_TARA_TYPES = ["Janma","Sampat","Vipat","Kshema","Pratyara","Sadhana","Naidhana","Mitra","Parama Mitra"]
_TARA_QUALITY = {
    "Janma":"Neutral","Sampat":"Good","Vipat":"Bad","Kshema":"Good","Pratyara":"Bad",
    "Sadhana":"Good","Naidhana":"Bad","Mitra":"Good","Parama Mitra":"Excellent",
}
_CHANDRA_GOOD_POS = {1, 3, 6, 7, 10, 11}

# Festivals: (solar_month_0idx, tithi_1to30) → name
FESTIVALS_DB = {
    (0,1):"Ugadi / Gudi Padwa",(0,9):"Ram Navami",(0,13):"Hanuman Jayanti",
    (1,3):"Akshaya Tritiya",(3,15):"Guru Purnima",(4,5):"Nag Panchami",
    (4,15):"Raksha Bandhan",(5,4):"Ganesh Chaturthi",(5,23):"Janmashtami",
    (6,1):"Navratri Begins",(6,10):"Dussehra",(6,15):"Sharad Purnima",
    (7,28):"Dhanteras",(7,29):"Naraka Chaturdashi",(7,30):"Diwali",
    (7,17):"Bhai Dooj",(10,5):"Vasant Panchami",(11,14):"Holika Dahan",(11,15):"Holi",
}

# ── Core SWE helpers ──────────────────────────────────────────────────────────

def get_julian_day(dt: datetime) -> float:
    h = dt.hour + dt.minute / 60 + dt.second / 3600
    return swe.julday(dt.year, dt.month, dt.day, h)


def get_sidereal_position(body: int, jd: float) -> float:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    result = swe.calc_ut(jd, body, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
    return result[0][0] % 360


def jd_to_datetime(jd: float, tz) -> datetime:
    r = swe.revjul(jd)
    yr, mo, dy = int(r[0]), int(r[1]), int(r[2])
    h = r[3]; hh = int(h); mm = int((h - hh) * 60); ss = int(((h - hh) * 60 - mm) * 60)
    return datetime(yr, mo, dy, hh, mm, ss, tzinfo=pytz.UTC).astimezone(tz)


def _fmt(dt: datetime) -> str:
    return dt.strftime("%H:%M")


def get_rise_set(jd_midnight: float, body: int, lat: float, lon: float, tz) -> Optional[datetime]:
    geopos = (lon, lat, 0.0)
    flag = swe.CALC_RISE if body == swe.SUN else swe.CALC_RISE
    for rsmi in (swe.CALC_RISE, swe.CALC_SET):
        res = swe.rise_trans(jd_midnight, body, rsmi, geopos)
        if res[0] == 0:
            yield jd_to_datetime(res[1][0], tz)
        else:
            yield None


def _rise_set_pair(jd_midnight: float, body: int, lat: float, lon: float, tz):
    geopos = (lon, lat, 0.0)
    rise_res = swe.rise_trans(jd_midnight, body, swe.CALC_RISE, geopos)
    set_res  = swe.rise_trans(jd_midnight, body, swe.CALC_SET,  geopos)
    rise = jd_to_datetime(rise_res[1][0], tz) if rise_res[0] == 0 else None
    sett = jd_to_datetime(set_res[1][0],  tz) if set_res[0]  == 0 else None
    return rise, sett


def _fallback(dt: datetime, h_rise: int, h_set: int, tz):
    base = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    return base.replace(hour=h_rise).astimezone(tz), base.replace(hour=h_set).astimezone(tz)

# ── Binary-search end-times ───────────────────────────────────────────────────

def _degrees_to_go(current: float, boundary: float) -> float:
    """Degrees moon must travel forward to reach boundary (handles wrap)."""
    return (boundary - current) % 360


def _binary_search_end(jd_start: float, degrees_needed: float,
                       get_value_fn, tol: float = 0.02) -> float:
    """Generic binary search: find JD where get_value_fn() has moved 'degrees_needed' from jd_start."""
    v_start = get_value_fn(jd_start)
    jd_low, jd_high = jd_start, jd_start + 3.0
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        moved = (get_value_fn(jd_mid) - v_start) % 360
        if abs(moved - degrees_needed) < tol:
            return jd_mid
        if moved < degrees_needed:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return (jd_low + jd_high) / 2


def find_tithi_end(jd_sunrise: float, sun_s: float, moon_s: float, tz) -> Optional[str]:
    diff_s = (moon_s - sun_s) % 360
    degrees_in_tithi = diff_s % 12
    degrees_to_go = 12 - degrees_in_tithi

    def moon_minus_sun(jd):
        s = get_sidereal_position(swe.SUN, jd)
        m = get_sidereal_position(swe.MOON, jd)
        return (m - s) % 360

    jd_end = _binary_search_end(jd_sunrise, (diff_s + degrees_to_go) % 360,
                                  moon_minus_sun, tol=0.02)
    # Fallback: recompute relative progress
    # Simpler direct approach
    jd_low, jd_high = jd_sunrise, jd_sunrise + 2.0
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        diff_mid = moon_minus_sun(jd_mid)
        moved = (diff_mid - diff_s) % 360
        if abs(moved - degrees_to_go) < 0.02:
            return _fmt(jd_to_datetime(jd_mid, tz))
        if moved < degrees_to_go:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return _fmt(jd_to_datetime((jd_low + jd_high) / 2, tz))


def find_nakshatra_end(jd_sunrise: float, moon_s: float, tz) -> Optional[str]:
    nak_size = 360.0 / 27
    deg_in_nak = moon_s % nak_size
    deg_to_go = nak_size - deg_in_nak
    moon_s_ref = moon_s

    jd_low, jd_high = jd_sunrise, jd_sunrise + 1.5
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        moon_mid = get_sidereal_position(swe.MOON, jd_mid)
        moved = (moon_mid - moon_s_ref) % 360
        if abs(moved - deg_to_go) < 0.02:
            return _fmt(jd_to_datetime(jd_mid, tz))
        if moved < deg_to_go:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return _fmt(jd_to_datetime((jd_low + jd_high) / 2, tz))


def find_yoga_end(jd_sunrise: float, sun_s: float, moon_s: float, tz) -> Optional[str]:
    yog_size = 360.0 / 27
    total_s = (sun_s + moon_s) % 360
    deg_in_yog = total_s % yog_size
    deg_to_go = yog_size - deg_in_yog

    jd_low, jd_high = jd_sunrise, jd_sunrise + 2.0
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        s = get_sidereal_position(swe.SUN, jd_mid)
        m = get_sidereal_position(swe.MOON, jd_mid)
        total_mid = (s + m) % 360
        moved = (total_mid - total_s) % 360
        if abs(moved - deg_to_go) < 0.02:
            return _fmt(jd_to_datetime(jd_mid, tz))
        if moved < deg_to_go:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return _fmt(jd_to_datetime((jd_low + jd_high) / 2, tz))


def find_karana_end(jd_sunrise: float, sun_s: float, moon_s: float, tz) -> Optional[str]:
    diff_s = (moon_s - sun_s) % 360
    deg_in_kar = diff_s % 6
    deg_to_go = 6 - deg_in_kar

    jd_low, jd_high = jd_sunrise, jd_sunrise + 1.0
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        s = get_sidereal_position(swe.SUN, jd_mid)
        m = get_sidereal_position(swe.MOON, jd_mid)
        diff_mid = (m - s) % 360
        moved = (diff_mid - diff_s) % 360
        if abs(moved - deg_to_go) < 0.02:
            return _fmt(jd_to_datetime(jd_mid, tz))
        if moved < deg_to_go:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return _fmt(jd_to_datetime((jd_low + jd_high) / 2, tz))


def find_rashi_transition(jd_sunrise: float, moon_s: float, tz) -> Optional[str]:
    """When does Moon enter next Rashi?"""
    rashi_size = 30.0
    deg_in_rashi = moon_s % rashi_size
    deg_to_go = rashi_size - deg_in_rashi

    jd_low, jd_high = jd_sunrise, jd_sunrise + 3.0
    for _ in range(70):
        jd_mid = (jd_low + jd_high) / 2
        moon_mid = get_sidereal_position(swe.MOON, jd_mid)
        moved = (moon_mid - moon_s) % 360
        if abs(moved - deg_to_go) < 0.02:
            return _fmt(jd_to_datetime(jd_mid, tz))
        if moved < deg_to_go:
            jd_low = jd_mid
        else:
            jd_high = jd_mid
    return _fmt(jd_to_datetime((jd_low + jd_high) / 2, tz))

# ── Calculation functions ─────────────────────────────────────────────────────

def calc_tithi(sun_s: float, moon_s: float) -> Dict:
    diff = (moon_s - sun_s) % 360
    idx = min(int(diff / 12), 29)
    pct = (diff % 12) / 12 * 100
    return {"name": TITHI_NAMES[idx], "index": idx + 1, "percent_elapsed": round(pct, 1),
            "paksha": "Shukla" if idx < 15 else "Krishna"}


def calc_nakshatra(moon_s: float) -> Dict:
    nak_size = 360.0 / 27
    idx = min(int(moon_s / nak_size), 26)
    pct = (moon_s % nak_size) / nak_size * 100
    pada = int((moon_s % nak_size) / (nak_size / 4)) + 1
    return {"name": NAKSHATRA_NAMES[idx], "index": idx + 1,
            "percent_elapsed": round(pct, 1), "pada": min(pada, 4)}


def calc_yoga(sun_s: float, moon_s: float) -> Dict:
    yog_size = 360.0 / 27
    total = (sun_s + moon_s) % 360
    idx = min(int(total / yog_size), 26)
    pct = (total % yog_size) / yog_size * 100
    return {"name": YOGA_NAMES[idx], "index": idx + 1, "percent_elapsed": round(pct, 1)}


def calc_karana(sun_s: float, moon_s: float) -> Dict:
    diff = (moon_s - sun_s) % 360
    idx = min(int(diff / 6), 59)
    return {"name": KARANA_MAP[idx], "index": idx + 1}


def calc_vara(dt: datetime) -> Dict:
    name = dt.strftime("%A")
    return {"english": name, "sanskrit": VARA_NAMES.get(name, name)}


def calc_rashi(lon: float) -> str:
    return RASHI_NAMES[int(lon / 30) % 12]


def calc_durations(sunrise: datetime, sunset: datetime, next_sunrise: datetime) -> Dict:
    def fmt(td: timedelta) -> str:
        t = int(td.total_seconds()); h = t // 3600; m = (t % 3600) // 60
        return f"{h}h {m}m"
    return {"day_duration": fmt(sunset - sunrise), "night_duration": fmt(next_sunrise - sunset)}


def calc_hindu_calendar(sun_s: float, tithi_idx: int, date_obj) -> Dict:
    solar_month = int(sun_s / 30) % 12
    amanta = HINDU_MONTHS[solar_month]
    # Purnimanta: same in Shukla; previous month in Krishna paksha
    if tithi_idx <= 15:
        purnimanta = amanta
    else:
        purnimanta = HINDU_MONTHS[(solar_month - 1) % 12]

    paksha = "Shukla Paksha" if tithi_idx <= 15 else "Krishna Paksha"
    paksha_day = tithi_idx if tithi_idx <= 15 else tithi_idx - 15

    # Vikram Samvat (approx: changes ~April)
    y = date_obj.year
    if date_obj.month > 3 or (date_obj.month == 3 and date_obj.day >= 22):
        vs = y + 57
    else:
        vs = y + 56
    shaka = vs - 135  # Shaka = VS - 135 approximately
    samvatsar = SAMVATSAR_NAMES[(vs - 1) % 60]

    # Ayana: Uttarayana when Sun in Capricorn→Gemini (sidereal lon >= 270 or < 90)
    ayana = "Dakshinayana" if 90 <= sun_s < 270 else "Uttarayana"

    ritu_idx = int(solar_month / 2) % 6
    ritu = RITU_NAMES[ritu_idx]

    return {
        "month": amanta, "amanta_month": amanta, "purnimanta_month": purnimanta,
        "paksha": paksha, "paksha_day": paksha_day,
        "vikram_samvat": vs, "shaka_samvat": shaka, "samvatsar": samvatsar,
        "ayana": ayana, "ritu": ritu,
    }


def calc_inauspicious(sunrise: datetime, sunset: datetime, weekday: str) -> Dict:
    day_secs = (sunset - sunrise).total_seconds()
    slot = day_secs / 8
    muh_unit = day_secs / 15  # for dur muhurtam

    def period(slot_1based: int) -> Dict:
        i = slot_1based - 1
        s = sunrise + timedelta(seconds=i * slot)
        e = sunrise + timedelta(seconds=(i + 1) * slot)
        return {"start": _fmt(s), "end": _fmt(e)}

    def muh_period(m_1based: int) -> Dict:
        i = m_1based - 1
        s = sunrise + timedelta(seconds=i * muh_unit)
        e = sunrise + timedelta(seconds=(i + 1) * muh_unit)
        return {"start": _fmt(s), "end": _fmt(e)}

    dur = [muh_period(m) for m in _DUR.get(weekday, [])]
    return {
        "rahu_kalam": period(_RAHU[weekday]),
        "yamagandam": period(_YAMA[weekday]),
        "gulika_kalam": period(_GULIKA[weekday]),
        "dur_muhurtam": dur,
    }


def calc_varjyam_amrit(sunrise: datetime, nak_idx: int) -> Dict:
    """Approximate Amrit Kalam and Varjyam from sunrise using traditional ghati tables."""
    def ghati_period(ghati_offset: int) -> Dict:
        s = sunrise + timedelta(minutes=ghati_offset * 24)
        e = s + timedelta(minutes=96)  # 4 ghatis = 96 min
        return {"start": _fmt(s), "end": _fmt(e)}

    return {
        "amrit_kalam": ghati_period(_AMRIT_GHATI[nak_idx]),
        "varjyam": ghati_period(_VARJYAM_GHATI[nak_idx]),
    }


def calc_muhurta(sunrise: datetime, sunset: datetime, next_sunrise: datetime, weekday: str) -> List[Dict]:
    day_secs   = (sunset - sunrise).total_seconds()
    night_secs = (next_sunrise - sunset).total_seconds()
    midday  = sunrise + timedelta(seconds=day_secs / 2)
    midnight = sunset + timedelta(seconds=night_secs / 2)
    muh_unit = day_secs / 15

    result = [
        {"name": "Brahma Muhurta",
         "start": _fmt(sunrise - timedelta(minutes=96)),
         "end":   _fmt(sunrise - timedelta(minutes=48)),
         "quality": "Excellent", "description": "Ideal for meditation, study and spiritual practice"},
        {"name": "Pratah Sandhya",
         "start": _fmt(sunrise - timedelta(minutes=48)),
         "end":   _fmt(sunrise + timedelta(minutes=12)),
         "quality": "Good", "description": "Morning twilight — ideal for prayer and yoga"},
        {"name": "Abhijit Muhurta",
         "start": _fmt(midday - timedelta(minutes=24)),
         "end":   _fmt(midday + timedelta(minutes=24)),
         "quality": "Excellent" if weekday != "Wednesday" else "Neutral",
         "description": "Most powerful auspicious period (skip on Wednesday)"},
        {"name": "Vijaya Muhurta",
         "start": _fmt(sunset - timedelta(seconds=2 * muh_unit)),
         "end":   _fmt(sunset - timedelta(seconds=muh_unit)),
         "quality": "Good", "description": "Auspicious for victory and new beginnings"},
        {"name": "Godhuli Muhurta",
         "start": _fmt(sunset - timedelta(minutes=12)),
         "end":   _fmt(sunset + timedelta(minutes=12)),
         "quality": "Good", "description": "Sacred twilight — good for prayers and auspicious activities"},
        {"name": "Sayahna Sandhya",
         "start": _fmt(sunset - timedelta(minutes=12)),
         "end":   _fmt(sunset + timedelta(minutes=24)),
         "quality": "Good", "description": "Evening twilight — ideal for evening prayers"},
        {"name": "Nishita Muhurta",
         "start": _fmt(midnight - timedelta(minutes=24)),
         "end":   _fmt(midnight + timedelta(minutes=24)),
         "quality": "Good", "description": "Sacred midnight period for deep spiritual practice"},
    ]
    return result


def calc_choghadiya(sunrise: datetime, sunset: datetime, next_sunrise: datetime, weekday: str) -> Dict:
    day_secs   = (sunset - sunrise).total_seconds()
    night_secs = (next_sunrise - sunset).total_seconds()
    day_slot   = day_secs / 8
    night_slot = night_secs / 8

    def build(seq, t0, slot):
        out = []
        for i, name in enumerate(seq):
            s = t0 + timedelta(seconds=i * slot)
            e = t0 + timedelta(seconds=(i + 1) * slot)
            out.append({"name": name, "start": _fmt(s), "end": _fmt(e),
                        "quality": CHOGHADIYA_QUALITY[name]})
        return out

    return {
        "day":   build(_choghadiya_seq(weekday, True),  sunrise, day_slot),
        "night": build(_choghadiya_seq(weekday, False), sunset,  night_slot),
    }


def calc_hora(sunrise: datetime, sunset: datetime, next_sunrise: datetime, weekday: str) -> List[Dict]:
    start_idx = _HORA_START[weekday]
    day_secs   = (sunset - sunrise).total_seconds()
    night_secs = (next_sunrise - sunset).total_seconds()
    day_h   = day_secs / 12
    night_h = night_secs / 12
    horas = []
    for i in range(12):
        p = _CHALDEAN[(start_idx + i) % 7]
        horas.append({"period": "Day", "hora_number": i + 1, "planet": p,
                      "start": _fmt(sunrise + timedelta(seconds=i * day_h)),
                      "end":   _fmt(sunrise + timedelta(seconds=(i + 1) * day_h)),
                      "quality": HORA_QUALITY[p]})
    for i in range(12):
        p = _CHALDEAN[(start_idx + 12 + i) % 7]
        horas.append({"period": "Night", "hora_number": i + 1, "planet": p,
                      "start": _fmt(sunset + timedelta(seconds=i * night_h)),
                      "end":   _fmt(sunset + timedelta(seconds=(i + 1) * night_h)),
                      "quality": HORA_QUALITY[p]})
    return horas


def calc_udaya_lagna(jd_sunrise: float, lat: float, lon: float, tz) -> List[Dict]:
    """Ascendant (Lagna) at sunrise then at each Rashi boundary crossing."""
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    lagnas = []
    jd = jd_sunrise
    for _ in range(12):
        try:
            cusps, ascmc = swe.houses_ex(jd, lat, lon, b'W', swe.FLG_SIDEREAL)
            asc = ascmc[0] % 360
            rashi_idx = int(asc / 30)
            lagna_name = RASHI_NAMES[rashi_idx]
            start_dt = jd_to_datetime(jd, tz)

            # Find next Lagna change: Ascendant crosses next 30-deg boundary
            deg_to_go = 30 - (asc % 30)
            # Ascendant moves ~1 degree per 4 minutes at equator, but varies
            # Approximate next boundary by stepping forward
            step_jd = deg_to_go / 360 * (1 / 6)  # crude: lagna changes ~every 2hr
            jd_next = jd + step_jd
            # Binary search for exact lagna change
            jd_lo, jd_hi = jd, jd + 0.25
            for _ in range(50):
                jd_m = (jd_lo + jd_hi) / 2
                c2, a2 = swe.houses_ex(jd_m, lat, lon, b'W', swe.FLG_SIDEREAL)
                asc2 = a2[0] % 360
                rashi2 = int(asc2 / 30)
                if rashi2 != rashi_idx:
                    jd_hi = jd_m
                else:
                    jd_lo = jd_m
            end_jd = (jd_lo + jd_hi) / 2
            end_dt = jd_to_datetime(end_jd, tz)
            lagnas.append({"lagna": lagna_name, "start": _fmt(start_dt), "end": _fmt(end_dt)})
            jd = end_jd + 0.001
        except Exception:
            break
    return lagnas


def calc_special_yogas(weekday: str, nak_name: str, tithi_idx: int) -> List[Dict]:
    yogas = []
    if nak_name in _SARVARTHA.get(weekday, set()):
        yogas.append({"name": "Sarvartha Siddhi Yoga", "quality": "Excellent",
                      "description": "All actions started today yield success"})
    if nak_name == _AMRIT_SIDDHI.get(weekday):
        yogas.append({"name": "Amrit Siddhi Yoga", "quality": "Excellent",
                      "description": "Extremely auspicious — actions bear lasting fruit"})
    if weekday == "Sunday" and nak_name == "Pushya":
        yogas.append({"name": "Ravi Pushya Yoga", "quality": "Excellent",
                      "description": "Very auspicious for new beginnings and wealth"})
    if weekday == "Thursday" and nak_name == "Pushya":
        yogas.append({"name": "Guru Pushya Yoga", "quality": "Excellent",
                      "description": "Highly auspicious — ideal for education and gold purchase"})
    if weekday in _DWI_VARA and (tithi_idx % 15) in _DWI_TITHI and nak_name in _PUSHKAR_NAKS:
        yogas.append({"name": "Dwipushkar Yoga", "quality": "Inauspicious",
                      "description": "Events done twice — avoid inauspicious activities"})
    if weekday in _TRI_VARA and (tithi_idx % 15) in _TRI_TITHI and nak_name in _PUSHKAR_NAKS:
        yogas.append({"name": "Tripushkar Yoga", "quality": "Inauspicious",
                      "description": "Events repeat thrice — avoid negative actions"})
    if nak_name == _RAVI_YOGA_NAK.get(weekday):
        yogas.append({"name": "Ravi Yoga", "quality": "Inauspicious",
                      "description": "Inauspicious combination of Sun and Nakshatra"})
    if tithi_idx in _SIDDHI_YOGA.get(weekday, set()):
        yogas.append({"name": "Siddhi Yoga", "quality": "Good",
                      "description": "Auspicious Vara-Tithi combination"})
    return yogas


def calc_panchaka_ganda_bhadra(moon_s: float, nak_idx: int, karana_name: str) -> Dict:
    # Panchaka: Moon in last 5 nakshatras (Dhanishtha 2nd half → Revati)
    # 2nd half of Dhanishtha starts at 22.5 × (360/27) = 300 deg
    panchaka = moon_s >= 300.0
    ganda_moola = nak_idx in _GANDA_MOOLA_IDX
    bhadra = karana_name == "Vishti"  # Bhadra is active during Vishti Karana
    return {
        "panchaka": {"active": panchaka, "description": "Moon in last 5 nakshatras — avoid auspicious work" if panchaka else ""},
        "ganda_moola": {"active": ganda_moola, "description": "Moon in Ganda Moola — take precautions" if ganda_moola else ""},
        "bhadra": {"active": bhadra, "description": "Vishti Karana active — inauspicious period" if bhadra else ""},
    }


def calc_tarabalam(day_nak_idx: int, birth_nak_idx: Optional[int]) -> Optional[Dict]:
    if birth_nak_idx is None:
        return None
    count = (day_nak_idx - birth_nak_idx) % 27 + 1
    tara_idx = (count - 1) % 9
    tara_type = _TARA_TYPES[tara_idx]
    return {"count": count, "type": tara_type, "quality": _TARA_QUALITY[tara_type],
            "description": f"Day nakshatra is {tara_type} from birth nakshatra"}


def calc_chandrabalam(day_rashi_idx: int, birth_rashi_idx: Optional[int]) -> Optional[Dict]:
    if birth_rashi_idx is None:
        return None
    pos = (day_rashi_idx - birth_rashi_idx) % 12 + 1
    good = pos in _CHANDRA_GOOD_POS
    return {"position": pos, "good": good,
            "quality": "Good" if good else "Inauspicious",
            "description": f"Moon is {pos}th from birth Rashi"}


# ── Main public function ───────────────────────────────────────────────────────

def get_vedic_panchang(date_str: str, lat: float = 28.6139, lon: float = 77.2090,
                       tz_str: str = "Asia/Kolkata",
                       birth_nakshatra: Optional[int] = None,
                       birth_rashi: Optional[int] = None) -> Dict:
    """
    Complete Vedic Panchang — all 52 fields.
    birth_nakshatra: 0-based index (0=Ashwini) for Tarabalam.
    birth_rashi: 0-based index (0=Mesha) for Chandrabalam.
    """
    try:
        tz = pytz.timezone(tz_str)
    except Exception:
        tz = pytz.UTC

    yr, mo, dy = map(int, date_str.split("-"))
    date_obj = dt_date(yr, mo, dy)

    # Julian day at local midnight (use noon for planetary positions)
    dt_noon = datetime(yr, mo, dy, 12, 0, 0, tzinfo=tz)
    jd_noon = get_julian_day(dt_noon)
    jd_midnight = get_julian_day(datetime(yr, mo, dy, 0, 0, 0, tzinfo=pytz.UTC))

    # Sunrise / sunset / moonrise / moonset
    sunrise, sunset = _rise_set_pair(jd_midnight, swe.SUN, lat, lon, tz)
    moonrise, moonset = _rise_set_pair(jd_midnight, swe.MOON, lat, lon, tz)

    if not sunrise or not sunset:
        sunrise, sunset = _fallback(datetime(yr, mo, dy, tzinfo=tz), 6, 18, tz)

    # Next sunrise (for night duration)
    jd_next_midnight = get_julian_day(datetime(yr, mo, dy + 1, 0, 0, 0, tzinfo=pytz.UTC)) \
        if dy < 28 else get_julian_day(
            datetime(yr, mo, dy, 23, 59, 0, tzinfo=tz) + timedelta(days=1))
    jd_next_midnight = jd_midnight + 1.0
    next_sunrise, _ = _rise_set_pair(jd_next_midnight, swe.SUN, lat, lon, tz)
    if not next_sunrise:
        next_sunrise = sunrise + timedelta(hours=24)

    # Sidereal positions at sunrise (canonical reference for the day)
    jd_sunrise = get_julian_day(sunrise)
    sun_s  = get_sidereal_position(swe.SUN, jd_sunrise)
    moon_s = get_sidereal_position(swe.MOON, jd_sunrise)

    # Core five
    tithi    = calc_tithi(sun_s, moon_s)
    nakshatra = calc_nakshatra(moon_s)
    yoga     = calc_yoga(sun_s, moon_s)
    karana   = calc_karana(sun_s, moon_s)
    vara     = calc_vara(sunrise)
    weekday  = vara["english"]

    # End times (from sunrise)
    tithi["end_time"]     = find_tithi_end(jd_sunrise, sun_s, moon_s, tz)
    nakshatra["end_time"] = find_nakshatra_end(jd_sunrise, moon_s, tz)
    yoga["end_time"]      = find_yoga_end(jd_sunrise, sun_s, moon_s, tz)
    karana["end_time"]    = find_karana_end(jd_sunrise, sun_s, moon_s, tz)

    # Rashi info
    surya_rashi   = calc_rashi(sun_s)
    chandra_rashi = calc_rashi(moon_s)
    rashi_transition = find_rashi_transition(jd_sunrise, moon_s, tz)
    nak_idx = nakshatra["index"] - 1  # 0-based

    # Madhyahna
    midday = sunrise + (sunset - sunrise) / 2
    madhyahna = _fmt(midday)

    # Calendar
    hindu_cal = calc_hindu_calendar(sun_s, tithi["index"], date_obj)
    solar_month_idx = int(sun_s / 30) % 12
    festivals = [FESTIVALS_DB[k] for k in [(solar_month_idx, tithi["index"])] if k in FESTIVALS_DB]

    # Durations
    durations = calc_durations(sunrise, sunset, next_sunrise)

    # Muhurta, Choghadiya, Hora
    muhurta   = calc_muhurta(sunrise, sunset, next_sunrise, weekday)
    choghadiya = calc_choghadiya(sunrise, sunset, next_sunrise, weekday)
    hora      = calc_hora(sunrise, sunset, next_sunrise, weekday)

    # Inauspicious periods
    inauspicious = calc_inauspicious(sunrise, sunset, weekday)
    kala_amrit   = calc_varjyam_amrit(sunrise, nak_idx)
    inauspicious["varjyam"] = kala_amrit["varjyam"]

    # Add Amrit Kalam to muhurta list
    amrit_entry = {**kala_amrit["amrit_kalam"], "name": "Amrit Kalam",
                   "quality": "Excellent", "description": "Auspicious period based on Moon nakshatra"}
    muhurta.insert(2, amrit_entry)

    # Special conditions
    specials = calc_panchaka_ganda_bhadra(moon_s, nak_idx, karana["name"])

    # Special yogas
    special_yogas = calc_special_yogas(weekday, nakshatra["name"], tithi["index"])

    # Tarabalam / Chandrabalam
    day_rashi_idx = int(moon_s / 30) % 12
    tarabalam   = calc_tarabalam(nak_idx, birth_nakshatra)
    chandrabalam = calc_chandrabalam(day_rashi_idx, birth_rashi)

    # Udaya Lagna
    try:
        udaya_lagna = calc_udaya_lagna(jd_sunrise, lat, lon, tz)
    except Exception:
        udaya_lagna = []

    # Current moment end times (for "now" display)
    now_tz = datetime.now(tz)
    jd_now = get_julian_day(now_tz)
    sun_now  = get_sidereal_position(swe.SUN, jd_now)
    moon_now = get_sidereal_position(swe.MOON, jd_now)
    current_tithi   = calc_tithi(sun_now, moon_now)
    current_tithi["end_time"] = find_tithi_end(jd_now, sun_now, moon_now, tz)
    current_yoga    = calc_yoga(sun_now, moon_now)
    current_yoga["end_time"]  = find_yoga_end(jd_now, sun_now, moon_now, tz)
    current_karana  = calc_karana(sun_now, moon_now)
    current_karana["end_time"] = find_karana_end(jd_now, sun_now, moon_now, tz)
    current_nak = calc_nakshatra(moon_now)
    current_nak["end_time"] = find_nakshatra_end(jd_now, moon_now, tz)

    # Current choghadiya
    current_choghadiya = None
    for p in choghadiya["day"] + choghadiya["night"]:
        try:
            ps = datetime.strptime(p["start"], "%H:%M").replace(year=now_tz.year, month=now_tz.month, day=now_tz.day, tzinfo=tz)
            pe = datetime.strptime(p["end"],   "%H:%M").replace(year=now_tz.year, month=now_tz.month, day=now_tz.day, tzinfo=tz)
            if ps <= now_tz <= pe:
                current_choghadiya = p
                break
        except Exception:
            pass

    return {
        "date": date_str,
        "location": {"latitude": lat, "longitude": lon, "timezone": tz_str},

        # A. Pancha Anga
        "tithi":     tithi,
        "vara":      vara,
        "nakshatra": nakshatra,
        "yoga":      yoga,
        "karana":    karana,

        # B. Calendar
        "hindu_calendar": hindu_cal,

        # C. Sun & Moon
        "sun": {
            "sunrise": _fmt(sunrise), "sunset": _fmt(sunset),
            "surya_rashi": surya_rashi,
        },
        "moon": {
            "moonrise": _fmt(moonrise) if moonrise else "N/A",
            "moonset":  _fmt(moonset)  if moonset  else "N/A",
            "chandra_rashi": chandra_rashi,
            "chandra_rashi_transition": rashi_transition,
        },
        "durations": durations,
        "madhyahna": madhyahna,

        # D. Inauspicious
        "inauspicious": inauspicious,

        # E. Auspicious (muhurta array now includes Amrit Kalam, Pratah/Sayahna Sandhya)
        "muhurta": muhurta,

        # F. Muhurta tables
        "choghadiya": choghadiya,
        "hora":       hora,
        "udaya_lagna": udaya_lagna,

        # G. Special Yogas
        "special_yogas": special_yogas,

        # H. Inauspicious conditions
        **specials,

        # I. Tarabalam / Chandrabalam
        "tarabalam":    tarabalam,
        "chandrabalam": chandrabalam,

        # J. Festivals
        "festivals": festivals,

        # Current-moment snapshot
        "current": {
            "tithi":       current_tithi,
            "nakshatra":   current_nak,
            "yoga":        current_yoga,
            "karana":      current_karana,
            "choghadiya":  current_choghadiya,
        },
    }
