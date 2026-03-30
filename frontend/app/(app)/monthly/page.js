"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Select } from "../../../components/Select";
import { apiFetch } from "../../../lib/api";
import { MdCalendarMonth, MdNightsStay } from "react-icons/md";

const ZODIAC = [
  { value: "aries", label: "Aries (मेष)" },
  { value: "taurus", label: "Taurus (वृषभ)" },
  { value: "gemini", label: "Gemini (मिथुन)" },
  { value: "cancer", label: "Cancer (कर्क)" },
  { value: "leo", label: "Leo (सिंह)" },
  { value: "virgo", label: "Virgo (कन्या)" },
  { value: "libra", label: "Libra (तुला)" },
  { value: "scorpio", label: "Scorpio (वृश्चिक)" },
  { value: "sagittarius", label: "Sagittarius (धनु)" },
  { value: "capricorn", label: "Capricorn (मकर)" },
  { value: "aquarius", label: "Aquarius (कुंभ)" },
  { value: "pisces", label: "Pisces (मीन)" },
];

const MONTHLY_THEMES = {
  aries: "This month brings bold beginnings. Take initiative on long-pending projects. Mid-month favours career moves. Avoid impulsive spending near month-end.",
  taurus: "Stability is your theme. Focus on finances and long-term investments. Relationships deepen around the 15th. Take rest seriously.",
  gemini: "Communication is your superpower this month. Ideal for writing, teaching, and networking. Stay grounded when ideas overwhelm.",
  cancer: "Home and family take centre stage. Nurture relationships. A financial opportunity around the 20th — evaluate carefully.",
  leo: "Confidence peaks mid-month. Creative projects flourish. Be mindful of ego in professional settings. Romance sparkles.",
  virgo: "Details matter — perfect for planning and analysis. Health routines set now yield long-term benefits. Avoid over-criticism.",
  libra: "Balance and harmony guide the month. Partnerships — business or personal — are highlighted. Avoid indecision near key deadlines.",
  scorpio: "Transformation is near. Deep focus brings breakthroughs. Release what no longer serves. Intuition is sharp — trust it.",
  sagittarius: "Expansion and exploration. Travel or study are favoured. Keep commitments realistic. Optimism is contagious — share it.",
  capricorn: "Ambition meets opportunity. Career milestones are achievable with steady effort. Rest and recharge on weekends.",
  aquarius: "Innovation and community. Your ideas inspire others. Collaborative projects thrive. Stay open to unconventional solutions.",
  pisces: "Creativity and spirituality flourish. Dreams carry insights — journal them. Set healthy boundaries in emotional situations.",
};

function MonthlyContent() {
  const searchParams = useSearchParams();
  const urlProfileId = searchParams.get("profile_id");

  const [mode, setMode] = useState(urlProfileId ? "profile" : "sunsign");
  const [sign, setSign] = useState("aries");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(urlProfileId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/user/profiles")
      .then((d) => {
        const list = d.profiles || [];
        setProfiles(list);
        if (!selectedProfileId && list.length) setSelectedProfileId(list[0].id);
      })
      .catch(() => {});
  }, []);

  async function getReading() {
    setLoading(true);
    setResult(null);
    try {
      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });
      const year = now.getFullYear();

      let targetSign = sign;
      if (mode === "profile" && selectedProfileId) {
        const profile = profiles.find((p) => p.id === selectedProfileId);
        targetSign = profile?.sun_sign || sign;
      }

      const content =
        MONTHLY_THEMES[targetSign] ||
        "Steady progress awaits. Focus on your priorities, maintain health routines, and nurture meaningful relationships.";

      setResult({
        month: `${monthName} ${year}`,
        sign: targetSign,
        content: `${content}\n\n(Monthly overview for ${monthName} ${year} — personalized natal analysis coming soon.)`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MdCalendarMonth className="text-violet-500" size={32} />
          Monthly Astrology
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleString("default", { month: "long", year: "numeric" })} — celestial overview
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="card">
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode("sunsign")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "sunsign" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              By Sun Sign
            </button>
            <button
              onClick={() => setMode("profile")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "profile" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              By Saved Profile
            </button>
          </div>

          {mode === "sunsign" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sun Sign</label>
              <Select value={sign} onChange={setSign} options={ZODIAC} placeholder="Select sign" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile</label>
              {profiles.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No profiles yet.{" "}
                  <Link href="/profiles" className="text-indigo-600 hover:underline">
                    Add one
                  </Link>
                </p>
              ) : (
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.profile_name} — {p.dob}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            onClick={getReading}
            disabled={loading}
            className="w-full mt-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? "Loading monthly forecast…" : "Get Monthly Forecast"}
          </button>
        </div>

        {/* Output */}
        <div className="card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Generating monthly forecast…</p>
            </div>
          ) : result ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MdCalendarMonth size={32} className="text-violet-500" />
                <div>
                  <p className="font-bold text-gray-800 capitalize">{result.sign} — {result.month}</p>
                  <p className="text-xs text-gray-400">Monthly Forecast</p>
                </div>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{result.content}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-14">
              <MdNightsStay size={52} className="text-indigo-300 mx-auto mb-3" />
              <p className="text-gray-500">Your monthly forecast will appear here</p>
              <p className="text-gray-400 text-xs mt-1">मासिक राशिफल यहाँ दिखेगा</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MonthlyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-gray-400">Loading…</div>}>
      <MonthlyContent />
    </Suspense>
  );
}
