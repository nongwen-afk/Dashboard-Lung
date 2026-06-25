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
            : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,252,0.8))",
          border: "1px solid rgba(26,26,46,0.07)",
          boxShadow: "0 1px 4px rgba(26,26,46,0.05)",
        }}
        title={`${driver.name} ${driver.surname} (${driver.code}) — ${driver.vehicle}`}
        onMouseEnter={(e) => {
          if (!isLeave) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = `linear-gradient(135deg, rgba(255,255,255,1), ${routeColor}06)`;
            el.style.borderColor = `${routeColor}30`;
            el.style.boxShadow = `0 2px 8px ${routeColor}15`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isLeave) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.background = "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,252,0.8))";
            el.style.borderColor = "rgba(26,26,46,0.07)";
            el.style.boxShadow = "0 1px 4px rgba(26,26,46,0.05)";
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
          <p className="text-[11px] font-semibold text-[#0f172a] truncate leading-tight">
            {driver.name} {driver.surname}
          </p>
          <p className="text-[9px] text-gray-400 leading-tight">{driver.vehicle}</p>
        </div>
        {/* Status */}
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
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

  /* ─── NORMAL: compact card (unchanged) ─── */
  return (
    <div
      onClick={() => !isLeave && setFocusDriverId(driver.id)}
      className={cn(
        "rounded-lg p-1.5 min-w-[56px] cursor-pointer relative overflow-hidden",
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
          : {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,249,252,0.9))",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 6px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,1)",
            }
      }
      title={`${driver.name} ${driver.surname} (${driver.code}) — ${driver.vehicle}`}
      onMouseEnter={(e) => {
        if (!isLeave) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = `0 6px 16px ${routeColor}25, 0 2px 6px rgba(26,26,46,0.1), inset 0 1px 0 rgba(255,255,255,1)`;
          el.style.border = `1px solid ${routeColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isLeave) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 2px 6px rgba(26,26,46,0.07), inset 0 1px 0 rgba(255,255,255,1)";
          el.style.border = "1px solid rgba(255,255,255,0.9)";
        }
      }}
    >
      {!isLeave && (
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
          style={{ background: `linear-gradient(135deg, ${routeColor}08, ${routeColor}04)` }}
        />
      )}
      <div className="text-center text-base mb-1 relative z-10">🚌</div>
      <Avatar
        name={driver.name}
        size="xs"
        color={isLeave ? "#94a3b8" : routeColor}
        className="mx-auto mb-0.5 relative z-10"
      />
      <p className="text-[7px] text-center text-gray-500 truncate max-w-[52px] relative z-10">{driver.name}</p>
      <p className="text-[6px] text-center text-gray-400 relative z-10">{driver.vehicle}</p>
      {isLeave && (
        <p className="text-[6px] text-center font-bold relative z-10" style={{ color: "#dc2626" }}>
          LEAVE
        </p>
      )}
    </div>
  );
}
