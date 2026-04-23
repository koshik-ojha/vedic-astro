import API from './client';

export const getSunSignHoroscope = (sign, period = 'daily', date) =>
  API.get(`/astro/horoscope/${period}`, { params: { sign, date } });

export const getTodaySunSign = (sign, date) =>
  API.get('/astro/today/sunsign', { params: { sign, date } });

export const getPanchang = (lat, lon, timezone = 'Asia/Kolkata', date) =>
  API.get('/astro/today/panchang', { params: { lat, lon, timezone, date } });

export const getVedicPanchang = (lat, lon, timezone = 'Asia/Kolkata', date, birthNakshatra, birthRashi) =>
  API.get('/astro/vedic-panchang', { params: { lat, lon, timezone, date, birth_nakshatra: birthNakshatra, birth_rashi: birthRashi } });

export const getPersonalized = (profileId, date) =>
  API.get('/astro/today/personalized', { params: { profile_id: profileId, date } });
