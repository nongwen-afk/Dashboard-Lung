import { BusFront } from "lucide-react";
import { NextDeparture } from "@/components/timetable/NextDeparture";
import type { Route, Driver } from "@/types";

interface RouteSectionProps {
  route: Route;
  drivers: Driver[];
  lineNum: number;
  onShowTimetable?: () => void;
  onShowVehicles?: () => void;
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
  onShowVehicles,
  expanded,
}: RouteSectionProps) {
  const activeCount = drivers.filter((d) => d.status !== "Leave").length;
  const leaveCount = drivers.length - activeCount;
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
        <NextDeparture routeId={route.id} color={route.color} />
      </div>

      {/* Driver Summary Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
        <span className="text-[0.65rem] font-bold text-slate-500">
          {activeCount} vehicles active
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] text-slate-400 font-medium">Details</span>
          <button
            type="button"
            title={`ดูรถในสายนี้ ${drivers.length} คัน`}
            aria-label={`ดูรถใน${route.labelTh} ${drivers.length} คัน`}
            onClick={(event) => {
              event.stopPropagation();
              onShowVehicles?.();
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#1e3a8a] shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <BusFront className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e3a8a] px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
              {drivers.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
