"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdDashboard, MdWbSunny, MdCalendarMonth, MdPeople, MdLogout, MdMenu, MdClose, MdAutoAwesome } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { href: "/dashboard", icon: MdDashboard, label: "Dashboard" },
  { href: "/daily", icon: MdWbSunny, label: "Daily Astrology" },
  { href: "/monthly", icon: MdCalendarMonth, label: "Monthly Astrology" },
  { href: "/panchang", icon: MdAutoAwesome, label: "Panchang" },
  { href: "/profiles", icon: MdPeople, label: "Saved Profiles" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
            <p className="text-white/50 text-xs">Your cosmic guide</p>
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
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <MdClose size={20} /> : <MdMenu size={20} />}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Content />
      </aside>
    </>
  );
}
