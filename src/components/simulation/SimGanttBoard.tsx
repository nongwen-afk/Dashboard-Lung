"use client";

import { useRef, useState, useCallback, useMemo, useEffect } from "react";
import {
  ROUTE_META,
  minToTime,
  isRushHour,
  type MultiRouteSimResult,
  type RouteKey,
  type TripAssignment,
  type BreakEvent,
  type DriverShift,
} from "@/lib/simulationEngine";

interface Props {
  multiResult: MultiRouteSimResult;
  tripDurations: Record<RouteKey, number>;
  otThresholdHours: number;
  activeView: "all" | "green" | "blue" | "red";
  showBreaks: boolean;
  showOverlap: boolean;
  showIdle: boolean;
}

// ── Layout constants ──────────────────────────────────────────────────
const GANTT_START = 5 * 60 + 30; // 05:30
const GANTT_END   = 22 * 60;     // 22:00
const TOTAL_MINS  = GANTT_END - GANTT_START;
const PX_PER_MIN  = 3.4;
const MIN_COL_W   = 80;
const TIME_COL_W  = 52;
const SEP_W       = 10;       // route separator width
const TOTAL_H     = TOTAL_MINS * PX_PER_MIN;
const HOUR_MARKS  = Array.from({ length: 17 }, (_, i) => i + 5); // 5:00 to 21:00

const RUSH_ZONES = [
  { s: 6 * 60 + 30, e: 9 * 60, label: "Rush AM" },
  { s: 16 * 60,     e: 19 * 60, label: "Rush PM" },
];

function minToPx(m: number) { return (m - GANTT_START) * PX_PER_MIN; }

// ── Tooltip types ─────────────────────────────────────────────────────
type TooltipData =
  | { kind: "trip"; trip: TripAssignment; driver: DriverShift; route: RouteKey; x: number; y: number }
  | { kind: "break"; brk: BreakEvent; driver: DriverShift; route: RouteKey; x: number; y: number };

// ── RouteGroup layout helper ──────────────────────────────────────────
function computeLayout(multiResult: MultiRouteSimResult, activeView: string, containerWidth: number) {
  const groups: Array<{ route: RouteKey; left: number; drivers: DriverShift[]; colW: number }> = [];
  let x = TIME_COL_W;

  const routes = activeView === "all" ? ["green", "blue", "red"] as RouteKey[] : [activeView as RouteKey];

  // Calculate total drivers to divide space evenly
  let totalDrivers = 0;
  for (const route of routes) {
    totalDrivers += Math.max(1, multiResult[route].drivers.filter(d => d.trips.length > 0).length);
  }

  // Determine dynamic column width
  let colW = MIN_COL_W;
  if (containerWidth > 0 && totalDrivers > 0) {
    const availableWidth = containerWidth - TIME_COL_W - (routes.length * SEP_W);
    const dynamicW = Math.floor(availableWidth / totalDrivers);
    
    if (activeView === "all") {
      // Allow shrinking to fit the screen, with an absolute minimum of 45px
      colW = Math.max(45, dynamicW);
    } else {
      // For single view, we want it to be at least MIN_COL_W, but expand if there's space
      colW = Math.max(MIN_COL_W, dynamicW);
    }
  }

  for (const route of routes) {
    const drivers = multiResult[route].drivers.filter(d => d.trips.length > 0);
    groups.push({ route, left: x, drivers, colW });
    x += Math.max(1, drivers.length) * colW + SEP_W;
  }

  return { groups, totalWidth: x };
}

