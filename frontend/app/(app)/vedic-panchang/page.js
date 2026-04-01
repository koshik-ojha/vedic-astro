"use client";

import { useState } from "react";
import { DateInput } from "../../../components/DateInput";
import { LocationInput } from "../../../components/LocationInput";
import { Button } from "../../../components/ui/Button";
import {
  MdAutoAwesome, MdWbSunny, MdNightsStay, MdLocationOn,
  MdStar, MdCircle, MdWbTwilight, MdSelfImprovement,
  MdCalendarToday, MdDarkMode, MdLightMode, MdWbCloudy,
  MdAccessTime, MdLocationCity,
} from "react-icons/md";

const QUALITY_COLORS = {
  Excellent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Good: "bg-blue-100 text-blue-800 border-blue-200",
  Beneficial: "bg-sky-100 text-sky-800 border-sky-200",
  Neutral: "bg-gray-100 text-gray-700 border-gray-200",
  Inauspicious: "bg-red-100 text-red-700 border-red-200",
};

function QualityBadge({ quality }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${QUALITY_COLORS[quality] || QUALITY_COLORS.Neutral}`}>
      {quality}
    </span>
  );
}

function InfoCard({ icon: Icon, iconColor, bgGradient, label, value, sub, extra }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${bgGradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative">
        <div className={`w-12 h-12 rounded-xl ${iconColor} bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        
        <div>
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-xl font-bold text-white leading-tight mb-1">{value}</p>
          {sub && <p className="text-sm text-white/90 font-medium">{sub}</p>}
          {extra && <p className="text-xs text-white/70 mt-1">{extra}</p>}
        </div>
      </div>
    </div>
  );
}

