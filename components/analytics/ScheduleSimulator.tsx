"use client";

import React, { useState, useMemo } from "react";
import { ROUTES } from "@/lib/mock-data";
import { TIMETABLES } from "@/lib/mock-data/timetables";
import { getDriverForTrip } from "@/lib/shiftRotation";
import { Calendar as CalendarIcon, CalendarDays, Settings2 } from "lucide-react";
import type { RouteId } from "@/types";
import { RotationConfigModal } from "./RotationConfigModal";

export function ScheduleSimulator() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [mobileRoute, setMobileRoute] = useState<RouteId>("L1");

  // Determine if selected date is weekend
  const dayOfWeek = selectedDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

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
      newDate.setHours(0, 0, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Build the matrix data for ALL routes
  const matrixData = useMemo(() => {
    const allHoursSet = new Set<number>();
    const routeData: {
      route: (typeof ROUTES)[number];
      hourMap: Record<number, { minute: string; tripIndex: number }[]>;
    }[] = [];

    for (const route of ROUTES) {
      const table = TIMETABLES[route.id];
      if (!table) continue;
      const schedule = isWeekend ? table.weekend : table.weekday;

      const hourMap: Record<number, { minute: string; tripIndex: number }[]> = {};
      let tripIndex = 0;

      for (const row of schedule) {
        allHoursSet.add(row.hour);
        hourMap[row.hour] = row.minutes.map((m) => ({
          minute: m,
          tripIndex: tripIndex++,
        }));
      }

      routeData.push({ route, hourMap });
    }

    const allHours = Array.from(allHoursSet).sort((a, b) => a - b);
    return { allHours, routeData };
  }, [isWeekend]);

  // Mobile: single route data
  const mobileRouteData = matrixData.routeData.find((rd) => rd.route.id === mobileRoute);
  const mobileRouteObj = ROUTES.find((r) => r.id === mobileRoute);

  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 mt-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 whitespace-nowrap tracking-tight">
              จำลองตารางเวรคนขับล่วงหน้า
            </h2>
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

        <div className="relative flex-shrink-0 w-full md:w-auto">
          <input
            type="date"
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

      {/* Schedule Type Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700">
          {isWeekend ? "เสาร์-อาทิตย์ และวันหยุด" : "วันจันทร์-ศุกร์"}
        </span>
      </div>

      {/* ============ DESKTOP: Full Matrix Table ============ */}
      <div className="hidden md:block bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-slate-700 text-white py-4 px-5 text-center min-w-[110px] border-r border-slate-600">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-bold">ช่วงเวลา</span>
                    <span className="text-xs opacity-50">Period of Time</span>
                  </div>
                </th>
                {matrixData.routeData.map(({ route }) => (
                  <th
                    key={route.id}
                    className="text-white py-4 px-3 text-center min-w-[160px] border-r last:border-r-0"
                    style={{
                      backgroundColor: route.color,
                      borderColor: `${route.color}cc`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-black tracking-wide">{route.labelTh}</span>
                      <span className="text-xs opacity-80 font-medium">{route.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.allHours.map((hour, hourIdx) => (
                <tr key={hour} className={hourIdx % 2 === 0 ? "bg-white" : "bg-slate-50/80"}>
                  <td
                    className="sticky left-0 z-10 border-r border-slate-200 py-4 px-4 align-top text-center"
                    style={{ backgroundColor: hourIdx % 2 === 0 ? "white" : "#f8fafc" }}
                  >
                    <span className="font-black text-5xl text-slate-700">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </td>

                  {matrixData.routeData.map(({ route, hourMap }) => {
                    const trips = hourMap[hour] || [];
                    return (
                      <td
                        key={route.id}
                        className="border-r last:border-r-0 border-slate-200 py-3 px-3 align-top"
                      >
                        <div className="flex flex-col gap-2">
                          {trips.length === 0 ? (
                            <span className="text-slate-300 text-center text-xl font-bold py-2">
                              -
                            </span>
                          ) : (
                            trips.map(({ minute, tripIndex }) => {
                              const driver = getDriverForTrip(
                                route.id as RouteId,
                                tripIndex,
                                selectedDate
                              );
                              const isLeave = driver?.status === "Leave";
                              const isSubstitute = driver?.status === "Substitute";

                              let textColor = "#334155";
                              if (isLeave) textColor = "#ef4444";
                              else if (isSubstitute) textColor = route.color;

                              return (
                                <div
                                  key={minute}
                                  className="group flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors cursor-default"
                                  title={
                                    driver
                                      ? `${driver.name} ${driver.surname} (${driver.code})`
                                      : "ไม่มีคนขับ"
                                  }
                                >
                                  <span
                                    className="text-2xl font-extrabold shrink-0"
                                    style={{ color: textColor }}
                                  >
                                    {String(hour).padStart(2, "0")}:{minute}
                                  </span>
                                  {driver && (
                                    <span
                                      className="text-2xl font-semibold"
                                      style={{ color: textColor }}
                                    >
                                      {driver.name}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============ MOBILE: Single Route with Tabs ============ */}
      <div className="block md:hidden">
        {/* Mobile Route Tabs */}
        <div className="flex gap-2 mb-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => setMobileRoute(r.id)}
              className="flex-1 text-xs font-bold py-2.5 rounded-lg transition-all duration-200"
              style={
                mobileRoute === r.id
                  ? {
                      background: "white",
                      color: r.color,
                      boxShadow: "0 2px 8px rgba(26,26,46,0.08)",
                    }
                  : {
                      background: "transparent",
                      color: "#9ca3af",
                    }
              }
            >
              {r.labelTh}
            </button>
          ))}
        </div>

        {/* Mobile Single-Route Table */}
        {mobileRouteData && mobileRouteObj && (
          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
            {/* Route Header */}
            <div
              className="py-3 px-4 text-white text-center"
              style={{ backgroundColor: mobileRouteObj.color }}
            >
              <span className="text-sm font-black tracking-wide">{mobileRouteObj.labelTh}</span>
              <span className="text-xs opacity-80 font-medium ml-2">{mobileRouteObj.name}</span>
            </div>

            {/* Timetable Rows */}
            <div className="divide-y divide-slate-100">
              {matrixData.allHours.map((hour, hourIdx) => {
                const trips = mobileRouteData.hourMap[hour] || [];
                if (trips.length === 0) return null;

                return (
                  <div key={hour} className="flex">
                    {/* Hour Label */}
                    <div className="w-20 shrink-0 flex items-start justify-center py-4 border-r border-slate-600 bg-slate-700">
                      <span className="font-black text-4xl text-white">
                        {String(hour).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Departure Times */}
                    <div className="flex-1 py-3 px-3">
                      <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                        {trips.map(({ minute, tripIndex }) => {
                          const driver = getDriverForTrip(mobileRoute, tripIndex, selectedDate);
                          const isLeave = driver?.status === "Leave";
                          const isSubstitute = driver?.status === "Substitute";

                          let textColor = "#334155";
                          if (isLeave) textColor = "#ef4444";
                          else if (isSubstitute) textColor = mobileRouteObj.color;

                          return (
                            <div key={minute} className="flex flex-col items-center text-center">
                              <span
                                className="text-lg font-extrabold leading-tight"
                                style={{ color: textColor }}
                              >
                                {String(hour).padStart(2, "0")}:{minute}
                              </span>
                              <span
                                className="text-sm font-semibold leading-tight mt-0.5"
                                style={{ color: textColor }}
                              >
                                {driver ? driver.name : "-"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <RotationConfigModal
        open={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        initialRoute={mobileRoute}
      />
    </div>
  );
}
