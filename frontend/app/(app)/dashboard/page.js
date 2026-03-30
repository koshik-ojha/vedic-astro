"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MdChevronRight, MdCalendarMonth, MdPeople } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../lib/api";

import {
  MdAutoAwesome, MdWbSunny, MdNightsStay, MdLocationOn,
  MdStar, MdCircle, MdWbTwilight, MdSelfImprovement,
} from "react-icons/md";

export default function Dashboard() {
  const { user } = useAuth();
  const [profileCount, setProfileCount] = useState(null);
  const [panchang, setPanchang] = useState(null);

  useEffect(() => {
    apiFetch("/user/profiles")
      .then((d) => setProfileCount(d.profiles?.length ?? 0))
      .catch(() => setProfileCount(0));
    apiFetch("/astro/today/panchang")
      .then(setPanchang)
      .catch(() => {});
  }, []);

  const quickCards = [
    {
      title: "Daily Astrology",
      desc: "Today's cosmic insights by sun sign or birth chart",
      href: "/daily",
      gradient: "from-orange-500 to-amber-600",
      Icon: MdWbSunny,
    },
    {
      title: "Monthly Astrology",
      desc: "Plan the month ahead with celestial guidance",
      href: "/monthly",
      gradient: "from-blue-500 to-indigo-600",
      Icon: MdCalendarMonth,
    },
    {
      title: "Saved Profiles",
      desc:
        profileCount === null
          ? "Loading..."
          : `${profileCount} profile${profileCount !== 1 ? "s" : ""} saved`,
      href: "/profiles",
      gradient: "from-amber-500 to-yellow-600",
      Icon: MdPeople,
    },
    {
      title: "Sun Timings",
      desc: panchang
        ? `Sunrise: ${panchang.sunrise || "N/A"} • Sunset: ${panchang.sunset || "N/A"}`
        : "Loading sun timings...",
      href: "/panchang",
      gradient: "from-pink-500 to-rose-600",
      Icon: MdWbTwilight,
    },
  ];

  function InfoCard({ icon: Icon, iconColor, bgGradient, label, value, sub }) {
    return (
      <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${bgGradient}`}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        
        <div className="relative">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${iconColor} bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          
          {/* Content */}
          <div>
            <p className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">{label}</p>
            <p className="text-xl font-bold text-white leading-tight mb-1">{value}</p>
            {sub && <p className="text-xs text-white/70 font-medium">{sub}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <IoSparkles className="text-indigo-500" size={28} />
          Namaste, {user?.name}
        </h1>
        <p className="text-gray-500 mt-1 text-base">
          What would you like to explore today?
        </p>
      </div>

      {/* Quick cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {quickCards.map((c) => (
          <Link key={c.href} href={c.href}>
            <div
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${c.gradient} shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:bg-white/30 transition-all duration-300">
                  <c.Icon size={28} className="text-white" />
                </div>
                
                {/* Content */}
                <h3 className="font-bold text-xl text-white mb-2">{c.title}</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">{c.desc}</p>
                
                {/* Action */}
                <div className="flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  <span>Explore</span>
                  <MdChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Panchang */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <MdAutoAwesome className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Today&apos;s Panchang</h2>
            <p className="text-xs text-gray-500">Vedic daily elements for {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
        {!panchang ? (
          <div className="flex items-center justify-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500 font-medium">Loading panchang data...</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <InfoCard
              icon={MdCircle}
              iconColor="text-rose-500"
              bgGradient="bg-gradient-to-br from-rose-500 to-pink-600"
              label="Tithi"
              value={panchang.tithi?.name || "N/A"}
              sub={panchang.tithi?.percent_elapsed ? `${Math.round(panchang.tithi.percent_elapsed)}% elapsed` : ""}
            />
            <InfoCard
              icon={MdStar}
              iconColor="text-violet-500"
              bgGradient="bg-gradient-to-br from-violet-500 to-purple-600"
              label="Nakshatra"
              value={panchang.nakshatra?.name || "N/A"}
              sub={panchang.nakshatra?.percent_elapsed ? `${Math.round(panchang.nakshatra.percent_elapsed)}% elapsed` : ""}
            />
            <InfoCard
              icon={MdAutoAwesome}
              iconColor="text-amber-500"
              bgGradient="bg-gradient-to-br from-amber-500 to-orange-600"
              label="Yoga"
              value={panchang.yoga?.name || "N/A"}
              sub={panchang.yoga?.index ? `No. ${panchang.yoga.index}` : ""}
            />
            <InfoCard
              icon={MdWbTwilight}
              iconColor="text-teal-500"
              bgGradient="bg-gradient-to-br from-teal-500 to-cyan-600"
              label="Karana"
              value={panchang.karana?.name || "N/A"}
              sub={panchang.karana?.index ? `No. ${panchang.karana.index}` : ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}