function TimeRangeCard({ icon: Icon, label, start, end, available, bgGradient }) {
  return (
    <div className={`relative overflow-hidden rounded-xl p-5 shadow-md ${bgGradient || "bg-gradient-to-br from-gray-600 to-gray-800"}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-white/90 uppercase tracking-wider">{label}</p>
          {available !== false ? (
            <p className="text-lg font-bold text-white mt-0.5">{start} - {end}</p>
          ) : (
            <p className="text-sm text-white/70 mt-0.5">Not available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VedicPanchangPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  
  // Form inputs
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [city, setCity] = useState("Mumbai");
  const [lat, setLat] = useState(19.0760);
  const [lng, setLng] = useState(72.8777);

  const handleLocationSelect = (location) => {
    setCity(location.place_name.split(',')[0]);
    setLat(location.lat);
    setLng(location.lon);
  };

  const handleFetchPanchang = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      const payload = {
        year,
        month,
        day,
        hour,
        minute,
        city,
        lat,
        lng,
        tz_str: "auto"
      };

      const response = await fetch("https://api.freeastroapi.com/api/v1/vedic/panchang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "bb954671c72879c6bfdb8d8a9d10337295a933f9fff04b408794040ab9d4597e"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to fetch panchang data");
      console.error("Error fetching panchang:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <MdAutoAwesome className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vedic Panchang</h1>
            <p className="text-sm text-gray-500">Detailed Vedic Calendar Information</p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Enter Details</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <DateInput
              value={date}
              onChange={setDate}
              placeholder="Select date"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <LocationInput
              value={city}
              onChange={setCity}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>

        {/* Coordinates Display */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>Latitude: {lat.toFixed(4)}°</span>
          <span>Longitude: {lng.toFixed(4)}°</span>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleFetchPanchang}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? "Fetching..." : "Get Panchang"}
        </Button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Calculating Vedic Panchang…</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-8">
          {/* Date Display */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <MdCalendarToday size={16} />
              <span className="font-semibold">{formatDate()}</span>
              <span className="mx-2">•</span>
              <MdAccessTime size={16} />
              <span>{time}</span>
              <span className="mx-2">•</span>
              <MdLocationCity size={16} />
              <span>{data.metadata?.location || city}</span>
            </p>
          </div>

          {/* Sun & Moon Times */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Celestial Timings</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <InfoCard
                icon={MdWbSunny}
                iconColor="text-orange-500"
                bgGradient="bg-gradient-to-br from-orange-500 to-red-600"
                label="Sunrise"
                value={data.sunrise}
              />
              <InfoCard
                icon={MdNightsStay}
                iconColor="text-blue-500"
                bgGradient="bg-gradient-to-br from-blue-600 to-cyan-600"
                label="Sunset"
                value={data.sunset}
              />
              <InfoCard
                icon={MdDarkMode}
                iconColor="text-purple-500"
                bgGradient="bg-gradient-to-br from-purple-600 to-indigo-700"
                label="Moonrise"
                value={data.moonrise}
              />
              <InfoCard
                icon={MdNightsStay}
                iconColor="text-slate-500"
                bgGradient="bg-gradient-to-br from-slate-600 to-gray-800"
                label="Moonset"
                value={data.moonset}
              />
            </div>
          </div>

          {/* Tithi, Nakshatra, Yoga, Karana */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Panchang Elements</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.tithi && (
                <InfoCard
                  icon={MdCircle}
                  iconColor="text-yellow-500"
                  bgGradient="bg-gradient-to-br from-yellow-500 to-amber-600"
                  label="Tithi"
                  value={data.tithi.name}
                  sub={data.tithi.lord ? `Lord: ${data.tithi.lord}` : undefined}
                  extra={data.tithi.end_time && data.tithi.percent_remaining != null ? `Ends at ${data.tithi.end_time} (${data.tithi.percent_remaining.toFixed(1)}% remaining)` : undefined}
                />
              )}
              
              {data.nakshatra && (
                <InfoCard
                  icon={MdStar}
                  iconColor="text-blue-500"
                  bgGradient="bg-gradient-to-br from-blue-500 to-cyan-600"
                  label="Nakshatra"
                  value={data.nakshatra.name}
                  sub={data.nakshatra.lord && data.nakshatra.pada ? `Lord: ${data.nakshatra.lord} • Pada ${data.nakshatra.pada}` : undefined}
                  extra={data.nakshatra.end_time && data.nakshatra.percent_remaining != null ? `Ends at ${data.nakshatra.end_time} (${data.nakshatra.percent_remaining.toFixed(1)}% remaining)` : undefined}
                />
              )}
              
              {data.yoga && (
                <InfoCard
                  icon={MdSelfImprovement}
                  iconColor="text-green-500"
                  bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
                  label="Yoga"
                  value={data.yoga.name}
                  sub={data.yoga.description}
                  extra={data.yoga.percent_remaining != null ? `${data.yoga.percent_remaining.toFixed(1)}% remaining` : undefined}
                />
              )}
              
              {data.karana && (
                <InfoCard
                  icon={MdWbTwilight}
                  iconColor="text-purple-500"
                  bgGradient="bg-gradient-to-br from-purple-500 to-pink-600"
                  label="Karana"
                  value={data.karana.name}
                  sub={data.karana.type ? `Type: ${data.karana.type}` : undefined}
                  extra={data.karana.percent_remaining != null ? `${data.karana.percent_remaining.toFixed(1)}% remaining` : undefined}
                />
              )}
            </div>
          </div>

          {/* Weekday */}
          {data.weekday && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Day of the Week</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MdCalendarToday size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{data.weekday.name}</p>
                  <p className="text-sm text-gray-600">
                    {data.weekday.sanskrit} • Lord: {data.weekday.lord}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inauspicious Timings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Inauspicious Periods</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.rahu_kalam && (
                <TimeRangeCard
                  icon={MdDarkMode}
                  label="Rahu Kalam"
                  start={data.rahu_kalam.start}
                  end={data.rahu_kalam.end}
                  bgGradient="bg-gradient-to-br from-red-600 to-rose-700"
                />
              )}
              
              {data.gulika_kalam && (
                <TimeRangeCard
                  icon={MdNightsStay}
                  label="Gulika Kalam"
                  start={data.gulika_kalam.start}
                  end={data.gulika_kalam.end}
                  bgGradient="bg-gradient-to-br from-orange-600 to-red-700"
                />
              )}
              
              {data.yamagandam && (
                <TimeRangeCard
                  icon={MdWbCloudy}
                  label="Yamagandam"
                  start={data.yamagandam.start}
                  end={data.yamagandam.end}
                  bgGradient="bg-gradient-to-br from-slate-600 to-gray-700"
                />
              )}
            </div>
          </div>

          {/* Auspicious Timing */}
          {data.abhijit_muhurta && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Auspicious Muhurta</h3>
              <TimeRangeCard
                icon={MdWbSunny}
                label="Abhijit Muhurta"
                start={data.abhijit_muhurta.start}
                end={data.abhijit_muhurta.end}
                available={data.abhijit_muhurta.available}
                bgGradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
            </div>
          )}

          {/* Zodiac Signs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Zodiac Positions</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {data.sun_sign && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <MdWbSunny size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Sun Sign</p>
                      <p className="text-xl font-bold text-gray-800">{data.sun_sign.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Degree: {data.sun_sign.degree != null ? data.sun_sign.degree.toFixed(2) : 'N/A'}°</p>
                </div>
              )}
              
              {data.moon_sign && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <MdNightsStay size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Moon Sign</p>
                      <p className="text-xl font-bold text-gray-800">{data.moon_sign.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Degree: {data.moon_sign.degree != null ? data.moon_sign.degree.toFixed(2) : 'N/A'}°</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
