"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api";
import {
  MdAutoAwesome, MdWbSunny, MdNightsStay, MdLocationOn,
  MdStar, MdCircle, MdWbTwilight, MdSelfImprovement, MdClose,
  MdCalendarToday, MdDarkMode, MdLightMode, MdWbCloudy,
} from "react-icons/md";

const QUALITY_COLORS = {
  Excellent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Good: "bg-blue-100 text-blue-800 border-blue-200",
  Beneficial: "bg-sky-100 text-sky-800 border-sky-200",
  Neutral: "bg-gray-100 text-gray-700 border-gray-200",
  Inauspicious: "bg-red-100 text-red-700 border-red-200",
};

const QUALITY_DOT = {
  Excellent: "bg-emerald-500",
  Good: "bg-blue-500",
  Beneficial: "bg-sky-500",
  Neutral: "bg-gray-400",
  Inauspicious: "bg-red-500",
};

function QualityBadge({ quality }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${QUALITY_COLORS[quality] || QUALITY_COLORS.Neutral}`}>
      {quality}
    </span>
  );
}

function InfoCard({ icon: Icon, iconColor, bgGradient, label, value, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${bgGradient}`}>
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
      
      <div className="relative">
        {/* Icon */}
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${iconColor} bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
          <Icon size={20} className="text-white sm:w-6 sm:h-6" />
        </div>
        
        {/* Content */}
        <div>
          <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1 sm:mb-2">{label}</p>
          <p className="text-lg sm:text-xl font-bold text-white leading-tight mb-1 truncate">{value}</p>
          {sub && <p className="text-xs text-white/70 font-medium truncate">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ChoghadiyaTable({ periods, label, icon: Icon, iconColor }) {
  const now = new Date();
  const nowStr = now.toTimeString().slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-5 py-4 flex items-center gap-2 ${iconColor}`}>
        <Icon size={18} className="text-white" />
        <h3 className="font-bold text-white text-sm">{label} Choghadiya</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {periods.map((p, i) => {
          const isCurrent = p.start <= nowStr && nowStr < p.end;
          return (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                isCurrent ? "bg-amber-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${QUALITY_DOT[p.quality] || "bg-gray-400"}`} />
                <span className={`font-semibold ${isCurrent ? "text-amber-700" : "text-gray-800"}`}>
                  {p.name}
                  {isCurrent && <span className="ml-2 text-xs font-medium text-amber-600">(now)</span>}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <QualityBadge quality={p.quality} />
                <span className="text-xs text-gray-400 tabular-nums">{p.start}–{p.end}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MuhuratCard({ muhurat }) {
  const MUHURAT_ICONS = {
    "Brahma Muhurta": MdSelfImprovement,
    "Abhijit Muhurta": MdWbSunny,
    "Vijaya Muhurta": MdAutoAwesome,
    "Godhuli Muhurta": MdWbTwilight,
    "Nishita Muhurta": MdNightsStay,
  };
  const Icon = MUHURAT_ICONS[muhurat.name] || MdStar;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
        <Icon size={18} className="text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-semibold text-gray-800 text-sm">{muhurat.name}</p>
          <div className="flex items-center gap-2">
            <QualityBadge quality={muhurat.quality} />
            <span className="text-xs text-gray-400 tabular-nums">{muhurat.start}–{muhurat.end}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{muhurat.description}</p>
      </div>
    </div>
  );
}

