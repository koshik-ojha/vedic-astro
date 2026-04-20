"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import PanchangModal from "../../../components/PanchangModal";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const QUALITY_STYLE = {
  Excellent:    "bg-green-100 text-green-700 border-green-300",
  Good:         "bg-blue-100 text-blue-700 border-blue-300",
  Beneficial:   "bg-purple-100 text-purple-700 border-purple-300",
  Neutral:      "bg-gray-100 text-gray-600 border-gray-300",
  Inauspicious: "bg-red-100 text-red-600 border-red-300",
};

const QUALITY_BAR = {
  Excellent:    "bg-green-500",
  Good:         "bg-blue-500",
  Beneficial:   "bg-purple-500",
  Neutral:      "bg-gray-400",
  Inauspicious: "bg-red-400",
};

const PLANET_ICON = {
  Sun: "☀️", Moon: "🌙", Mars: "♂️", Mercury: "☿",
  Jupiter: "♃", Venus: "♀️", Saturn: "♄",
};

export default function VedicPanchangPage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [panchang, setPanchang] = useState(null);
  const [meta, setMeta] = useState(null); // {date, city}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-open modal on first load
  useEffect(() => {
    setModalOpen(true);
  }, []);

  const handleSubmit = async ({ date, lat, lon, timezone, city }) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ date, lat, lon, timezone });
      const res = await fetch(`${API_BASE}/astro/vedic-panchang?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch panchang");
      setPanchang(data);
      setMeta({ date, city });
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      {/* Modal */}
      <PanchangModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🕉️</span>
          </div>
          <div>
            <h1 className="mobile-header text-gray-800">Vedic Panchang</h1>
            <p className="text-xs sm:text-sm text-gray-500">Complete Hindu Calendar Information</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          {panchang ? "Change" : "Select Date"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* No data yet */}
      {!panchang && !loading && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🕉️</div>
          <p className="text-lg font-medium text-gray-500">Select a date and location to view Panchang</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Panchang
          </button>
        </div>
      )}

      {panchang && (
        <div className="space-y-6">

          {/* ── 1. PANCHANG SUMMARY ── */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-md p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Panchang Summary</h2>

            {/* Date / Month / Paksha row */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Date</div>
                <div className="font-bold text-gray-800 text-sm">{panchang.date}</div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Hindu Month</div>
                <div className="font-bold text-orange-600 text-sm">{panchang.hindu_calendar?.month}</div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Paksha</div>
                <div className="font-bold text-amber-600 text-xs leading-tight">{panchang.hindu_calendar?.paksha}</div>
              </div>
            </div>

            {/* Five elements */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Tithi", value: panchang.tithi?.name, sub: `Day ${panchang.hindu_calendar?.paksha_day}`, color: "pink" },
                { label: "Nakshatra", value: panchang.nakshatra?.name, sub: `Pada ${panchang.nakshatra?.pada}`, color: "purple" },
                { label: "Yoga", value: panchang.yoga?.name, sub: `${panchang.yoga?.percent_elapsed}% elapsed`, color: "blue" },
                { label: "Karana", value: panchang.karana?.name, sub: "", color: "green" },
                { label: "Vara (Day)", value: panchang.vara?.sanskrit, sub: panchang.vara?.english, color: "indigo" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className={`bg-white rounded-xl p-3 shadow-sm border-l-4 border-${color}-400`}>
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className="font-bold text-gray-800 text-sm leading-tight">{value}</div>
                  {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── 2. SUN & MOON TIMES ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">☀️ Sun Times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Sunrise</span><span className="font-semibold">{panchang.sun?.sunrise}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sunset</span><span className="font-semibold">{panchang.sun?.sunset}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Day Duration</span><span className="font-semibold">{panchang.durations?.day_duration}</span></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">🌙 Moon Times</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Moonrise</span><span className="font-semibold">{panchang.moon?.moonrise}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Moonset</span><span className="font-semibold">{panchang.moon?.moonset}</span></div>
                <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Night Duration</span><span className="font-semibold">{panchang.durations?.night_duration}</span></div>
              </div>
            </div>
          </div>

          {/* ── 3. FESTIVALS ── */}
          {panchang.festivals?.length > 0 && (
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-3">🎉 Today&apos;s Festivals</h3>
              <div className="flex flex-wrap gap-2">
                {panchang.festivals.map((f, i) => (
                  <span key={i} className="px-4 py-2 bg-white border border-pink-200 rounded-full text-sm font-semibold text-pink-700 shadow-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. MUHURTA ── */}
          {panchang.muhurta?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4">✨ Auspicious Muhurtas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {panchang.muhurta.map((m, i) => (
                  <div key={i} className={`p-4 rounded-xl border-2 ${QUALITY_STYLE[m.quality] || QUALITY_STYLE.Neutral}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-sm">{m.name}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${QUALITY_STYLE[m.quality]}`}>
                        {m.quality}
                      </span>
                    </div>
                    <div className="text-xs font-mono mb-1">{m.start} – {m.end}</div>
                    <div className="text-xs opacity-75">{m.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 5. HORA ── */}
          {panchang.hora?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4">🪐 Hora (Planetary Hours)</h3>

              {["Day", "Night"].map((period) => (
                <div key={period} className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    {period === "Day" ? "☀️" : "🌙"} {period} Horas
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {panchang.hora.filter(h => h.period === period).map((h, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${QUALITY_STYLE[h.quality] || QUALITY_STYLE.Neutral}`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-base">{PLANET_ICON[h.planet]}</span>
                          <span className="font-semibold text-sm">{h.planet}</span>
                          <span className="ml-auto text-xs opacity-60">#{h.hora_number}</span>
                        </div>
                        <div className="text-xs font-mono">{h.start} – {h.end}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 6. CHOGHADIYA ── */}
          {panchang.choghadiya && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4">⏱️ Choghadiya</h3>

              {["day", "night"].map((period) => (
                <div key={period} className="mb-5">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">
                    {period === "day" ? "☀️ Day" : "🌙 Night"} Choghadiya
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {panchang.choghadiya[period]?.map((c, i) => (
                      <div key={i} className={`p-3 rounded-lg border-2 ${QUALITY_STYLE[c.quality] || QUALITY_STYLE.Neutral}`}>
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs font-mono mt-0.5">{c.start} – {c.end}</div>
                        <div className="text-xs mt-1 font-medium opacity-80">{c.quality}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 7. CURRENT ELEMENTS ── */}
          {panchang.current && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-md p-5">
              <h3 className="font-bold text-gray-800 mb-4">⏰ Current Elements (Live)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Tithi", data: panchang.current.tithi },
                  { label: "Nakshatra", data: { name: panchang.nakshatra?.name, end_time: null } },
                  { label: "Yoga", data: panchang.current.yoga },
                  { label: "Karana", data: panchang.current.karana },
                ].map(({ label, data }) => (
                  <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className="font-bold text-gray-800 text-sm">{data?.name}</div>
                    {data?.end_time && (
                      <div className="text-xs text-green-600 mt-1">Ends: {data.end_time}</div>
                    )}
                    {data?.percent_elapsed != null && (
                      <div className="mt-2">
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${QUALITY_BAR.Neutral}`}
                            style={{ width: `${data.percent_elapsed}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{data.percent_elapsed}% elapsed</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {panchang.current.choghadiya && (
                <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">Current Choghadiya</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{panchang.current.choghadiya.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${QUALITY_STYLE[panchang.current.choghadiya.quality]}`}>
                      {panchang.current.choghadiya.quality}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {panchang.current.choghadiya.start} – {panchang.current.choghadiya.end}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
