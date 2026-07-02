"use client";

import React, { useState, useMemo } from "react";
import { ROUTES } from "@/lib/mock-data";
import { TIMETABLES } from "@/lib/mock-data/timetables";
import { getDriverForTrip } from "@/lib/shiftRotation";
import { Calendar as CalendarIcon, Clock, CalendarDays, Settings2 } from "lucide-react";
import type { RouteId } from "@/types";
import { RotationConfigModal } from "./RotationConfigModal";

export function ScheduleSimulator() {
  const [activeRoute, setActiveRoute] = useState<RouteId>("L1");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const route = ROUTES.find((r) => r.id === activeRoute)!;
  const table = TIMETABLES[activeRoute];

  // Determine if selected date is weekend
  const dayOfWeek = selectedDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const rows = isWeekend ? table.weekend : table.weekday;

  // Generate an array of 7 consecutive dates starting from today for the horizontal scroll
  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const datePickerRef = React.useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      // Ensure we keep the local date correctly when parsing the YYYY-MM-DD string
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">จำลองตารางเวรคนขับล่วงหน้า</h2>
            <p className="text-sm text-slate-500">ตรวจสอบคิวคนขับตามรอบเวลาของแต่ละวัน</p>
          </div>
        </div>

        <button
          onClick={() => setConfigModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-all shadow-sm hover:shadow"
        >
          <Settings2 className="w-4 h-4" />
          ตั้งค่าคิวเดินรถ
        </button>
      </div>

      {/* Date Selection Area */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Horizontal Dates */}
        <div
          className="flex overflow-x-auto gap-2 pb-2 w-full md:w-auto flex-1 no-scrollbar"
          style={{ scrollbarWidth: "none" }}
        >
          {upcomingDates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            return (
              <button
                key={date.getTime()}
                onClick={() => setSelectedDate(date)}
                className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl transition-all duration-200 border"
                style={
                  selected
                    ? {
                        background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                        color: "white",
                        borderColor: "transparent",
                        boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                      }
                    : {
                        background: "rgba(248,249,252,0.8)",
                        color: "#475569",
                        borderColor: "rgba(26,26,46,0.06)",
                      }
                }
              >
                <span className="text-[0.625rem] font-medium uppercase opacity-80">
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-lg font-bold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        {/* Date Picker Button */}
        <div className="relative flex-shrink-0 w-full md:w-auto">
          <input
            type="date"
            // Pad month and date with 0 for YYYY-MM-DD
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
            onChange={handleDateChange}
            className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
            ref={datePickerRef}
          />
          <button
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 h-16 rounded-xl border transition-all duration-200 hover:bg-slate-50 cursor-pointer"
            onClick={() => {
              try {
                if (datePickerRef.current) {
                  datePickerRef.current.showPicker();
                }
              } catch (e) {
                // Fallback for browsers that don't support showPicker
                if (datePickerRef.current) {
                  datePickerRef.current.focus();
                }
              }
            }}
            style={{
              background: "white",
              borderColor: "rgba(26,26,46,0.08)",
              color: "#475569",
            }}
          >
            <CalendarIcon className="w-5 h-5 text-indigo-500 pointer-events-none" />
            <div className="text-left pointer-events-none">
              <span className="block text-[0.625rem] font-medium text-slate-400">
                เลือกวันที่อื่น
              </span>
              <span className="block text-sm font-bold text-slate-700">
                {selectedDate.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Route Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
        {ROUTES.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveRoute(r.id)}
            className="flex-1 text-[0.75rem] font-bold py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden"
            style={
              activeRoute === r.id
                ? {
                    background: "white",
                    color: r.color,
                    boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
                  }
                : {
                    background: "transparent",
                    color: "#6b7280",
                  }
            }
          >
            <span className="relative z-10">{r.name}</span>
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="bg-slate-50/50 rounded-2xl p-4 md:p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">
              ตารางเวลา ({isWeekend ? "เสาร์-อาทิตย์ และวันหยุด" : "วันจันทร์-ศุกร์"})
            </h3>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="text-center text-[0.8125rem] text-slate-500 py-10 font-medium bg-white rounded-xl border border-slate-100">
            ไม่มีรอบวิ่งในวันนี้
          </p>
        ) : (
          <div className="space-y-2">
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
                <div key={hour} className="flex flex-col md:flex-row md:items-stretch gap-2">
                  <div
                    className="md:w-14 h-10 md:h-auto flex-shrink-0 rounded-xl flex items-center justify-center text-white text-[0.875rem] font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${route.color}, ${route.color}dd)`,
                      boxShadow: `0 2px 8px ${route.color}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    {hour}
                  </div>
                  <div
                    className="flex-1 flex flex-wrap items-center gap-2 rounded-xl p-2.5"
                    style={{
                      background: "white",
                      border: "1px solid rgba(26,26,46,0.06)",
                      boxShadow: "0 1px 3px rgba(26,26,46,0.02)",
                    }}
                  >
                    {minutes.map(({ m, tripIndex }) => {
                      const driver = getDriverForTrip(activeRoute, tripIndex, selectedDate);
                      const isLeave = driver?.status === "Leave";
                      const isSubstitute = driver?.status === "Substitute";
                      return (
                        <div
                          key={m}
                          className="flex flex-col items-center justify-center rounded-lg px-3 py-1.5 transition-all duration-200 cursor-default"
                          style={{
                            background: isSubstitute ? `${route.color}15` : "rgba(248,249,252,0.8)",
                            border: `1px solid ${isSubstitute ? `${route.color}30` : "rgba(26,26,46,0.05)"}`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = isSubstitute
                              ? `${route.color}25`
                              : `${route.color}08`;
                            (e.currentTarget as HTMLDivElement).style.borderColor =
                              `${route.color}40`;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = isSubstitute
                              ? `${route.color}15`
                              : "rgba(248,249,252,0.8)";
                            (e.currentTarget as HTMLDivElement).style.borderColor = isSubstitute
                              ? `${route.color}30`
                              : "rgba(26,26,46,0.05)";
                          }}
                          title={
                            driver
                              ? `Driver: ${driver.name} ${driver.surname} (${driver.code})${isSubstitute ? " (ตัวแทน)" : ""}`
                              : "No driver assigned"
                          }
                        >
                          <span
                            className="text-[0.875rem] font-bold text-slate-700"
                            style={{ color: isSubstitute ? route.color : undefined }}
                          >
                            {m}
                          </span>
                          <span
                            className="text-[0.6875rem] font-medium truncate max-w-[3.75rem] mt-0.5"
                            style={{
                              color: isLeave ? "#ef4444" : isSubstitute ? route.color : "#64748b",
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
      </div>

      <RotationConfigModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        initialRoute={activeRoute}
      />
    </div>
  );
}
