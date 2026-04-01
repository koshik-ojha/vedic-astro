"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Select } from "../../../components/Select";
import { AstroOutput } from "../../../components/AstroOutput";
import { apiFetch } from "../../../lib/api";
import { MdWbSunny, MdStar } from "react-icons/md";

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

function DailyContent() {
  const searchParams = useSearchParams();
  const urlProfileId = searchParams.get("profile_id");

  const [mode, setMode] = useState(urlProfileId ? "profile" : "sunsign");
  const [sign, setSign] = useState("aries");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(urlProfileId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    try {
      let data;
      if (mode === "sunsign") {
        data = await apiFetch(`/astro/today/sunsign?sign=${encodeURIComponent(sign)}`);
      } else {
        if (!selectedProfileId) { setError("Select a profile first."); return; }
        data = await apiFetch(`/astro/today/personalized?profile_id=${selectedProfileId}`);
      }
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="mobile-header text-gray-800 flex items-center gap-2">
          <MdWbSunny className="text-orange-400" size={28} />
          Daily Astrology
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Today&apos;s cosmic insights, personalised for you</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Controls */}
        <div className="card">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-4 sm:mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setMode("sunsign")}
              className={`flex-1 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all touch-target ${
                mode === "sunsign"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              By Sun Sign
            </button>
            <button
              onClick={() => setMode("profile")}
              className={`flex-1 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-all touch-target ${
                mode === "profile"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              By Saved Profile
            </button>
          </div>

          {mode === "sunsign" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sun Sign
              </label>
              <Select value={sign} onChange={setSign} options={ZODIAC} placeholder="Select sign" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Profile
              </label>
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm touch-target"
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

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={getReading}
            disabled={loading}
            className="w-full mt-4 sm:mt-6 py-3.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors touch-target active:scale-95"
          >
            {loading ? "Loading cosmic insights…" : "Get Daily Reading"}
          </button>
        </div>

        {/* Output */}
        <div className="card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Loading your cosmic insights…</p>
            </div>
          ) : result ? (
            <AstroOutput data={result} />
          ) : (
            <div className="text-center py-14">
              <MdStar size={52} className="text-amber-300 mx-auto mb-3" />
              <p className="text-gray-500">Your daily reading will appear here</p>
              <p className="text-gray-400 text-xs mt-1">आपका दैनिक फलादेश यहाँ दिखेगा</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DailyPage() {
  return (
    <Suspense fallback={<div className="p-10 text-gray-400">Loading…</div>}>
      <DailyContent />
    </Suspense>
  );
}
