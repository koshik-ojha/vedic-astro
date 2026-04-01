"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard, MdWbSunny, MdCalendarMonth, MdCalendarToday, MdPeople, MdLogout, MdMenu, MdClose, MdAutoAwesome } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  
  const navItems = [
    { href: "/dashboard", icon: MdDashboard, label: t("dashboard") },
    { href: "/daily", icon: MdWbSunny, label: t("dailyHoroscope") },
    { href: "/weekly", icon: MdCalendarToday, label: t("weeklyHoroscope") },
    { href: "/monthly", icon: MdCalendarMonth, label: t("monthlyHoroscope") },
    { href: "/panchang", icon: MdAutoAwesome, label: t("panchang") },
    { href: "/vedic-panchang", icon: IoSparkles, label: t("vedicPanchang") },
    { href: "/profiles", icon: MdPeople, label: t("savedProfiles") },
  ];

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const Content = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <IoSparkles size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Vedic Astro</p>
            <p className="text-white/50 text-xs">{t("yourCosmicGuide")}</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-4 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/45 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/65 hover:bg-white/10 hover:text-white transition-all text-sm"
        >
          <MdLogout size={18} />
          {t("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar panel - Hidden on mobile (using bottom nav instead) */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-64 z-40 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900">
        <Content />
      </aside>
    </>
  );
}