function ChoghadiyaModal({ isOpen, onClose, choghadiya }) {
  const [activeTab, setActiveTab] = useState("day");
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !choghadiya) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 active:scale-90 transition-all z-10 p-2 rounded-lg hover:bg-gray-100 touch-target"
        >
          <MdClose size={24} />
        </button>

        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Choghadiya</h2>
          
          <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("day")}
              className={`px-4 py-2.5 sm:py-2 font-semibold text-sm transition-all touch-target ${
                activeTab === "day"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setActiveTab("night")}
              className={`px-4 py-2.5 sm:py-2 font-semibold text-sm transition-all touch-target ${
                activeTab === "night"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Night
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] -mx-4 sm:mx-0 px-4 sm:px-0">
            <ChoghadiyaTable
              periods={activeTab === "day" ? choghadiya.day : choghadiya.night}
              label={activeTab === "day" ? "Day" : "Night"}
              icon={activeTab === "day" ? MdWbSunny : MdNightsStay}
              iconColor={activeTab === "day" ? "bg-orange-400" : "bg-indigo-600"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MuhuratModal({ isOpen, onClose, muhurats }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !muhurats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 active:scale-90 transition-all z-10 p-2 rounded-lg hover:bg-gray-100 touch-target"
        >
          <MdClose size={24} />
        </button>

        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Auspicious Muhurats</h2>
          
          <div className="overflow-y-auto max-h-[70vh] space-y-3 -mx-4 sm:mx-0 px-4 sm:px-0">
            {muhurats.map((m, i) => (
              <MuhuratCard key={i} muhurat={m} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PanchangPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.209);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [showChoghadiyaModal, setShowChoghadiyaModal] = useState(false);
  const [showMuhuratModal, setShowMuhuratModal] = useState(false);

  async function fetchPanchang(lt = lat, ln = lon, tz = timezone) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ lat: lt, lon: ln, timezone: tz });
      const result = await apiFetch(`/astro/today/panchang?${params}`);
      setData(result);
    } catch (e) {
      setError(e.message || "Failed to load Panchang");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Try to get browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lt = parseFloat(pos.coords.latitude.toFixed(4));
          const ln = parseFloat(pos.coords.longitude.toFixed(4));
          setLat(lt);
          setLon(ln);
          // Guess timezone from browser
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
          setTimezone(tz);
          fetchPanchang(lt, ln, tz);
        },
        () => fetchPanchang()
      );
    } else {
      fetchPanchang();
    }
  }, []);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Helper to find current choghadiya
  const getCurrentChoghadiya = () => {
    if (!data?.choghadiya) return null;
    const now = new Date();
    const nowStr = now.toTimeString().slice(0, 5);
    
    const allPeriods = [...(data.choghadiya.day || []), ...(data.choghadiya.night || [])];
    return allPeriods.find(p => p.start <= nowStr && nowStr < p.end) || null;
  };

  // Helper to find current muhurat
  const getCurrentMuhurat = () => {
    if (!data?.muhurat) return null;
    const now = new Date();
    const nowStr = now.toTimeString().slice(0, 5);
    
    return data.muhurat.find(m => m.start <= nowStr && nowStr < m.end) || data.muhurat[0];
  };

  const currentChoghadiya = data ? getCurrentChoghadiya() : null;
  const currentMuhurat = data ? getCurrentMuhurat() : null;

  // Helper to get Paksha from tithi
  const getPaksha = () => {
    if (!data?.tithi) return "N/A";
    const tithiIndex = data.tithi.index - 1; // Convert to 0-based
    if (tithiIndex >= 0 && tithiIndex <= 14) return "Shukla Paksha";
    if (tithiIndex >= 15 && tithiIndex <= 28) return "Krishna Paksha";
    return "Amavasya";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="mb-6 sm:mb-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <MdAutoAwesome className="text-white" size={20} />
          </div>
          <div>
            <h1 className="mobile-header text-gray-800">Panchang</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">{dateLabel}</p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 sm:hidden mb-2">{dateLabel}</p>
        {data && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MdLocationOn size={14} />
            {data.location.lat.toFixed(2)}°N, {data.location.lon.toFixed(2)}°E · {data.location.timezone}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Calculating Panchang…</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
          {error}
          <button
            onClick={() => fetchPanchang()}
            className="ml-3 underline text-red-600 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Sun times and current info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* Sunrise */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdWbSunny size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Sunrise</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{data.sunrise}</p>
              </div>
            </div>

            {/* Sunset */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdNightsStay size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Sunset</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{data.sunset}</p>
              </div>
            </div>

            {/* Current Choghadiya - Clickable */}
            <button
              onClick={() => setShowChoghadiyaModal(true)}
              className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-left cursor-pointer group touch-target"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:bg-white/30 transition-all">
                  <MdWbTwilight size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Current Choghadiya</p>
                <p className="text-lg sm:text-xl font-bold text-white truncate">
                  {currentChoghadiya ? currentChoghadiya.name : "N/A"}
                </p>
                {currentChoghadiya && (
                  <p className="text-white/70 text-xs mt-1 truncate">{currentChoghadiya.quality}</p>
                )}
              </div>
            </button>

            {/* Current Muhurat - Clickable */}
            <button
              onClick={() => setShowMuhuratModal(true)}
              className="relative overflow-hidden bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 text-left cursor-pointer group touch-target"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:bg-white/30 transition-all">
                  <MdStar size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Current Muhurat</p>
                <p className="text-lg sm:text-xl font-bold text-white truncate">
                  {currentMuhurat ? currentMuhurat.name : "N/A"}
                </p>
                {currentMuhurat && (
                  <p className="text-white/70 text-xs mt-1 truncate">{currentMuhurat.quality}</p>
                )}
              </div>
            </button>
          </div>

          {/* Additional Panchang Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {/* Paksha */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                  <MdCircle size={18} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Paksha</p>
                <p className="text-base sm:text-xl font-bold text-white truncate">{getPaksha()}</p>
              </div>
            </div>

            {/* Weekday */}
            <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg">
                  <MdCalendarToday size={18} className="text-white sm:w-6 sm:h-6" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Day</p>
                <p className="text-base sm:text-xl font-bold text-white truncate">{data.weekday}</p>
              </div>
            </div>

            {/* Day Duration */}
            <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]">
              <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-10 -mt-10 sm:-mr-16 sm:-mt-16"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdLightMode size={24} className="text-white" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Day Duration</p>
                <p className="text-xl font-bold text-white">{data.day_duration || "N/A"}</p>
              </div>
            </div>

            {/* Night Duration */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 to-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdDarkMode size={24} className="text-white" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Night Duration</p>
                <p className="text-xl font-bold text-white">{data.night_duration || "N/A"}</p>
              </div>
            </div>

            {/* Moonrise */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdNightsStay size={24} className="text-white" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Moonrise</p>
                <p className="text-xl font-bold text-white">{data.moonrise || "N/A"}</p>
              </div>
            </div>

            {/* Moonset */}
            <div className="relative overflow-hidden bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdWbCloudy size={24} className="text-white" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Moonset</p>
                <p className="text-xl font-bold text-white">{data.moonset || "N/A"}</p>
              </div>
            </div>

            {/* Hindu Month */}
            <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                  <MdAutoAwesome size={24} className="text-white" />
                </div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Hindu Month</p>
                <p className="text-xl font-bold text-white">{data.hindu_month || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Pancha-anga: 5 elements */}
          <div>            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <InfoCard
                icon={MdCircle}
                iconColor="text-rose-500"
                bgGradient="bg-gradient-to-br from-rose-500 to-pink-600"
                label="Tithi"
                value={data.tithi.name}
                sub={`${Math.round(data.tithi.percent_elapsed)}% elapsed`}
              />
              <InfoCard
                icon={MdStar}
                iconColor="text-violet-500"
                bgGradient="bg-gradient-to-br from-violet-500 to-purple-600"
                label="Nakshatra"
                value={data.nakshatra.name}
                sub={`${Math.round(data.nakshatra.percent_elapsed)}% elapsed`}
              />
              <InfoCard
                icon={MdAutoAwesome}
                iconColor="text-amber-500"
                bgGradient="bg-gradient-to-br from-amber-500 to-orange-600"
                label="Yoga"
                value={data.yoga.name}
                sub={`No. ${data.yoga.index}`}
              />
              <InfoCard
                icon={MdWbTwilight}
                iconColor="text-teal-500"
                bgGradient="bg-gradient-to-br from-teal-500 to-cyan-600"
                label="Karana"
                value={data.karana.name}
                sub={`No. ${data.karana.index}`}
              />
            </div>
          </div>

        </div>
      ) : null}

      {/* Modals */}
      <ChoghadiyaModal
        isOpen={showChoghadiyaModal}
        onClose={() => setShowChoghadiyaModal(false)}
        choghadiya={data?.choghadiya}
      />
      <MuhuratModal
        isOpen={showMuhuratModal}
        onClose={() => setShowMuhuratModal(false)}
        muhurats={data?.muhurat}
      />
    </div>
  );
}
