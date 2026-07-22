"use client";

import { useState, useMemo } from "react";
import { RouteSection } from "./RouteSection";
import { RouteVehiclesDialog } from "./RouteVehiclesDialog";
import { TimetableView } from "@/components/timetable/TimetableView";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useOperationalFleet } from "@/hooks/useOperationalFleet";

import type { RouteId } from "@/types";
import { CalendarClock, Activity, Maximize } from "lucide-react";
import { PanelToggleButton } from "@/components/ui/PanelToggleButton";

export function RouteOverviewPanel() {
  const routes = useFleetStore((state) => state.routes);
  const baseDrivers = useFleetStore((state) => state.drivers);
  const { panelsCollapsed, mapOnly, toggleMapOnly } = useFleetStore();
  const { assignments, tripsByRoute, date, isLive, isPast, now } = useOperationalFleet();
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableRoute, setTimetableRoute] = useState<RouteId>("L1");
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [vehiclesRoute, setVehiclesRoute] = useState<RouteId>("L1");

  const dailyDrivers = useMemo(
    () =>
      assignments.map(
        ({ driver, vehicle, capacity, status, operatingRouteId, operationalState }) => ({
          ...driver,
          vehicle,
          capacity,
          status,
          routeId: operatingRouteId,
          operationalState,
        })
      ),
    [assignments]
  );

  const byRoute: Record<string, typeof dailyDrivers> = {
    L1: dailyDrivers.filter(
      (driver) => driver.routeId === "L1" && driver.operationalState !== "unavailable"
    ),
    L2: dailyDrivers.filter(
      (driver) => driver.routeId === "L2" && driver.operationalState !== "unavailable"
    ),
    L3: dailyDrivers.filter(
      (driver) => driver.routeId === "L3" && driver.operationalState !== "unavailable"
    ),
  };

  const totalActive = dailyDrivers.filter(
    (driver) => driver.status !== "Leave" && driver.operationalState !== "unavailable"
  ).length;
  const totalLeave = dailyDrivers.filter((driver) => driver.status === "Leave").length;

  const totalPassed = useMemo(() => {
    if (!isLive) return 0;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return Object.values(tripsByRoute)
      .flat()
      .filter((trip) => {
        const [hour, minute] = trip.time.split(":").map(Number);
        return hour * 60 + minute <= currentMinutes;
      }).length;
  }, [isLive, now, tripsByRoute]);

  const totalTrips = useMemo(
    () => Object.values(tripsByRoute).reduce((total, trips) => total + trips.length, 0),
    [tripsByRoute]
  );
  const remainingTrips = Math.max(0, totalTrips - totalPassed);
  const progressPercent = totalTrips > 0 ? (totalPassed / totalTrips) * 100 : 0;

  const openTimetable = (routeId: RouteId) => {
    setTimetableRoute(routeId);
    setTimetableOpen(true);
  };

  const openVehicles = (routeId: RouteId) => {
    setVehiclesRoute(routeId);
    setVehiclesOpen(true);
  };

  return (
    <>
      <div
        className="hidden md:block absolute overflow-y-auto"
        style={{
          padding: 12,
          left: panelsCollapsed ? 0 : 12,
          top: panelsCollapsed ? 0 : 12,
          bottom: panelsCollapsed ? 0 : 12,
          width: panelsCollapsed ? "50%" : "var(--left-panel-width)",
          borderRadius: panelsCollapsed ? "0px 16px 16px 0px" : "16px 16px 16px 16px",
          transform: mapOnly ? "translateX(-120%)" : "translateX(0)",
          opacity: mapOnly ? 0 : 1,
          pointerEvents: mapOnly ? "none" : "auto",
          /* Fully opaque when covering the map; glass when overlaid on map */
          background: panelsCollapsed ? "#ffffff" : "rgba(255,255,255,0.95)",
          backdropFilter: panelsCollapsed ? "none" : "blur(20px) saturate(180%)",
          WebkitBackdropFilter: panelsCollapsed ? "none" : "blur(20px) saturate(180%)",
          border: panelsCollapsed ? "none" : "1px solid rgba(255,255,255,0.7)",
          borderRight: panelsCollapsed ? "1px solid rgba(26,26,46,0.08)" : undefined,
          boxShadow: panelsCollapsed
            ? "4px 0 24px rgba(26,26,46,0.10)"
            : "0 8px 32px rgba(26,26,46,0.14), 0 2px 8px rgba(26,26,46,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          zIndex: 800,
          transition:
            "left 0.5s cubic-bezier(0.4,0,0.2,1), top 0.5s cubic-bezier(0.4,0,0.2,1), bottom 0.5s cubic-bezier(0.4,0,0.2,1), width 0.5s cubic-bezier(0.4,0,0.2,1), border-radius 0.5s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Decorative top gradient bar */}
        <div
          className="absolute inset-x-0 top-0 h-[0.1875rem] rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, #1e3a8a, #1e40af, #475569)" }}
        />

        {/* Header */}
        <div
          className="sticky top-[-12px] z-20 flex items-center justify-between -mx-3 px-3 pt-4 pb-3 mb-4 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm"
          style={{ marginTop: -12 }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0f172a, #1e293b)",
                boxShadow: "0 2px 8px rgba(15,23,42,0.35)",
              }}
            >
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p
                className={`${panelsCollapsed ? "text-xl" : "text-lg"} font-bold text-[#0f172a] transition-all duration-500`}
              >
                Active Routes Overview
              </p>
              <p className="text-sm text-gray-400">ภาพรวมเส้นทางที่ใช้งานอยู่</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMapOnly}
              title="ซ่อนหน้าต่าง (Map Only)"
              className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 group"
              style={{ background: "rgba(37,99,235,0.07)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.14)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 2px 8px rgba(37,99,235,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.07)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <Maximize className="w-4 h-4 text-[#1e3a8a]" />
            </button>
            <PanelToggleButton />
            <button
              onClick={() => openTimetable("L1")}
              title="ดูตารางเวลาเดินรถทั้งหมด"
              className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 group"
              style={{ background: "rgba(37,99,235,0.07)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.14)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 2px 8px rgba(37,99,235,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(37,99,235,0.07)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              <CalendarClock className="w-4 h-4 text-[#1e3a8a]" />
            </button>
          </div>
        </div>

        {/* Stats bar — only in expanded mode */}
        {panelsCollapsed && (
          <div className="flex gap-2 mb-3">
            {[
              { label: "Routes", value: routes.length, color: "#0f172a" },
              { label: "Active", value: totalActive, color: "#16a34a" },
              { label: "On Leave", value: totalLeave, color: "#dc2626" },
              { label: "Total", value: baseDrivers.length, color: "#1e3a8a" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-lg px-2 py-1.5 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(26,26,46,0.04), rgba(26,26,46,0.02))",
                  border: "1px solid rgba(26,26,46,0.05)",
                }}
              >
                <p className="text-2xl font-extrabold leading-tight" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="text-sm text-gray-400 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Total Trips Summary */}
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between font-bold text-[#0f172a]">
            <span>{isLive ? "รอบวิ่งรวมวันนี้" : "รอบวิ่งตามแผน"}</span>
            <span className="text-[#1e3a8a]">
              {totalPassed}/{totalTrips}
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-400">
            <span>{isLive ? `ผ่านแล้ว ${totalPassed}` : `กำหนด ${totalTrips} รอบ`}</span>
            <span>
              {isLive ? `เหลือ ${remainingTrips}` : isPast ? "ไม่มีข้อมูลจริง" : "ยังไม่เริ่ม"}
            </span>
          </div>
        </div>

        {/* Routes list — stack when collapsed=false, 3-column grid when collapsed=true */}
        <div
          className={panelsCollapsed ? "grid grid-cols-3 gap-3 items-start" : "flex flex-col gap-3"}
        >
          {[...routes]
            .sort((a, b) => {
              const order: Record<string, number> = { L1: 1, L2: 2, L3: 3 };
              return (order[a.id] || 99) - (order[b.id] || 99);
            })
            .map((route) => {
              const order: Record<string, number> = { L1: 1, L2: 2, L3: 3 };
              return (
                <RouteSection
                  key={route.id}
                  route={route}
                  drivers={byRoute[route.id] ?? []}
                  lineNum={order[route.id] || 0}
                  onShowTimetable={() => openTimetable(route.id)}
                  onShowVehicles={() => openVehicles(route.id)}
                  expanded={panelsCollapsed}
                />
              );
            })}
        </div>
      </div>

      <TimetableView
        open={timetableOpen}
        onClose={() => setTimetableOpen(false)}
        initialRoute={timetableRoute}
        date={date}
      />
      <RouteVehiclesDialog
        key={`${vehiclesOpen}-${vehiclesRoute}-${date.toISOString()}`}
        open={vehiclesOpen}
        onClose={() => setVehiclesOpen(false)}
        initialRoute={vehiclesRoute}
      />
    </>
  );
}
