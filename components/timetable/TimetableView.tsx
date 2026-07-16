"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { TIMETABLES } from "@/lib/mock-data/timetables";
import { ROUTES } from "@/lib/mock-data";
import { getDriverForTrip } from "@/lib/shiftRotation";
import type { RouteId, DayType } from "@/types";

interface TimetableViewProps {
  open: boolean;
  onClose: () => void;
  initialRoute?: RouteId;
  date?: Date;
}

export function TimetableView({
  open,
  onClose,
  initialRoute = "L1",
  date = new Date(),
}: TimetableViewProps) {
  const [activeRoute, setActiveRoute] = useState<RouteId>(initialRoute);
  const [dayType, setDayType] = useState<DayType>(
    date.getDay() === 0 || date.getDay() === 6 ? "weekend" : "weekday"
  );

  // Sync active route when modal opens with a new initialRoute
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveRoute(initialRoute);
      setDayType(date.getDay() === 0 || date.getDay() === 6 ? "weekend" : "weekday");
    }
  }, [date, open, initialRoute]);

  if (!open) return null;

  const route = ROUTES.find((r) => r.id === activeRoute)!;
  const table = TIMETABLES[activeRoute];
  const rows = dayType === "weekday" ? table.weekday : table.weekend;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 900,
        background: "rgba(10,12,20,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden relative"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(248,249,252,0.97) 100%)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.9)",
          boxShadow:
            "0 32px 80px rgba(10,12,20,0.35), 0 8px 32px rgba(10,12,20,0.15), inset 0 1px 0 rgba(255,255,255,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient bar */}
        <div
          className="absolute inset-x-0 top-0 h-[0.1875rem] rounded-t-[1.25rem]"
          style={{
            background: `linear-gradient(90deg, ${route.color}, ${route.color}99, #1e40af)`,
          }}
        />

        {/* Decorative glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, ${route.color}22 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between flex-shrink-0 relative z-10"
          style={{ borderBottom: "1px solid rgba(26,26,46,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
                boxShadow: `0 4px 14px ${route.color}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1a1a2e]">ตารางเวลาเดินรถ</h2>
              <p className="text-[0.625rem] text-gray-400">Shuttle Bus Timetable</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all duration-200 text-gray-400"
            style={{ background: "rgba(26,26,46,0.05)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(26,26,46,0.05)";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route tabs */}
        <div className="flex gap-2 px-5 pt-3 pb-0 flex-shrink-0">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoute(r.id)}
              className="flex-1 text-[0.6875rem] font-bold py-2 rounded-xl transition-all duration-200 relative overflow-hidden"
              style={
                activeRoute === r.id
                  ? {
                      background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)`,
                      color: "white",
                      boxShadow: `0 4px 12px ${r.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }
                  : {
                      background: "rgba(26,26,46,0.04)",
                      color: "#6b7280",
                      border: "1px solid rgba(26,26,46,0.06)",
                    }
              }
            >
              {activeRoute === r.id && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
                  }}
                />
              )}
              <span className="relative z-10">{r.name}</span>
            </button>
          ))}
        </div>

        {/* Day type toggle */}
        <div className="flex gap-2 px-5 pt-3 pb-2 flex-shrink-0">
          <button
            onClick={() => setDayType("weekday")}
            className="text-[0.625rem] font-semibold px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5"
            style={
              dayType === "weekday"
                ? {
                    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(26,26,46,0.3)",
                  }
                : {
                    background: "rgba(26,26,46,0.05)",
                    color: "#6b7280",
                  }
            }
          >
            <Clock className="w-3 h-3" />
            วันจันทร์-ศุกร์
          </button>
          <button
            onClick={() => setDayType("weekend")}
            className="text-[0.625rem] font-semibold px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5"
            style={
              dayType === "weekend"
                ? {
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "white",
                    boxShadow: "0 3px 10px rgba(249,115,22,0.35)",
                  }
                : {
                    background: "rgba(26,26,46,0.05)",
                    color: "#6b7280",
                  }
            }
          >
            <Clock className="w-3 h-3" />
            เสาร์-อาทิตย์ และวันหยุด
          </button>
        </div>

        {/* Divider */}
        <div
          className="mx-5 h-[0.0625rem]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(26,26,46,0.08), transparent)",
          }}
        />

        {/* Timetable grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {rows.length === 0 ? (
            <p className="text-center text-[0.75rem] text-gray-400 py-10">ไม่มีรอบวิ่งในวันนี้</p>
          ) : (
            <div className="space-y-1.5">
              {(() => {
                let currentTripIndex = 0;
                const flattenedRows = rows.map((row) => ({
                  hour: row.hour,
                  minutes: row.minutes.map((m) => ({
                    m,
                    tripIndex: currentTripIndex++,
                  })),
                }));

                return flattenedRows.map(({ hour, minutes }) => (
                  <div key={hour} className="flex items-stretch gap-2">
                    <div
                      className="w-10 flex-shrink-0 rounded-lg flex items-center justify-center text-white text-[0.75rem] font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${route.color}, ${route.color}cc)`,
                        boxShadow: `0 2px 8px ${route.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
                      }}
                    >
                      {hour}
                    </div>
                    <div
                      className="flex-1 flex flex-wrap items-center gap-1.5 rounded-lg px-2 py-1.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,249,252,0.8))",
                        border: "1px solid rgba(26,26,46,0.06)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,1)",
                      }}
                    >
                      {minutes.map(({ m, tripIndex }) => {
                        const driver = getDriverForTrip(activeRoute, tripIndex, date);
                        const isLeave = driver?.status === "Leave";
                        const isSubstitute = driver?.status === "Substitute";
                        return (
                          <div
                            key={m}
                            className="flex flex-col items-center justify-center rounded px-2 py-1 transition-all duration-150 cursor-pointer"
                            style={{
                              background: isSubstitute ? `${route.color}15` : "white",
                              border: `1px solid ${isSubstitute ? `${route.color}30` : `${route.color}25`}`,
                              boxShadow: `0 1px 3px rgba(26,26,46,0.07)`,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = route.color;
                              (e.currentTarget as HTMLDivElement).style.color = "white";
                              (e.currentTarget as HTMLDivElement).style.boxShadow =
                                `0 2px 8px ${route.color}50`;
                              // also change inner spans
                              const spans = e.currentTarget.querySelectorAll("span");
                              spans.forEach((span) => (span.style.color = "white"));
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.background = isSubstitute
                                ? `${route.color}15`
                                : "white";
                              (e.currentTarget as HTMLDivElement).style.color = "#374151";
                              (e.currentTarget as HTMLDivElement).style.boxShadow =
                                "0 1px 3px rgba(26,26,46,0.07)";
                              // revert inner spans
                              const spans = e.currentTarget.querySelectorAll("span");
                              if (spans.length > 1) {
                                spans[0].style.color = isSubstitute ? route.color : "#374151"; // time
                                spans[1].style.color = isLeave
                                  ? "#ef4444"
                                  : isSubstitute
                                    ? route.color
                                    : "#6b7280"; // name
                              }
                            }}
                            title={
                              driver
                                ? `Driver: ${driver.name} ${driver.surname} (${driver.code})${isSubstitute ? " (ตัวแทน)" : ""}`
                                : "No driver assigned"
                            }
                          >
                            <span
                              className="text-[0.75rem] font-bold"
                              style={{
                                color: isSubstitute ? route.color : "#374151",
                                transition: "color 0.15s",
                              }}
                            >
                              {m}
                            </span>
                            <span
                              className="text-[0.5625rem] font-medium truncate max-w-[2.8125rem]"
                              style={{
                                color: isLeave ? "#ef4444" : isSubstitute ? route.color : "#6b7280",
                                transition: "color 0.15s",
                              }}
                            >
                              {driver ? (isLeave ? "Leave" : driver.name) : "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
          <p className="text-[0.5625rem] text-gray-400 mt-4 text-center">
            เวลาออกรถ และชื่อคนขับประจำรอบ (หมุนเวียนคิวทุกวัน)
          </p>
        </div>
      </div>
    </div>
  );
}
