"use client";

import React, { useState, useMemo } from "react";
import { Search, Calendar, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Driver, ReserveDriver } from "@/types";
import { getRouteMeta } from "./DriverDashboard";

// TODO: Replace this mock weekly schedule with DB-backed roster data when weekly schedule tables are implemented.
// This mock data is for UI preview only.
interface ScheduleEntry {
  id: string;
  driverName: string;
  employeeCode?: string;
  route?: string; // Display name from getRouteMeta
  vehicle?: string;
  role: "regular" | "reserve" | "off";
  note?: string;
  routeColor?: string; // Tailwind class from getRouteMeta
  routeOrder?: number;
  timeSlotOrder?: number;
  originalIndex: number;
}

interface WeeklyDriverScheduleProps {
  drivers: Driver[];
  reserveDrivers?: ReserveDriver[];
}

const generateMockWeeklyData = (
  baseDrivers: Driver[],
  reserveDrivers: ReserveDriver[],
  upcomingDates: Date[]
): Record<string, ScheduleEntry[]> => {
  const schedule: Record<string, ScheduleEntry[]> = {};

  upcomingDates.forEach((date, i) => {
    const entries: ScheduleEntry[] = [];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dateKey = date.toISOString();

    // Use stable deterministic epoch days for mock data generation to ensure navigation consistency
    const epochDays = Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);

    // -- Analytics Time-slot Order --
    const routeOrderMap = new Map<string, number>();
    const routeIds = ["L1", "L2", "L3"] as const;
    routeIds.forEach((routeId) => {
      // 1. Gather drivers for this route and sort by vehicle to ensure a stable base array
      // (matches the static DRIVERS order from Analytics)
      const routeDrivers = baseDrivers
        .filter((d) => d.routeId === routeId)
        .sort((a, b) => (a.vehicle || "").localeCompare(b.vehicle || ""));

      const N = routeDrivers.length;
      if (N === 0) return;

      // 2. Calculate day offset matching Analytics math
      const timezoneOffsetMs = date.getTimezoneOffset() * 60000;
      const localTimeMs = date.getTime() - timezoneOffsetMs;
      const daysSinceEpoch = Math.floor(localTimeMs / 86400000);
      const dayOffset = daysSinceEpoch % N;

      // 3. Map the driver's employee code to their time-slot position (0 to N-1)
      for (let trip = 0; trip < N; trip++) {
        const driverIndex = (trip + dayOffset) % N;
        const d = routeDrivers[driverIndex];
        if (d && d.code && !routeOrderMap.has(d.code)) {
          routeOrderMap.set(d.code, trip);
        }
      }
    });

    // 1. Process Regular Drivers (usually 15 total)
    baseDrivers.forEach((driver, idx) => {
      const meta = getRouteMeta(driver.route);
      let role: "regular" | "off" = "regular";
      let note: string | undefined = undefined;

      if (isWeekend) {
        // Weekends: ~10 working, ~5 off
        const offBase = (epochDays * 5) % baseDrivers.length;
        const isOff = [0, 1, 2, 3, 4].some((j) => (offBase + j) % baseDrivers.length === idx);
        if (isOff) {
          role = "off";
          note = "หยุดวันเสาร์/อาทิตย์";
        }
      } else {
        // Weekdays: ~14 working, ~1 off
        const offBase = (epochDays * 3) % baseDrivers.length;
        const isOff = offBase === idx;
        if (isOff) {
          role = "off";
          note = "หยุดพัก/ธุระ";
        }
      }

      entries.push({
        id: `reg-${driver.id}-${dateKey}`,
        driverName: `${driver.name} ${driver.surname}`,
        employeeCode: driver.code,
        route: meta.name,
        vehicle: driver.vehicle,
        role,
        note,
        routeColor: meta.color,
        routeOrder: meta.order,
        timeSlotOrder: routeOrderMap.get(driver.code) ?? 999,
        originalIndex: idx,
      });
    });

    // 2. Process Reserve Drivers (usually 2 total)
    const activeReserves =
      reserveDrivers.length > 0
        ? reserveDrivers
        : [
            {
              id: "res1",
              name: "วายุ",
              role: "Driver",
              availability: 100,
              skillLevel: 4,
              experience: 2,
              status: "Available",
              color: "blue",
            } as unknown as ReserveDriver,
            {
              id: "res2",
              name: "อำพล",
              role: "Driver",
              availability: 100,
              skillLevel: 4,
              experience: 2,
              status: "Available",
              color: "blue",
            } as unknown as ReserveDriver,
          ];

    activeReserves.forEach((res, idx) => {
      let role: "reserve" | "off" = "reserve";
      let note: string | undefined = undefined;

      const isOff = (epochDays + idx) % activeReserves.length === 0;

      if (isOff) {
        role = "off";
        note = "หยุดพัก";
      } else {
        role = "reserve";
        note = "สำรอง";
      }

      entries.push({
        id: `res-${res.id}-${dateKey}`,
        driverName: res.name,
        role,
        note,
        originalIndex: 100 + idx, // keep reserves grouped when sorting identically
      });
    });

    // 3. Sort entries
    // Regulars: strictly by route color then by Analytics time-slot order
    const regulars = entries
      .filter((e) => e.role === "regular")
      .sort((a, b) => {
        if ((a.routeOrder || 99) !== (b.routeOrder || 99)) {
          return (a.routeOrder || 99) - (b.routeOrder || 99);
        }
        return (a.timeSlotOrder ?? 999) - (b.timeSlotOrder ?? 999);
      });

    // In our new UI we just put them all into schedule and filter on render
    const allEntries = entries.sort((a, b) => {
      if ((a.routeOrder || 99) !== (b.routeOrder || 99)) {
        return (a.routeOrder || 99) - (b.routeOrder || 99);
      }
      return (a.timeSlotOrder ?? 999) - (b.timeSlotOrder ?? 999);
    });

    schedule[dateKey] = allEntries;
  });

  return schedule;
};

