"use client";

import { useState, useMemo } from "react";
import { Users, ChevronUp, ChevronDown, X } from "lucide-react";
import { ReservePool } from "@/components/drivers/ReservePool";
import { DriverTable } from "@/components/drivers/DriverTable";
import { RouteSection } from "@/components/routes/RouteSection";
import { RouteVehiclesDialog } from "@/components/routes/RouteVehiclesDialog";
import { TimetableView } from "@/components/timetable/TimetableView";
import { useFleetStore } from "@/lib/store/fleetStore";
import { getAllDepartures } from "@/lib/mock-data/timetables";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import type { RouteId } from "@/types";

type SheetState = "peek" | "full";

const SHEET_HEIGHTS: Record<SheetState, string> = {
  peek: "calc(100% - 64px)",
  full: "0%",
};

export function MobilePanel() {
  const { routes, drivers } = useFleetStore();
  const [sheetState, setSheetState] = useState<SheetState>("peek");
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableRoute, setTimetableRoute] = useState<RouteId>("L1");
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [vehiclesRoute, setVehiclesRoute] = useState<RouteId>("L1");

  const byRoute: Record<string, typeof drivers> = {
    L1: drivers.filter((d) => d.routeId === "L1"),
    L2: drivers.filter((d) => d.routeId === "L2"),
    L3: drivers.filter((d) => d.routeId === "L3"),
  };

  const now = useCurrentTime(1000);

  const totalPassed = useMemo(() => {
    let passed = 0;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (const r of routes) {
      const depts = getAllDepartures(r.id, now);
      for (const d of depts) {
        const [hStr, mStr] = d.time.split(":");
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (h < currentHour || (h === currentHour && m <= currentMinute)) {
          passed++;
        }
      }
    }
    return Math.max(0, Math.min(211, passed));
  }, [routes, now]);

  const totalTrips = 211;
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

  const toggle = () => setSheetState((prev) => (prev === "peek" ? "full" : "peek"));

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const delta = dragStart - e.changedTouches[0].clientY;
    if (delta > 30) setSheetState("full");
    else if (delta < -30) setSheetState("peek");
    setDragStart(null);
  };

  const isOpen = sheetState === "full";

  return (
    <>
      {/* Backdrop blur overlay when open */}
      {isOpen && (
        <div
          className="absolute inset-0 z-[700]"
          style={{
            background: "rgba(15,20,40,0.35)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setSheetState("peek")}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="absolute left-0 right-0 bottom-0 z-[800] flex min-h-0 flex-col"
        style={{
          height: "calc(100% - 16px)", // Use constant height relative to container to prevent layout reflows
          transform: `translateY(${SHEET_HEIGHTS[sheetState]})`,
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
          borderRadius: "24px 24px 0 0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)",
          boxShadow: "0 -8px 40px rgba(10,15,30,0.25), 0 -1px 0 rgba(255,255,255,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Drag Handle & Header */}
        <div
          className="flex-shrink-0 cursor-pointer select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={toggle}
          style={{
            background: "linear-gradient(145deg, #0a0f1c 0%, #131b2f 50%, #111827 100%)",
            borderRadius: "24px 24px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Drag pill */}
          <div className="flex justify-center pt-2 pb-1.5">
            <div
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.2)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)",
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  boxShadow: "0 3px 8px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <Users
                  style={{
                    width: "15px",
                    height: "15px",
                    color: "white",
                    filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
                  }}
                />
              </div>
              <div>
                <p
                  className="text-white font-bold tracking-wide"
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.2,
                    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  Fleet &amp; Reserve
                </p>
                <p
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    marginTop: "1px",
                    letterSpacing: "0.01em",
                  }}
                >
                  การจัดการกองรถและคนสำรอง
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decorative line */}
          <div
            className="h-[2px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(139,92,246,0.5), transparent)",
              boxShadow: "0 1px 4px rgba(59,130,246,0.3)",
            }}
          />
        </div>

        {/* Scrollable content */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="space-y-6 p-4 pb-24">
            {/* Active Routes Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.875rem] font-bold text-[#0f172a]">Active Routes</h3>
                <span className="text-[0.625rem] text-gray-400">ดูเวลาและตารางเดินรถ</span>
              </div>

              {/* Mobile Total Trips Summary */}
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm mb-4">
                <div className="flex items-center justify-between text-sm font-bold text-[#0f172a]">
                  <span>รอบวิ่งรวมวันนี้</span>
                  <span className="text-[#1e3a8a] text-base">
                    {totalPassed}/{totalTrips}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>ผ่านแล้ว {totalPassed}</span>
                  <span>เหลือ {remainingTrips}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
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
                        expanded={false}
                      />
                    );
                  })}
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
              <ReservePool />
            </div>

            <div className="border-t pt-4" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
              <DriverTable compact />
            </div>
          </div>
        </div>
      </div>

      <TimetableView
        open={timetableOpen}
        onClose={() => setTimetableOpen(false)}
        initialRoute={timetableRoute}
      />
      <RouteVehiclesDialog
        key={`${vehiclesOpen}-${vehiclesRoute}`}
        open={vehiclesOpen}
        onClose={() => setVehiclesOpen(false)}
        initialRoute={vehiclesRoute}
        drivers={drivers}
        now={now}
      />
    </>
  );
}
