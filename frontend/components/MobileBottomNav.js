"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard, MdWbSunny, MdCalendarToday, MdCalendarMonth, MdPeople, MdAutoAwesome } from "react-icons/md";
import { useLanguage } from "../context/LanguageContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const navItems = [
    { href: "/dashboard", icon: MdDashboard, label: t("home") },
    { href: "/daily", icon: MdWbSunny, label: t("daily") },
    { href: "/weekly", icon: MdCalendarToday, label: t("weekly") },
    { href: "/panchang", icon: MdAutoAwesome, label: t("panchang") },
    { href: "/monthly", icon: MdCalendarMonth, label: t("monthly") },
    { href: "/profiles", icon: MdPeople, label: t("profiles") },
  ];

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-screen-sm mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={24} className={isActive ? "scale-110" : ""} />
              <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
