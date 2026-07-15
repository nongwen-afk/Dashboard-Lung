"use client";

import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFleetStore } from "@/lib/store/fleetStore";
import type { ReserveDriver } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface ReserveDriverCardProps {
  driver: ReserveDriver;
  compact?: boolean;
}

export function ReserveDriverCard({ driver, compact: compactOverride }: ReserveDriverCardProps) {
  const { selectedReserve, setSelectedReserve, panelsCollapsed } = useFleetStore();
  const isSelected = selectedReserve?.id === driver.id;
  const isAssigned = driver.status === "Assigned";
  // In expanded (4-col) mode the card is compact; in normal mode it's the standard size
  const compact = compactOverride ?? panelsCollapsed;

  if (compact) {
    return (
      <button
        type="button"
        disabled={isAssigned}
        onClick={() => setSelectedReserve(isSelected ? null : driver)}
        className="min-h-[88px] rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55"
        style={
          isSelected && !isAssigned
            ? { background: "#eff6ff", borderColor: "#93c5fd" }
            : { background: "#ffffff", borderColor: "#e2e8f0" }
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{driver.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{driver.role || "ไม่พบรหัสพนักงาน"}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${isAssigned ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-700"}`}
          >
            {isAssigned ? "มอบหมายแล้ว" : "พร้อมใช้งาน"}
          </span>
        </div>
        <p className="mt-3 text-[13px] font-medium text-slate-600">
          CAP. <span className="font-bold text-slate-800">{driver.availability}%</span>
        </p>
      </button>
    );
  }

  return (
    <div
      onClick={() => !isAssigned && setSelectedReserve(isSelected ? null : driver)}
      className={cn(
        "rounded-xl transition-all duration-200 relative overflow-hidden",
        compact ? "p-2" : "p-2.5",
        isAssigned ? "cursor-not-allowed opacity-55" : "cursor-pointer"
      )}
      style={
        isSelected && !isAssigned
          ? {
              background: "linear-gradient(135deg, rgba(37,99,235,0.07), rgba(59,130,246,0.04))",
              border: "1.5px solid rgba(37,99,235,0.35)",
              boxShadow: "0 4px 16px rgba(37,99,235,0.14), inset 0 1px 0 rgba(255,255,255,0.9)",
            }
          : isAssigned
            ? {
                background: "rgba(248,249,252,0.7)",
                border: "1.5px solid rgba(26,26,46,0.07)",
                boxShadow: "0 1px 4px rgba(26,26,46,0.05)",
              }
            : {
                background: "linear-gradient(135deg, #ffffff, #f8fafc)",
                border: "1.5px solid rgba(226,232,240,0.9)",
                boxShadow: "0 4px 14px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)",
              }
      }
      onMouseEnter={(e) => {
        if (!isAssigned && !isSelected) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.boxShadow = "0 8px 24px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isAssigned && !isSelected) {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "0 4px 14px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)";
        }
      }}
    >
      {/* Selected glow overlay */}
      {isSelected && !isAssigned && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.05) 0%, transparent 60%)",
          }}
        />
      )}

      {/* Avatar */}
      <Avatar
        name={driver.name}
        size={compact ? "sm" : "md"}
        color="#f97316"
        className="mx-auto mb-1 relative z-10"
      />
      <p
        className={cn(
          "font-bold text-center text-[#0f172a] relative z-10",
          compact ? "text-[0.825rem]" : "text-[0.9rem]"
        )}
      >
        {driver.name}
      </p>
      <p
        className={cn(
          "text-gray-400 text-center relative z-10",
          compact ? "text-[0.675rem] mb-1" : "text-[0.75rem] mb-2"
        )}
      >
        {driver.role}
      </p>

      {/* Status */}
      <div className="mb-1.5 relative z-10">
        <span
          className="text-[0.675rem] font-bold px-2 py-0.5 rounded-full block text-center"
          style={
            isAssigned
              ? { background: "rgba(148,163,184,0.15)", color: "#94a3b8" }
              : {
                  background: "linear-gradient(135deg, rgba(22,163,74,0.14), rgba(21,128,61,0.09))",
                  color: "#16a34a",
                  border: "1px solid rgba(22,163,74,0.22)",
                }
          }
        >
          {isAssigned ? "Assigned" : "● Available"}
        </span>
      </div>

      {/* Capacity bar */}
      <p
        className={cn(
          "text-gray-500 mb-0.5 relative z-10",
          compact ? "text-[0.675rem]" : "text-[0.75rem]"
        )}
      >
        Cap: <span className="font-semibold">{driver.availability}%</span>
      </p>
      <ProgressBar value={driver.availability} height={compact ? "h-1" : "h-1.5"} />

      {/* Selected badge */}
      {isSelected && !isAssigned && (
        <div className="mt-2 flex items-center justify-center gap-1 relative z-10">
          <CheckCircle2 className="w-3 h-3 text-[#1e3a8a]" />
          <span className="text-[0.75rem] text-[#1e3a8a] font-bold">Selected</span>
        </div>
      )}
    </div>
  );
}
