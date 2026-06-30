import { BusCard } from "./BusCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { NextDeparture } from "@/components/timetable/NextDeparture";
import type { Route, Driver } from "@/types";

interface RouteSectionProps {
  route: Route;
  drivers: Driver[];
  lineNum: number;
  onShowTimetable?: () => void;
  expanded?: boolean;
}

export function RouteSection({ route, drivers, lineNum, onShowTimetable, expanded }: RouteSectionProps) {
  const activeCount = drivers.filter((d) => d.status !== "Leave").length;
  const leaveCount  = drivers.length - activeCount;

  return (
    <div
      className={`rounded-xl relative overflow-hidden transition-all duration-300 flex flex-col ${expanded ? "p-4 gap-3" : "p-2.5 gap-2"}`}
      style={{
        background: expanded
          ? "#ffffff"
          : "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,249,252,0.9))",
        border: expanded
          ? `1.5px solid ${route.color}20`
          : "1px solid rgba(255,255,255,0.9)",
        boxShadow: expanded
          ? `0 4px 16px ${route.color}12, 0 1px 4px rgba(26,26,46,0.06)`
          : "0 2px 8px rgba(26,26,46,0.06), inset 0 1px 0 rgba(255,255,255,1)",
      }}
    >
      {/* Left color accent bar */}
      <div
        className="absolute left-0 inset-y-3 w-[0.1875rem] rounded-r-full"
        style={{
          background: `linear-gradient(180deg, ${route.color}, ${route.color}99)`,
          boxShadow: `0 0 8px ${route.color}60`,
        }}
      />

      {/* Header */}
      <div className={`flex items-center gap-2 pl-2 ${expanded ? "" : "mb-0"}`}>
        <div
          className={`${expanded ? "w-11 h-11 text-lg" : "w-9 h-9 text-base"} rounded-md flex items-center justify-center font-bold text-white flex-shrink-0 relative overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
            boxShadow: `0 2px 8px ${route.color}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
          <span className="relative z-10">{lineNum}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${expanded ? "text-lg" : "text-base"} font-bold text-[#0f172a] leading-tight`}>
            {route.name}
          </p>
          {expanded && (
            <p className="text-sm text-gray-400 leading-tight">{route.labelTh}</p>
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
        {expanded && (
          <div className="flex gap-1 flex-shrink-0">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${route.color}18`, color: route.color }}
            >
              {activeCount} Active
            </span>
            {leaveCount > 0 && (
              <span className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(220,38,38,0.10)", color: "#dc2626" }}>
                {leaveCount} Leave
              </span>
            )}
          </div>
        )}
      </div>

      {/* Next departure */}
      <button
        onClick={onShowTimetable}
        className="w-full text-left rounded-lg -mx-1 px-1 transition-all duration-200"
        style={{ outline: "none" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = `${route.color}0a`;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 1px ${route.color}20`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        <NextDeparture routeId={route.id} color={route.color} />
      </button>

      {/* Bus driver list */}
      <div className={expanded ? "flex flex-col gap-1.5 flex-1" : "flex gap-1 flex-nowrap"}>
        {drivers.map((d) => (
          <BusCard key={d.id} driver={d} routeColor={route.color} expanded={expanded} />
        ))}
      </div>

      {/* Passenger load */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className={`${expanded ? "text-base" : "text-sm"} text-gray-400`}>
            Passenger Load
          </p>
          <p className={`${expanded ? "text-base" : "text-sm"} font-semibold`}
             style={{ color: route.color }}>
            {route.passengerLoad}%
          </p>
        </div>
        <ProgressBar value={route.passengerLoad} height={expanded ? "h-2" : "h-1.5"} />
      </div>
    </div>
  );
}
