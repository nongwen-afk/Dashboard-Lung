"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { Driver } from "@/types";
import { cn } from "@/lib/utils";

import { useFleetStore } from "@/store/fleetStore";

interface BusCardProps {
  driver: Driver;
  routeColor: string;
  expanded?: boolean;
}

export function BusCard({ driver, routeColor, expanded }: BusCardProps) {
  const isLeave = driver.status === "Leave";
  const isSubstitute = driver.status === "Substitute";
  const { setFocusDriverId } = useFleetStore();

  /* ─── EXPANDED: horizontal list-row style ─── */
  if (expanded) {
    return (
      <div
        onClick={() => !isLeave && setFocusDriverId(driver.id)}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-200 group cursor-pointer",
          isLeave && "opacity-50"
        )}
        style={{
          background: isLeave
            ? "rgba(248,249,252,0.6)"
            : isSubstitute
            ? `${routeColor}10`
            : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,252,0.8))",
          border: `1px solid ${isSubstitute ? `${routeColor}30` : "rgba(26,26,46,0.07)"}`,
          boxShadow: isSubstitute ? `0 1px 4px ${routeColor}10` : "0 1px 4px rgba(26,26,46,0.05)",
        }}
        title={`${driver.name} ${driver.surname} (${driver.code}) — ${driver.vehicle}${isSubstitute ? ' (ตัวแทน)' : ''}`}
        onMouseEnter={(e) => {
          if (!isLeave) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = isSubstitute ? `${routeColor}20` : `linear-gradient(135deg, rgba(255,255,255,1), ${routeColor}06)`;
            el.style.borderColor = `${routeColor}40`;
            el.style.boxShadow = `0 2px 8px ${routeColor}20`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isLeave) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = isSubstitute ? `${routeColor}10` : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,252,0.8))";
            el.style.borderColor = isSubstitute ? `${routeColor}30` : "rgba(26,26,46,0.07)";
            el.style.boxShadow = isSubstitute ? `0 1px 4px ${routeColor}10` : "0 1px 4px rgba(26,26,46,0.05)";
          }
        }}
      >
        {/* Route color dot */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: routeColor, boxShadow: `0 0 4px ${routeColor}80` }}
        />
        <Avatar
          name={driver.name}
          size="xs"
          color={isLeave ? "#94a3b8" : routeColor}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-[#0f172a] truncate leading-tight">
            {driver.name} {driver.surname}
          </p>
          <p className="text-sm text-gray-400 leading-tight">{driver.vehicle}</p>
        </div>
        {/* Status */}
        <span
          className="text-[0.78rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={
            isLeave
              ? { background: "rgba(220,38,38,0.10)", color: "#dc2626" }
              : { background: `${routeColor}18`, color: routeColor }
          }
        >
          {isLeave ? "LEAVE" : "ON"}
        </span>
      </div>
    );
  }

  /* ─── NORMAL: compact card (unchanged mostly, with substitute support) ─── */
  return (
    <div
      onClick={() => !isLeave && setFocusDriverId(driver.id)}
      className={cn(
        "rounded-lg p-1.5 min-w-[5.4rem] cursor-pointer relative overflow-hidden",
        "transition-all duration-200 group",
        isLeave ? "opacity-55" : ""
      )}
      style={
        isLeave
          ? {
              background: "rgba(248,249,252,0.8)",
              border: "1px solid rgba(26,26,46,0.07)",
              boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
            }
          : isSubstitute
          ? {
              background: `${routeColor}10`,
              border: `1px solid ${routeColor}30`,
              boxShadow: `0 1px 4px ${routeColor}10`,
            }
          : {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 6px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,1)",
            }
      }
      title={`${driver.name} ${driver.surname} (${driver.code}) — ${driver.vehicle}${isSubstitute ? ' (ตัวแทน)' : ''}`}
      onMouseEnter={(e) => {
        if (!isLeave) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = `0 6px 16px ${routeColor}25, 0 2px 6px rgba(26,26,46,0.1), inset 0 1px 0 rgba(255,255,255,1)`;
          el.style.border = `1px solid ${routeColor}40`;
          if (isSubstitute) el.style.background = `${routeColor}20`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isLeave) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = isSubstitute ? `0 1px 4px ${routeColor}10` : "0 2px 6px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,1)";
          el.style.border = isSubstitute ? `1px solid ${routeColor}30` : "1px solid rgba(255,255,255,0.9)";
          if (isSubstitute) el.style.background = `${routeColor}10`;
        }
      }}
    >
      {!isLeave && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
          style={{ background: `linear-gradient(135deg, ${routeColor}08, ${routeColor}04)` }}
        />
      )}
      <div className="text-center text-lg mb-1 relative z-10">🚌</div>
      <Avatar
        name={driver.name}
        size="xs"
        color={isLeave ? "#94a3b8" : routeColor}
        className="mx-auto mb-0.5 relative z-10"
      />
      <p className="text-[0.78rem] text-center text-gray-500 truncate max-w-[4.8rem] mx-auto relative z-10">{driver.name}</p>
      <p className="text-[0.66rem] text-center text-gray-400 relative z-10">{driver.vehicle}</p>
      {isLeave && (
        <p className="text-[0.66rem] text-center font-bold relative z-10" style={{ color: "#dc2626" }}>
          LEAVE
        </p>
      )}
      {isSubstitute && (
        <p className="text-[0.66rem] text-center font-bold relative z-10 mt-0.5" style={{ color: routeColor }}>
          ตัวแทน
        </p>
      )}
    </div>
  );
}
