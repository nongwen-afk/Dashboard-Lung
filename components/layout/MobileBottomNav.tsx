/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { LayoutDashboard, MapPin, Bus, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "หน้าหลัก", href: "/" },
  { icon: Users, label: "คนขับ", href: "/drivers" },
  { icon: BarChart3, label: "วิเคราะห์", href: "/analytics" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <nav
      className="relative flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
        /* Safe area for home-indicator on iOS */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[0.125rem]"
        style={{
          background: "linear-gradient(90deg, #1e3a8a 0%, #1e40af 30%, #475569 70%, #0f172a 100%)",
        }}
      />

      <div className="flex items-stretch">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const currentPath = `${pathname}${hash}`;
          // Simple active check
          const isActive = href === "/" ? currentPath === "/" : currentPath.startsWith(href);

          return (
            <Link
              key={label}
              href={href}
              onClick={() => setHash(href.includes("#") ? `#${href.split("#")[1]}` : "")}
              className="mobile-nav-item relative overflow-hidden group flex-1 flex flex-col items-center justify-center"
              style={{
                color: isActive ? "#1e40af" : "#94a3b8",
                paddingTop: "10px",
                paddingBottom: "10px",
                textDecoration: "none",
              }}
            >
              {/* Active background glow */}
              {isActive && (
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)",
                  }}
                />
              )}
              {/* Active top indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-[0.125rem] rounded-full"
                  style={{
                    width: "28px",
                    background: "linear-gradient(90deg, #1e3a8a, #1e40af)",
                    boxShadow: "0 0 8px rgba(37,99,235,0.55)",
                  }}
                />
              )}
              {/* Hover bg */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />

              <Icon
                className="relative z-10 transition-transform duration-200 group-hover:scale-110"
                style={{ width: "20px", height: "20px", marginBottom: "4px" }}
              />
              <span className="relative z-10" style={{ fontSize: "9px", fontWeight: 600 }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