const dayNamesShort: Record<number, string> = {
  0: "อาทิตย์",
  1: "จันทร์",
  2: "อังคาร",
  3: "พุธ",
  4: "พฤหัสบดี",
  5: "ศุกร์",
  6: "เสาร์",
};

const getCurrentMonday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.setDate(diff));
};

export function WeeklyDriverSchedule({
  drivers = [],
  reserveDrivers = [],
}: WeeklyDriverScheduleProps) {
  const [search, setSearch] = useState("");
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(getCurrentMonday());

  const navigateWeek = (weeks: number) => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setSelectedWeekStart(newDate);
  };

  const resetToCurrentWeek = () => {
    setSelectedWeekStart(getCurrentMonday());
  };

  const displayDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(selectedWeekStart);
      d.setDate(selectedWeekStart.getDate() + i);
      dates.push(d);
    }
    return dates; // Monday-first
  }, [selectedWeekStart]);

  const startDate = displayDates[0];
  const endDate = displayDates[displayDates.length - 1];

  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const endMonth = endDate.toLocaleDateString("th-TH", { month: "short" });
  const endYear = endDate.getFullYear();
  const startMonth = startDate.toLocaleDateString("th-TH", { month: "short" });

  const dateRangeText =
    startDate.getMonth() === endDate.getMonth()
      ? `${startDay}–${endDay} ${endMonth} ${endYear}`
      : `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;

  const mockSchedule = useMemo(
    () => generateMockWeeklyData(drivers, reserveDrivers, displayDates),
    [drivers, reserveDrivers, displayDates]
  );

  const todayStr = new Date().toDateString();

  // Helper to render cell content for a route/category
  const renderCellContent = (
    dateKey: string,
    filterFn: (d: ScheduleEntry) => boolean,
    isSummaryRow = false
  ) => {
    const dayData = mockSchedule[dateKey] || [];
    const categoryData = dayData.filter(filterFn);

    if (categoryData.length === 0) return null; // Let the cell be empty

    return (
      <div className="flex flex-col gap-1.5 p-1.5 min-h-[40px]">
        {categoryData.map((item) => {
          const isMatched =
            search === "" ||
            item.driverName.toLowerCase().includes(search.toLowerCase()) ||
            item.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
            item.vehicle?.toLowerCase().includes(search.toLowerCase());

          const isOff = item.role === "off";

          // Only render if it matches search
          if (!isMatched && search !== "") return null;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center text-[12px] leading-tight ${
                isOff && !isSummaryRow ? "text-slate-400" : "text-slate-700 font-medium"
              } ${isMatched && search !== "" ? "bg-indigo-50 px-1 rounded -mx-1" : ""}`}
            >
              <span
                className={`truncate mr-1 ${isOff && !isSummaryRow ? "line-through opacity-70" : ""}`}
              >
                {item.driverName.split(" ")[0]}
              </span>
              {!isSummaryRow && (
                <span
                  className={`text-[10px] whitespace-nowrap ${isOff ? "text-slate-300" : "text-slate-500"}`}
                >
                  ({item.vehicle || item.employeeCode})
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            ตารางเวรคนขับรถรายสัปดาห์
          </h2>
          <div className="group relative hidden sm:flex items-center">
            <Info className="w-4 h-4 text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              <span className="font-bold text-indigo-300">ข้อมูลจำลอง</span>{" "}
              อิงจากลำดับรอบเวลาในหน้าวิเคราะห์ เพื่อดู UI ตารางเวรเท่านั้น
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="สัปดาห์ก่อน"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              className="px-3 py-1 text-[11px] sm:text-xs font-bold text-slate-700 border-x border-slate-100 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={resetToCurrentWeek}
              title="กลับไปสัปดาห์ปัจจุบัน"
            >
              สัปดาห์ที่ {dateRangeText}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="สัปดาห์ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รถ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px] border-b border-slate-100 flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200">
            <div className="p-3 border-r border-slate-200 flex items-center justify-center bg-slate-100/50">
              {/* Empty top-left cell */}
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={idx}
                  className={`p-2 border-r border-slate-200 text-center flex flex-col justify-center items-center last:border-r-0 ${
                    isToday ? "bg-indigo-50/80" : isWeekend ? "bg-slate-100/50" : ""
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${isToday ? "text-indigo-600" : "text-slate-500"}`}
                  >
                    {dayNamesShort[date.getDay()]}
                  </span>
                  <span
                    className={`text-sm font-bold ${isToday ? "text-indigo-700" : "text-slate-800"}`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Route Rows */}

          {/* Red Line */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
            <div className="p-2 border-r border-slate-200 bg-red-50/30 flex items-center justify-center border-l-4 border-l-red-500">
              <span className="text-[11px] sm:text-xs font-bold text-red-700 text-center leading-tight">
                สายสีแดง
              </span>
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={idx}
                  className={`border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/10" : isWeekend ? "bg-slate-50/30" : "bg-white"}`}
                >
                  {renderCellContent(date.toISOString(), (d) => d.route?.includes("แดง") ?? false)}
                </div>
              );
            })}
          </div>

          {/* Blue Line */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
            <div className="p-2 border-r border-slate-200 bg-blue-50/30 flex items-center justify-center border-l-4 border-l-blue-600">
              <span className="text-[11px] sm:text-xs font-bold text-blue-800 text-center leading-tight">
                สายสีน้ำเงิน
              </span>
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={idx}
                  className={`border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/10" : isWeekend ? "bg-slate-50/30" : "bg-white"}`}
                >
                  {renderCellContent(
                    date.toISOString(),
                    (d) => d.route?.includes("น้ำเงิน") ?? false
                  )}
                </div>
              );
            })}
          </div>

          {/* Green Line */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] border-b border-slate-200 hover:bg-slate-50/30 transition-colors">
            <div className="p-2 border-r border-slate-200 bg-emerald-50/30 flex items-center justify-center border-l-4 border-l-emerald-500">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-700 text-center leading-tight">
                สายสีเขียว
              </span>
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={idx}
                  className={`border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/10" : isWeekend ? "bg-slate-50/30" : "bg-white"}`}
                >
                  {renderCellContent(
                    date.toISOString(),
                    (d) => d.route?.includes("เขียว") ?? false
                  )}
                </div>
              );
            })}
          </div>

          {/* Reserve Row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
            <div className="p-2 border-r border-slate-200 bg-slate-50/80 flex items-center justify-center border-l-4 border-l-slate-300">
              <span className="text-[11px] font-bold text-slate-600">สำรอง</span>
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={idx}
                  className={`border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/10" : isWeekend ? "bg-slate-50/30" : "bg-white"}`}
                >
                  {renderCellContent(
                    date.toISOString(),
                    (d) => d.role === "reserve" || (!d.route && d.role !== "off"),
                    true
                  )}
                </div>
              );
            })}
          </div>

          {/* Off Row (Summary) */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] sm:grid-cols-[100px_repeat(7,1fr)] hover:bg-slate-50/30 transition-colors">
            <div className="p-2 border-r border-slate-200 bg-slate-50/80 flex items-center justify-center border-l-4 border-l-slate-200">
              <span className="text-[11px] font-bold text-slate-500">พักงาน</span>
            </div>
            {displayDates.map((date, idx) => {
              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              return (
                <div
                  key={idx}
                  className={`border-r border-slate-100 last:border-r-0 ${isToday ? "bg-indigo-50/10" : isWeekend ? "bg-slate-50/30" : "bg-white"}`}
                >
                  {renderCellContent(date.toISOString(), (d) => d.role === "off", true)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search empty state */}
      {search !== "" && (
        <div className="p-3 bg-slate-50/50 text-center text-xs text-slate-500 border-t border-slate-100">
          กำลังแสดงผลการค้นหาสำหรับ "{search}"
        </div>
      )}
    </div>
  );
}
