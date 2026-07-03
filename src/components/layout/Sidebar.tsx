"use client";

import {
  LayoutDashboard,
  Bus,
  Users,
  BarChart3,
  Settings,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/" },
  { icon: Users,           label: "คนขับ",      href: "/drivers" },
  { icon: BarChart3,       label: "วิเคราะห์",   href: "/analytics" },
  { icon: FlaskConical,    label: "Simulation", href: "/simulation" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    // Overriding pushState/replaceState to detect Next.js router hash changes just in case
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <aside
      className="w-[4.5rem] flex flex-col items-center py-3 gap-1 flex-shrink-0 relative"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
        boxShadow: "2px 0 28px rgba(0,0,0,0.35), inset -1px 0 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Decorative vertical glow line */}
      <div
        className="absolute right-0 inset-y-0 w-[0.0625rem]"
        style={{ background: "linear-gradient(180deg, transparent, rgba(37,99,235,0.30) 40%, rgba(71,85,105,0.25) 70%, transparent)" }}
      />

      {/* Logo */}
      <Link href="/">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
            boxShadow: "0 4px 16px rgba(37,99,235,0.40), inset 0 1px 0 rgba(255,255,255,0.20)",
          }}
        >
          <Bus className="w-6 h-6 text-white relative z-10 drop-shadow-sm" />
          <div
            className="absolute inset-0 rounded-xl"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)" }}
          />
        </div>
      </Link>

      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const currentPath = `${pathname}${hash}`;
        // Simple active check
        const isActive = href === "/" ? currentPath === "/" : currentPath.startsWith(href);

        return (
          <Link
            key={label}
            href={href}
            onClick={() => setHash(href.includes("#") ? `#${href.split("#")[1]}` : "")}
            className={cn(
              "relative w-[3.25rem] h-[3.25rem] rounded-xl flex flex-col items-center justify-center gap-1",
              "text-[0.5625rem] cursor-pointer group overflow-hidden",
              "transition-all duration-250"
            )}
            style={
              isActive
                ? {
                    background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(37,99,235,0.10))",
                    boxShadow: "0 2px 12px rgba(37,99,235,0.20), inset 0 1px 0 rgba(255,255,255,0.08)",
                    color: "#1e40af",
                  }
                : {
                    color: "#94a3b8",
                  }
            }
            title={label}
          >
            {/* Hover bg */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            {/* Active indicator */}
            {isActive && (
              <div
                className="absolute left-0 inset-y-3 w-0.5 rounded-r-full"
                style={{ background: "linear-gradient(180deg, #1e3a8a, #1e40af)", boxShadow: "0 0 8px rgba(37,99,235,0.60)" }}
              />
            )}
            <Icon className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:scale-110" />
            <span className="relative z-10 font-semibold">{label}</span>
          </Link>
        );
      })}

      {/* Divider */}
      <div className="mt-auto mb-1 w-8 h-[0.0625rem]" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* Settings */}
      <button
        className="relative w-[3.25rem] h-[3.25rem] rounded-xl flex flex-col items-center justify-center gap-1 text-[0.5625rem] text-[#94a3b8] group overflow-hidden transition-all duration-200"
        title="Settings"
        style={{ transition: "all 0.2s ease" }}
      >
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <Settings className="w-5 h-5 relative z-10 group-hover:rotate-45 transition-transform duration-500 group-hover:text-slate-300" />
        <span className="relative z-10 group-hover:text-slate-300 transition-colors">ตั้งค่า</span>
      </button>

      {/* Bottom glow dot */}
      <div
        className="w-1.5 h-1.5 rounded-full mb-1"
        style={{ background: "#16a34a", boxShadow: "0 0 8px rgba(22,163,74,0.60)" }}
      />
    </aside>
  );
}
