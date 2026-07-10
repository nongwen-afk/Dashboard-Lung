import { useMemo } from "react";
import { BusCard } from "./BusCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NextDeparture } from "@/components/timetable/NextDeparture";
import { getAllDepartures } from "@/lib/mock-data/timetables";
import { getDriverForTrip } from "@/lib/shiftRotation";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import type { Route, Driver } from "@/types";

interface RouteSectionProps {
  route: Route;
  drivers: Driver[];
  lineNum: number;
  onShowTimetable?: () => void;
  expanded?: boolean;
}

const getRouteEnglishName = (id: string, fallback: string) => {
  if (id === "L1") return "Red Line";
  if (id === "L2") return "Blue Line";
  if (id === "L3") return "Green Line";
  return fallback;
};

export function RouteSection({
  route,
  drivers,
  lineNum,
  onShowTimetable,
  expanded,
}: RouteSectionProps) {
  const now = useCurrentTime(1000);

  const prevDeparture = useMemo(() => {
    const allDepts = getAllDepartures(route.id, now);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let latestPassed: { time: string; tripIndex: number } | null = null;
    for (let i = 0; i < allDepts.length; i++) {
      const d = allDepts[i];
      const [hStr, mStr] = d.time.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (h < currentHour || (h === currentHour && m <= currentMinute)) {
        latestPassed = { time: d.time, tripIndex: i };
      } else {
        break;
      }
    }
    return latestPassed;
  }, [route.id, now]);

  const prevDriver = prevDeparture
    ? getDriverForTrip(route.id, prevDeparture.tripIndex, now)
    : null;

  const activeCount = drivers.filter((d) => d.status !== "Leave").length;
  const leaveCount = drivers.length - activeCount;
  const passengerCount = Math.max(0, Math.min(20, Math.round((route.passengerLoad / 100) * 20)));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onShowTimetable}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onShowTimetable?.();
        }
      }}
      aria-label={`Open ${getRouteEnglishName(route.id, route.name)} timetable`}
      className={`group rounded-xl relative overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${expanded ? "p-4 gap-3" : "p-2.5 gap-2"}`}
      style={{
        background: expanded
          ? "#ffffff"
          : "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,249,252,0.9))",
        border: expanded ? `1.5px solid ${route.color}20` : "1px solid rgba(255,255,255,0.9)",
        boxShadow: expanded
          ? `0 4px 16px ${route.color}12, 0 1px 4px rgba(26,26,46,0.06)`
          : "0 2px 8px rgba(26,26,46,0.06), inset 0 1px 0 rgba(255,255,255,1)",
      }}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 inset-y-3 w-[0.1875rem] rounded-r-full transition-colors group-hover:bg-opacity-100"
        style={{
          background: `linear-gradient(180deg, ${route.color}, ${route.color}99)`,
          boxShadow: `0 0 8px ${route.color}60`,
        }}
      />

      {/* Header */}
      <div className={`flex items-start gap-2 pl-1 ${expanded ? "" : "mb-0"}`}>
        <div
          className={`${expanded ? "w-9 h-9 text-base mt-0.5" : "w-9 h-9 text-base"} rounded-md flex items-center justify-center font-bold text-white flex-shrink-0 relative overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
            boxShadow: `0 2px 8px ${route.color}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
            }}
          />
          <span className="relative z-10">{lineNum}</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-base font-bold text-[#0f172a] whitespace-nowrap leading-tight">
            {getRouteEnglishName(route.id, route.name)}
          </p>
          {expanded && (
            <p className="text-[0.7rem] text-gray-400 whitespace-nowrap leading-tight">
              {route.labelTh}
            </p>
          )}
          {expanded && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span
                className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${route.color}18`, color: route.color }}
              >
                {activeCount} Active
              </span>
              {leaveCount > 0 && (
                <span
                  className="text-[0.65rem] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(220,38,38,0.10)", color: "#dc2626" }}
                >
                  {leaveCount} Leave
                </span>
              )}
            </div>
          )}
        </div>
        {!expanded && (
          <span
            className="text-sm font-bold text-white px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${route.color}, ${route.color}dd)`,
              boxShadow: `0 1px 6px ${route.color}40`,
            }}
          >
            {route.labelTh}
          </span>
        )}
      </div>

      {/* Next departure */}
      <div className="w-full text-left mt-1">
        <NextDeparture routeId={route.id} color={route.color} now={now} />
      </div>

      {/* Passenger load */}
      <div className="w-full mt-auto flex flex-col pt-2 px-1">
        {prevDeparture ? (
          <div className="mb-2 flex items-center justify-between gap-2 text-xs font-medium text-slate-400">
            <span>รอบปัจจุบัน</span>
            <span className="tabular-nums font-semibold text-amber-600">
              รถ {prevDriver ? prevDriver.vehicle : "ไม่พบรถ"} · {prevDeparture.time}
            </span>
          </div>
        ) : (
          <div className="mb-2 text-xs font-medium text-slate-400 text-center">
            ยังไม่มีรอบปัจจุบัน
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-2">
            <div className="text-sm font-semibold leading-tight text-slate-500">Passenger Load</div>
            <div className="text-base font-bold text-amber-500 tabular-nums text-right whitespace-nowrap">
              {passengerCount}/20
            </div>
          </div>
          <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, route.passengerLoad)}%`,
                backgroundColor: "#f59e0b",
              }}
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-2 text-xs font-medium text-slate-400">
            <span className="truncate">ใช้งาน {passengerCount}</span>
            <span className="tabular-nums text-right whitespace-nowrap">
              ว่าง {20 - passengerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Driver Summary Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
        <span className="text-[0.65rem] font-bold text-slate-500">
          {activeCount} vehicles active
        </span>
        <span className="text-[0.65rem] text-slate-400 font-medium">Details</span>
      </div>
    </div>
  );
}