export function SimGanttBoard({ multiResult, tripDurations, otThresholdHours, activeView, showBreaks, showOverlap, showIdle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  // Track container width for dynamic columns
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { groups, totalWidth } = useMemo(() => computeLayout(multiResult, activeView, containerWidth), [multiResult, activeView, containerWidth]);
  const otThresholdMin = otThresholdHours * 60;

  const showTripTooltip = useCallback((trip: TripAssignment, driver: DriverShift, route: RouteKey, e: React.MouseEvent) => {
    setTooltip({ kind: "trip", trip, driver, route, x: e.clientX, y: e.clientY });
  }, []);

  const showBreakTooltip = useCallback((brk: BreakEvent, driver: DriverShift, route: RouteKey, e: React.MouseEvent) => {
    setTooltip({ kind: "break", brk, driver, route, x: e.clientX, y: e.clientY });
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto relative select-none bg-white"
    >
      {/* ── Sticky column headers ── */}
      <div
        className="sticky top-0 z-30 flex bg-white border-b border-slate-200"
        style={{
          minWidth: totalWidth,
        }}
      >
        {/* Time corner */}
        <div
          className="flex-shrink-0 sticky left-0 z-40 flex items-center justify-center text-[0.45rem] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border-r border-slate-200"
          style={{
            width: TIME_COL_W,
            height: 72,
          }}
        >
          เวลา
        </div>

        {/* Route group headers */}
        {groups.map(({ route, left, drivers, colW }) => {
          const meta = ROUTE_META[route];
          const result = multiResult[route];
          return (
            <div
              key={route}
              className="flex-shrink-0"
              style={{ width: Math.max(1, drivers.length) * colW + SEP_W }}
            >
              {/* Route label bar */}
              <div
                className="flex items-center justify-between px-2 py-1"
                style={{
                  background: `${meta.bgColor}`,
                  borderBottom: `2px solid ${meta.color}55`,
                  borderRight: `1px solid #e2e8f0`,
                  height: 28,
                }}
              >
                <span className="text-[0.5625rem] font-black" style={{ color: meta.color }}>
                  {meta.label}
                </span>
                <span className="text-[0.45rem] font-semibold" style={{ color: meta.color }}>
                  {result.totalTrips}รอบ · ครอบ{result.coverageRate.toFixed(0)}%
                </span>
              </div>

              {/* Driver column headers */}
              <div className="flex" style={{ height: 44 }}>
                {drivers.length === 0 ? (
                  <div
                    className="flex items-center justify-center text-[0.45rem] text-slate-600 italic"
                    style={{ width: colW }}
                  >
                    ไม่มีคนขับ
                  </div>
                ) : (
                  drivers.map(driver => (
                    <div
                      key={driver.driverIndex}
                      className="flex-shrink-0 flex items-center justify-center border-r border-slate-100 relative"
                      style={{ width: colW }}
                    >
                      <p className="text-[0.65rem] font-bold text-slate-700 leading-none w-full text-center truncate px-1" title={driver.name}>
                        {driver.name}
                      </p>
                      {/* Colored line indicating route */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1" 
                        style={{ background: meta.color, opacity: 0.8 }} 
                      />
                    </div>
                  ))
                )}
                {/* Separator space */}
                <div style={{ width: SEP_W }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Canvas ── */}
      <div
        className="relative"
        style={{ width: totalWidth, height: TOTAL_H + 24 }}
        onMouseLeave={hideTooltip}
      >
        {/* Rush hour background zones */}
        {RUSH_ZONES.map((zone, zi) => {
          const top = minToPx(zone.s);
          const h = (zone.e - zone.s) * PX_PER_MIN;
          return (
            <div
              key={zi}
              className="absolute pointer-events-none"
              style={{ left: TIME_COL_W, right: 0, top, height: h, background: "rgba(239,68,68,0.04)", borderTop: "1px dashed rgba(239,68,68,0.18)", borderBottom: "1px dashed rgba(239,68,68,0.18)", zIndex: 1 }}
            >
              <span className="absolute right-2 top-1 text-[0.4rem] font-black uppercase tracking-widest" style={{ color: "rgba(239,68,68,0.4)" }}>{zone.label}</span>
            </div>
          );
        })}

        {/* Hour grid + time labels */}
        {HOUR_MARKS.map(h => {
          const top = minToPx(h * 60);
          if (top < 0 || top > TOTAL_H) return null;
          return (
            <div key={h} className="absolute pointer-events-none" style={{ left: 0, right: 0, top, zIndex: 2 }}>
              <div className="absolute" style={{ left: TIME_COL_W, right: 0, height: 1, background: h % 2 === 0 ? "#cbd5e1" : "#f1f5f9" }} />
              {/* Sticky-left time label */}
              <div className="absolute flex items-center justify-end pr-2 bg-slate-50" style={{ left: 0, width: TIME_COL_W, top: -9, height: 18 }}>
                <span className="text-[0.5rem] font-bold tabular-nums" style={{ color: h % 2 === 0 ? "#475569" : "#94a3b8" }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            </div>
          );
        })}

        {/* Route groups */}
        {groups.map(({ route, left, drivers, colW }) => {
          const meta = ROUTE_META[route];
          const result = multiResult[route];
          const routeWidth = Math.max(1, drivers.length) * colW;

          return (
            <div key={route}>
              {/* Route background tint */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left, width: routeWidth, background: `${meta.color}06`, zIndex: 0 }}
              />
              {/* Route right separator */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: left + routeWidth, width: SEP_W, background: "#f8fafc", borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", zIndex: 5 }}
              />

              {/* Driver columns */}
              {drivers.map((driver, di) => {
                const colLeft = left + di * colW;
                const otStartMin = driver.startMin + otThresholdMin;
                const routeTripDuration = tripDurations[route];

                return (
                  <div key={driver.driverIndex} className="absolute top-0 bottom-0" style={{ left: colLeft, width: colW, zIndex: 3 }}>
                    {/* Alternating col bg */}
                    <div className="absolute inset-0 pointer-events-none" style={{ background: di % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)", borderRight: "1px solid rgba(0,0,0,0.04)" }} />

                    {/* OT zone overlay */}
                    {driver.trips.length > 0 && otStartMin < driver.endMin && driver.offShiftMin === undefined && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: 4, right: 4, top: minToPx(otStartMin), height: Math.max(0, (driver.endMin - otStartMin) * PX_PER_MIN), background: "rgba(249,115,22,0.07)", borderTop: "1.5px dashed rgba(249,115,22,0.5)", borderRadius: "0 0 4px 4px", zIndex: 0 }}
                      >
                        <span className="absolute top-0.5 left-1 text-[0.4rem] font-black" style={{ color: "rgba(251,146,60,0.7)" }}>OT</span>
                      </div>
                    )}

                    {/* Off-shift block (Red "สิ้นสุดงาน") */}
                    {driver.offShiftMin !== undefined && driver.trips.length > 0 && (
                      <div
                        className="absolute rounded-md cursor-pointer z-20 flex items-start justify-center pt-2"
                        style={{ 
                           left: 5, right: 5, 
                           top: minToPx(driver.offShiftMin), 
                           height: Math.max(20, (GANTT_END - driver.offShiftMin) * PX_PER_MIN), 
                           background: "linear-gradient(135deg, #f87171, #ef4444)", 
                           border: "1px solid rgba(255,255,255,0.6)", 
                           borderRadius: '6px', 
                           boxShadow: "0 4px 10px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
                           overflow: "hidden"
                        }}
                      >
                        <span className="text-[0.4rem] font-black text-center text-white" style={{ lineHeight: 1.2 }}>
                          สิ้นสุดงาน<br/>{minToTime(driver.offShiftMin)}
                        </span>
                      </div>
                    )}

                    {/* Work span */}
                    {driver.trips.length > 0 && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: 5, right: 5, top: minToPx(driver.startMin), height: (driver.endMin - driver.startMin) * PX_PER_MIN, background: `${meta.color}08`, borderLeft: `1.5px solid ${meta.color}20`, borderRight: `1.5px solid ${meta.color}20` }}
                      />
                    )}

                    {/* Trip blocks */}
                    {driver.trips.map(trip => {
                      const top = minToPx(trip.departureMin);
                      const h = Math.max(8, routeTripDuration * PX_PER_MIN - 2);
                      if (top < 0) return null;
                      const ot = trip.isOT;
                      const rush = trip.isRushHour;
                      const isOvlp = trip.isOverlapping && showOverlap;
                      return (
                        <div
                          key={trip.tripIndex}
                          className="absolute rounded-md cursor-pointer hover:z-20 hover:brightness-125 transition-all duration-100"
                          style={{
                            left: 5, right: 5, top, height: h,
                            background: isOvlp
                              ? "repeating-linear-gradient(45deg, #fef2f2, #fef2f2 4px, #fecaca 4px, #fecaca 8px)"
                              : ot
                              ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                              : rush
                              ? `linear-gradient(135deg, ${meta.color}ee, ${meta.color}cc)`
                              : `linear-gradient(135deg, ${meta.color}cc, ${meta.color}99)`,
                            border: isOvlp ? `1.5px dashed #ef4444` : `1px solid rgba(255,255,255,0.4)`,
                            borderRadius: '6px',
                            boxShadow: isOvlp
                              ? "0 0 12px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255,255,255,0.6)"
                              : ot 
                              ? "0 4px 10px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255,255,255,0.6)"
                              : rush
                              ? `0 4px 10px ${meta.color}55, inset 0 1px 0 rgba(255,255,255,0.5)`
                              : `0 2px 6px ${meta.color}22, inset 0 1px 0 rgba(255,255,255,0.4)`,
                            zIndex: isOvlp ? 20 : 10,
                            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                          }}
                          onMouseEnter={e => showTripTooltip(trip, driver, route, e)}
                          onMouseLeave={hideTooltip}
                        >
                          {h > 14 && (
                            <span className="text-[0.4rem] font-black text-white drop-shadow-sm text-center px-0.5" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)", lineHeight: 1.2 }}>
                              {minToTime(trip.departureMin)}
                              {ot && <span className="block text-[0.35rem] opacity-80">OT</span>}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Break blocks */}
                    {showBreaks && driver.breaks.map((brk, bi) => {
                      const top = minToPx(brk.startMin);
                      const h = (brk.endMin - brk.startMin) * PX_PER_MIN - 2;
                      if (top < 0 || h <= 0) return null;
                      return (
                        <div
                          key={`b${bi}`}
                          className="absolute rounded-md cursor-pointer z-20"
                          style={{ left: 5, right: 5, top, height: h, background: "linear-gradient(135deg, #fef08a, #facc15)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: '6px', boxShadow: "0 4px 10px rgba(250,204,21,0.3), inset 0 1px 0 rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                          onMouseEnter={e => showBreakTooltip(brk, driver, route, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <span className="text-[0.4rem] font-black text-center px-0.5" style={{ color: "#78350f", lineHeight: 1.2 }}>พัก{"\n"}30 นาที</span>
                        </div>
                      );
                    })}

                    {/* Idle gap indicators */}
                    {showIdle && driver.trips.length > 1 && driver.trips.slice(0, -1).map((trip, ti) => {
                      const nextTrip = driver.trips[ti + 1];
                      const idleStart = trip.departureMin + tripDurations[route];
                      const idleEnd = nextTrip.departureMin;
                      const idleDur = idleEnd - idleStart;
                      if (idleDur <= 0) return null;
                      const top = minToPx(idleStart);
                      const h = idleDur * PX_PER_MIN;
                      if (h < 4) return null;
                      return (
                        <div
                          key={`idle${ti}`}
                          className="absolute pointer-events-none"
                          style={{ left: 5, right: 5, top, height: h, background: "repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(148,163,184,0.12) 3px,rgba(148,163,184,0.12) 6px)", border: "1px dashed rgba(148,163,184,0.35)", borderRadius: 4, zIndex: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {h > 20 && <span className="text-[0.35rem] text-slate-400 font-bold">รอ {idleDur}น.</span>}
                        </div>
                      );
                    })}

                    {/* OT start line */}
                    {driver.trips.length > 0 && otStartMin >= driver.startMin && otStartMin <= driver.endMin && (
                      <div
                        className="absolute pointer-events-none"
                        style={{ left: 0, right: 0, top: minToPx(otStartMin), height: 2, background: "linear-gradient(90deg,transparent,rgba(249,115,22,0.85),transparent)", zIndex: 25 }}
                      />
                    )}
                  </div>
                );
              })}

              {/* "No driver" placeholder column */}
              {drivers.length === 0 && (
                <div
                  className="absolute flex items-center justify-center text-[0.5rem] text-slate-700 italic"
                  style={{ left, width: colW, top: 0, bottom: 0 }}
                >
                  ลากคนขับ<br/>มาที่สายนี้
                </div>
              )}
            </div>
          );
        })}

        {/* Now line */}
        {(() => {
          const now = new Date();
          const nowMin = now.getHours() * 60 + now.getMinutes();
          if (nowMin < GANTT_START || nowMin > GANTT_END) return null;
          const top = minToPx(nowMin);
          return (
            <div className="absolute pointer-events-none" style={{ left: TIME_COL_W, right: 0, top, height: 2, background: "#22d3ee", boxShadow: "0 0 8px rgba(34,211,238,0.7)", zIndex: 50 }}>
              <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 6px rgba(34,211,238,0.9)" }} />
            </div>
          );
        })()}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-[200] rounded-xl px-3 py-2.5 bg-white border border-slate-200 shadow-xl"
          style={{
            left: Math.min(tooltip.x + 16, window.innerWidth - 200),
            top: Math.max(8, tooltip.y - 80),
            minWidth: 175,
          }}
        >
          {tooltip.kind === "trip" && (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: tooltip.trip.isOT ? "#f59e0b" : ROUTE_META[tooltip.route].color }} />
                <p className="text-[0.625rem] font-black text-slate-800">{tooltip.driver.name}</p>
                <span className="text-[0.45rem] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${ROUTE_META[tooltip.route].color}22`, color: ROUTE_META[tooltip.route].color }}>
                  {ROUTE_META[tooltip.route].label}
                </span>
              </div>
              <p className="text-[0.5625rem] text-slate-500 font-bold">รอบที่ {tooltip.trip.tripIndex + 1}</p>
              <p className="text-[0.5625rem] text-slate-600 mt-0.5">{minToTime(tooltip.trip.departureMin)} → {minToTime(tooltip.trip.departureMin + tripDurations[tooltip.route])}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {tooltip.trip.isOverlapping && <span className="px-1.5 py-0.5 rounded text-[0.45rem] font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px dashed #ef4444" }}>เวลาทับซ้อน</span>}
                {tooltip.trip.isRushHour && <span className="px-1.5 py-0.5 rounded text-[0.45rem] font-black" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>RUSH</span>}
                {tooltip.trip.isOT && <span className="px-1.5 py-0.5 rounded text-[0.45rem] font-black" style={{ background: "rgba(245,158,11,0.15)", color: "#d97706" }}>OT</span>}
              </div>
            </>
          )}
          {tooltip.kind === "break" && (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <p className="text-[0.625rem] font-black text-slate-800">{tooltip.driver.name}</p>
              </div>
              <p className="text-[0.5625rem] font-bold text-yellow-600">เวลาพัก 30 นาที</p>
              <p className="text-[0.5625rem] text-slate-600 mt-0.5">{minToTime(tooltip.brk.startMin)} → {minToTime(tooltip.brk.endMin)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
