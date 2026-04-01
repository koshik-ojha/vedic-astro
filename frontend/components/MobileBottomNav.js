"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard, MdWbSunny, MdCalendarMonth, MdPeople, MdAutoAwesome } from "react-icons/md";

const navItems = [
  { href: "/dashboard", icon: MdDashboard, label: "Home" },
  { href: "/daily", icon: MdWbSunny, label: "Daily" },
  { href: "/panchang", icon: MdAutoAwesome, label: "Panchang" },
  { href: "/monthly", icon: MdCalendarMonth, label: "Monthly" },
  { href: "/profiles", icon: MdPeople, label: "Profiles" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

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
