"use client";

import { useState } from "react";
import { Users, ChevronUp, ChevronDown, X } from "lucide-react";
import { ReservePool } from "@/components/drivers/ReservePool";
import { DriverTable } from "@/components/drivers/DriverTable";
import { RouteSection } from "@/components/routes/RouteSection";
import { TimetableView } from "@/components/timetable/TimetableView";
import { useFleetStore } from "@/lib/store/fleetStore";
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

  const byRoute: Record<string, typeof drivers> = {
    L1: drivers.filter((d) => d.routeId === "L1"),
    L2: drivers.filter((d) => d.routeId === "L2"),
    L3: drivers.filter((d) => d.routeId === "L3"),
  };

  const openTimetable = (routeId: RouteId) => {
    setTimetableRoute(routeId);
    setTimetableOpen(true);
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
        className="absolute left-0 right-0 bottom-0 z-[800] flex flex-col"
        style={{
          height: "88vh", // Use constant height to prevent layout reflows during animation
          transform: `translateY(${SHEET_HEIGHTS[sheetState]})`,
          transition: "transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
          borderRadius: "20px 20px 0 0",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)",
          boxShadow: "0 -8px 40px rgba(26,26,46,0.18), 0 -1px 0 rgba(26,26,46,0.06)",
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
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
            borderRadius: "20px 20px 0 0",
          }}
        >
          {/* Drag pill */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.25)",
              }}
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(37,99,235,0.9), rgba(59,130,246,0.9))",
                  boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
                }}
              >
                <Users style={{ width: "14px", height: "14px", color: "white" }} />
              </div>
              <div>
                <p className="text-white font-bold" style={{ fontSize: "13px", lineHeight: 1.2 }}>
                  Fleet &amp; Reserve Pool
                </p>
                <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>
                  การจัดการกองรถและคนสำรอง
                </p>
              </div>
            </div>

            {/* Toggle icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle();
              }}
              className="flex items-center justify-center rounded-full"
              style={{
                width: "28px",
                height: "28px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {sheetState === "full" ? (
                <ChevronDown style={{ width: "14px", height: "14px", color: "white" }} />
              ) : (
                <ChevronUp style={{ width: "14px", height: "14px", color: "white" }} />
              )}
            </button>
          </div>

          {/* Bottom gradient line */}
          <div
            className="h-[0.0625rem]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(37,99,235,0.30), rgba(71,85,105,0.25), transparent)",
            }}
          />
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="p-4 space-y-6">
            {/* Active Routes Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[0.875rem] font-bold text-[#0f172a]">Active Routes</h3>
                <span className="text-[0.625rem] text-gray-400">ดูเวลาและตารางเดินรถ</span>
              </div>
              <div className="flex flex-col gap-3">
                {routes.map((route, i) => (
                  <RouteSection
                    key={route.id}
                    route={route}
                    drivers={byRoute[route.id] ?? []}
                    lineNum={i + 1}
                    onShowTimetable={() => openTimetable(route.id)}
                    expanded={false}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
              <ReservePool />
            </div>

            <div className="border-t pt-4" style={{ borderColor: "rgba(26,26,46,0.06)" }}>
              <DriverTable />
            </div>
          </div>
        </div>
      </div>

      <TimetableView
        open={timetableOpen}
        onClose={() => setTimetableOpen(false)}
        initialRoute={timetableRoute}
      />
    </>
  );
}
