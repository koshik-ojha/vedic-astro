"use client";

import { useState } from "react";
import { DateInput } from "../../../components/DateInput";
import { LocationInput } from "../../../components/LocationInput";
import { Button } from "../../../components/ui/Button";

export default function VedicPanchangPage() {
  const [date, setDate] = useState("");
  const [locationText, setLocationText] = useState("");
  const [location, setLocation] = useState({ city: "", lat: "", lon: "", timezone: "" });
  const [panchang, setPanchang] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (loc) => {
    setLocation({
      city: loc.place_name,
      lat: loc.lat,
      lon: loc.lon,
      timezone: "Asia/Kolkata" // Default for India
    });
    setError(""); // Clear error when location is selected
  };

  const handleCalculate = async () => {
    if (!date || !location.lat || !location.lon) {
      setError("Please enter date and location");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const params = new URLSearchParams({
        date,
        lat: location.lat,
        lon: location.lon,
        timezone: location.timezone || "UTC"
      });

      const response = await fetch(`${API_BASE}/astro/vedic-panchang?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch panchang data");
      }

      const data = await response.json();
      setPanchang(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🕉️</span>
          </div>
          <div>
            <h1 className="mobile-header text-gray-800">Vedic Panchang</h1>
            <p className="text-xs sm:text-sm text-gray-500">Complete Hindu Calendar Information</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
        <div className="space-y-4">
          <DateInput value={date} onChange={(newDate) => { setDate(newDate); setError(""); }} />
          <LocationInput 
            value={locationText} 
            onChange={setLocationText} 
            onLocationSelect={handleLocationSelect}
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Button 
            onClick={handleCalculate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Calculating..." : "Calculate Panchang"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {panchang && (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Date & Location</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold">{panchang.date}</span>
              </div>
              <div>
                <span className="text-gray-600">Vara (Day):</span>
                <span className="ml-2 font-semibold">{panchang.vara?.sanskrit} ({panchang.vara?.english})</span>
              </div>
            </div>
          </div>

          {/* Sun & Moon Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>☀️</span> Sun Times
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sunrise:</span>
                  <span className="font-semibold text-lg">{panchang.sun?.sunrise}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sunset:</span>
                  <span className="font-semibold text-lg">{panchang.sun?.sunset}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                  <span className="text-gray-600">Day Duration:</span>
                  <span className="font-semibold">{panchang.durations?.day_duration}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🌙</span> Moon Times
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Moonrise:</span>
                  <span className="font-semibold text-lg">{panchang.moon?.moonrise}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Moonset:</span>
                  <span className="font-semibold text-lg">{panchang.moon?.moonset}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-indigo-200">
                  <span className="text-gray-600">Night Duration:</span>
                  <span className="font-semibold">{panchang.durations?.night_duration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panchang Elements - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tithi */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-pink-500">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">TITHI</h4>
              <div className="text-xl font-bold text-gray-800 mb-1">{panchang.tithi?.name}</div>
              <div className="text-xs text-gray-600">Index: {panchang.tithi?.index}</div>
              <div className="mt-3 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${panchang.tithi?.percent_elapsed || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{panchang.tithi?.percent_elapsed}% elapsed</div>
            </div>

            {/* Nakshatra */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-purple-500">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">NAKSHATRA</h4>
              <div className="text-xl font-bold text-gray-800 mb-1">{panchang.nakshatra?.name}</div>
              <div className="text-xs text-gray-600">Pada: {panchang.nakshatra?.pada}</div>
              <div className="mt-3 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${panchang.nakshatra?.percent_elapsed || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{panchang.nakshatra?.percent_elapsed}% elapsed</div>
            </div>

            {/* Yoga */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-500">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">YOGA</h4>
              <div className="text-xl font-bold text-gray-800 mb-1">{panchang.yoga?.name}</div>
              <div className="text-xs text-gray-600">Index: {panchang.yoga?.index}</div>
              <div className="mt-3 bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${panchang.yoga?.percent_elapsed || 0}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{panchang.yoga?.percent_elapsed}% elapsed</div>
            </div>

            {/* Karana */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">KARANA</h4>
              <div className="text-xl font-bold text-gray-800 mb-1">{panchang.karana?.name}</div>
              <div className="text-xs text-gray-600">Index: {panchang.karana?.index}</div>
            </div>
          </div>

          {/* Current Elements with End Times */}
          {panchang.current && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ Current Elements (Live)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Current Tithi</div>
                  <div className="font-bold text-gray-800">{panchang.current.tithi?.name}</div>
                  {panchang.current.tithi?.end_time && (
                    <div className="text-xs text-green-600 mt-1">
                      Ends at: {panchang.current.tithi.end_time}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Current Yoga</div>
                  <div className="font-bold text-gray-800">{panchang.current.yoga?.name}</div>
                  {panchang.current.yoga?.end_time && (
                    <div className="text-xs text-green-600 mt-1">
                      Ends at: {panchang.current.yoga.end_time}
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Current Karana</div>
                  <div className="font-bold text-gray-800">{panchang.current.karana?.name}</div>
                  {panchang.current.karana?.end_time && (
                    <div className="text-xs text-green-600 mt-1">
                      Ends at: {panchang.current.karana.end_time}
                    </div>
                  )}
                </div>
              </div>
              {panchang.current.choghadiya && (
                <div className="mt-4 bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Current Choghadiya</div>
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-gray-800">{panchang.current.choghadiya.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      panchang.current.choghadiya.quality === 'Excellent' ? 'bg-green-100 text-green-700' :
                      panchang.current.choghadiya.quality === 'Good' ? 'bg-blue-100 text-blue-700' :
                      panchang.current.choghadiya.quality === 'Beneficial' ? 'bg-purple-100 text-purple-700' :
                      panchang.current.choghadiya.quality === 'Neutral' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {panchang.current.choghadiya.quality}
                    </div>
                    <div className="text-xs text-gray-500">
                      {panchang.current.choghadiya.start} - {panchang.current.choghadiya.end}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Choghadiya Periods */}
          {panchang.choghadiya && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Choghadiya Periods</h3>
              
              {/* Day Choghadiya */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>☀️</span> Day Choghadiya
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {panchang.choghadiya.day?.map((period, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border-2 ${
                        period.quality === 'Excellent' ? 'border-green-300 bg-green-50' :
                        period.quality === 'Good' ? 'border-blue-300 bg-blue-50' :
                        period.quality === 'Beneficial' ? 'border-purple-300 bg-purple-50' :
                        period.quality === 'Neutral' ? 'border-gray-300 bg-gray-50' :
                        'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{period.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {period.start} - {period.end}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        period.quality === 'Excellent' ? 'text-green-600' :
                        period.quality === 'Good' ? 'text-blue-600' :
                        period.quality === 'Beneficial' ? 'text-purple-600' :
                        period.quality === 'Neutral' ? 'text-gray-600' :
                        'text-red-600'
                      }`}>
                        {period.quality}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Night Choghadiya */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span>🌙</span> Night Choghadiya
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {panchang.choghadiya.night?.map((period, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg border-2 ${
                        period.quality === 'Excellent' ? 'border-green-300 bg-green-50' :
                        period.quality === 'Good' ? 'border-blue-300 bg-blue-50' :
                        period.quality === 'Beneficial' ? 'border-purple-300 bg-purple-50' :
                        period.quality === 'Neutral' ? 'border-gray-300 bg-gray-50' :
                        'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{period.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {period.start} - {period.end}
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        period.quality === 'Excellent' ? 'text-green-600' :
                        period.quality === 'Good' ? 'text-blue-600' :
                        period.quality === 'Beneficial' ? 'text-purple-600' :
                        period.quality === 'Neutral' ? 'text-gray-600' :
                        'text-red-600'
                      }`}>
                        {period.quality}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
