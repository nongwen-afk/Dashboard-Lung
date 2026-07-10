"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  List,
  Search,
  Table2,
} from "lucide-react";
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

  upcomingDates.forEach((date) => {
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

    // Keep the approved route and Analytics time-slot order for every rendered view.
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

const dayNamesCompact: Record<number, string> = {
  0: "อา.",
  1: "จ.",
  2: "อ.",
  3: "พ.",
  4: "พฤ.",
  5: "ศ.",
  6: "ส.",
};

const thaiGregorianLocale = "th-TH-u-ca-gregory-nu-latn";

interface ScheduleCounts {
  regular: number;
  reserve: number;
  off: number;
}

interface DailyScheduleGroup {
  key: "red" | "blue" | "green" | "reserve" | "off";
  label: string;
  entries: ScheduleEntry[];
  accentClass: string;
  headerClass: string;
}

interface DailyScheduleSectionProps {
  group: DailyScheduleGroup;
  compactGrid?: boolean;
}

const getScheduleCounts = (entries: ScheduleEntry[]): ScheduleCounts =>
  entries.reduce<ScheduleCounts>(
    (counts, entry) => {
      counts[entry.role] += 1;
      return counts;
    },
    { regular: 0, reserve: 0, off: 0 }
  );

const matchesSearch = (entry: ScheduleEntry, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") return true;

  return [entry.driverName, entry.employeeCode, entry.vehicle].some((value) =>
    value?.toLowerCase().includes(normalizedQuery)
  );
};

const getDefaultSelectedDayIndex = (weekStart: Date) => {
  const normalizedWeekStart = new Date(weekStart);
  normalizedWeekStart.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const differenceInDays = Math.round((today.getTime() - normalizedWeekStart.getTime()) / 86400000);

  return differenceInDays >= 0 && differenceInDays < 7 ? differenceInDays : 0;
};

function DailyScheduleSection({ group }: DailyScheduleSectionProps) {
  return (
    <section
      aria-labelledby={`daily-schedule-${group.key}`}
      className="flex min-w-0 flex-col bg-white"
    >
      <div
        className={`flex min-h-8 shrink-0 items-center border-l-4 px-3 py-1 ${group.accentClass} ${group.headerClass}`}
      >
        <h4 id={`daily-schedule-${group.key}`} className="text-[14px] font-bold">
          {group.label} · {group.entries.length} คน
        </h4>
      </div>

      <div className="flex-1">
        {group.entries.length > 0 ? (
          <ol className="divide-y divide-slate-100">
            {group.entries.map((entry, index) => {
              return (
                <li
                  key={entry.id}
                  className="grid min-h-8 grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-0.5 transition-colors hover:bg-slate-50"
                >
                  <span
                    className="text-right text-[14px] font-bold tabular-nums text-slate-400"
                    aria-hidden="true"
                  >
                    {index + 1}.
                  </span>
                  <span className="truncate text-[15px] font-semibold text-slate-800">
                    {entry.driverName}
                  </span>
                  {entry.vehicle ? (
                    <span className="whitespace-nowrap rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[14px] font-bold text-slate-600 shadow-sm">
                      {entry.vehicle}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="px-3 py-3 text-sm font-medium text-slate-500">ไม่มีรายชื่อ</p>
        )}
      </div>
    </section>
  );
}

function CompactScheduleSection({ group }: DailyScheduleSectionProps) {
  return (
    <section
      aria-labelledby={`daily-schedule-${group.key}`}
      className="flex min-w-0 flex-col bg-white"
    >
      <div
        className={`flex min-h-8 shrink-0 items-center border-l-4 px-3 py-1 ${group.accentClass} ${group.headerClass}`}
      >
        <h4 id={`daily-schedule-${group.key}`} className="text-[14px] font-bold">
          {group.label} · {group.entries.length} คน
        </h4>
      </div>
      <div className="px-2 py-1.5">
        {group.entries.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {group.entries.map((entry) => (
              <span
                key={entry.id}
                className={`inline-flex items-center rounded border px-2 py-0.5 text-[13px] font-semibold text-slate-800 ${
                  entry.role === "off"
                    ? "border-slate-200 bg-slate-100"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                {entry.driverName}
                {entry.note && entry.note !== "สำรอง" ? (
                  <span className="ml-1 font-normal text-slate-500">({entry.note})</span>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] font-medium text-slate-500">ไม่มีรายชื่อ</p>
        )}
      </div>
    </section>
  );
}

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
  const [selectedDayIndex, setSelectedDayIndex] = useState(() =>
    getDefaultSelectedDayIndex(getCurrentMonday())
  );
  const [viewMode, setViewMode] = useState<"daily" | "full">("daily");
  const dayScrollerRef = useRef<HTMLDivElement>(null);
  const dayButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = dayScrollerRef.current;
    const selectedButton = dayButtonRefs.current[selectedDayIndex];
    if (!container || !selectedButton) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left =
      selectedButton.offsetLeft - (container.clientWidth - selectedButton.clientWidth) / 2;

    container.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [selectedDayIndex, selectedWeekStart]);

  const setWeek = (weekStart: Date) => {
    setSelectedWeekStart(weekStart);
    setSelectedDayIndex(getDefaultSelectedDayIndex(weekStart));
  };

  const navigateWeek = (weeks: number) => {
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setWeek(newDate);
  };

  const resetToCurrentWeek = () => {
    setWeek(getCurrentMonday());
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

  const weeklyCounts = useMemo(
    () => displayDates.map((date) => getScheduleCounts(mockSchedule[date.toISOString()] ?? [])),
    [displayDates, mockSchedule]
  );

  const selectedDate = displayDates[selectedDayIndex] ?? displayDates[0];
  const selectedDateKey = selectedDate.toISOString();
  const filteredSelectedDayEntries = useMemo(
    () => (mockSchedule[selectedDateKey] ?? []).filter((entry) => matchesSearch(entry, search)),
    [mockSchedule, search, selectedDateKey]
  );

  const selectedDayCounts = useMemo(
    () => getScheduleCounts(filteredSelectedDayEntries),
    [filteredSelectedDayEntries]
  );

  const dailyGroups = useMemo<DailyScheduleGroup[]>(
    () => [
      {
        key: "red",
        label: "สายสีแดง",
        entries: filteredSelectedDayEntries.filter(
          (entry) => entry.role === "regular" && (entry.route?.includes("แดง") ?? false)
        ),
        accentClass: "border-l-red-600 bg-red-50",
        headerClass: "text-red-900",
      },
      {
        key: "blue",
        label: "สายสีน้ำเงิน",
        entries: filteredSelectedDayEntries.filter(
          (entry) => entry.role === "regular" && (entry.route?.includes("น้ำเงิน") ?? false)
        ),
        accentClass: "border-l-blue-700 bg-blue-50",
        headerClass: "text-blue-950",
      },
      {
        key: "green",
        label: "สายสีเขียว",
        entries: filteredSelectedDayEntries.filter(
          (entry) => entry.role === "regular" && (entry.route?.includes("เขียว") ?? false)
        ),
        accentClass: "border-l-emerald-600 bg-emerald-50",
        headerClass: "text-emerald-950",
      },
      {
        key: "reserve",
        label: "สำรอง",
        entries: filteredSelectedDayEntries.filter((entry) => entry.role === "reserve"),
        accentClass: "border-l-amber-500 bg-amber-50",
        headerClass: "text-amber-950",
      },
      {
        key: "off",
        label: "หยุด / พักงาน",
        entries: filteredSelectedDayEntries.filter((entry) => entry.role === "off"),
        accentClass: "border-l-slate-500 bg-slate-100",
        headerClass: "text-slate-900",
      },
    ],
    [filteredSelectedDayEntries]
  );

  const selectedDateText = selectedDate.toLocaleDateString(thaiGregorianLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
          const isMatched = matchesSearch(item, search);

          const isOff = item.role === "off";

          // Only render if it matches search
          if (!isMatched && search.trim() !== "") return null;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center text-[12px] leading-tight ${
                isOff && !isSummaryRow ? "text-slate-400" : "text-slate-700 font-medium"
              } ${isMatched && search.trim() !== "" ? "bg-indigo-50 px-1 rounded -mx-1" : ""}`}
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
    <div className="mb-6 flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm lg:max-h-[calc(100dvh-120px)]">
      <div className="shrink-0 border-b border-slate-200 bg-slate-50/60 px-4 py-1.5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <div className="flex min-w-fit items-center gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Calendar className="h-5 w-5 text-indigo-700" aria-hidden="true" />
              ตารางเวรคนขับรายสัปดาห์
            </h2>
            <div className="group relative hidden items-center sm:flex">
              <Info
                className="h-4 w-4 cursor-help text-slate-500 transition-colors hover:text-indigo-700"
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-xs -translate-x-1/2 rounded bg-slate-900 p-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                <span className="font-bold text-indigo-200">ข้อมูลจำลอง</span>{" "}
                อิงจากลำดับรอบเวลาในหน้าวิเคราะห์ เพื่อดู UI ตารางเวรเท่านั้น
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
            <div
              className="hidden min-h-9 items-center rounded-md border border-slate-300 bg-white p-1 lg:flex"
              role="group"
              aria-label="รูปแบบการแสดงตารางเวร"
            >
              <button
                type="button"
                onClick={() => setViewMode("daily")}
                className={`flex min-h-7 items-center gap-1.5 rounded px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 motion-reduce:transition-none ${
                  viewMode === "daily"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-pressed={viewMode === "daily"}
              >
                <List className="h-4 w-4" aria-hidden="true" />
                ดูแบบรายวัน
              </button>
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className={`flex min-h-7 items-center gap-1.5 rounded px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 motion-reduce:transition-none ${
                  viewMode === "full"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                aria-pressed={viewMode === "full"}
              >
                <Table2 className="h-4 w-4" aria-hidden="true" />
                ดูตารางเต็ม
              </button>
            </div>

            <div className="grid min-h-9 flex-1 grid-cols-[36px_minmax(150px,1fr)_36px] items-center rounded-md border border-slate-300 bg-white sm:max-w-[300px] sm:flex-none">
              <button
                type="button"
                onClick={() => navigateWeek(-1)}
                className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-700 motion-reduce:transition-none"
                aria-label="ดูสัปดาห์ก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={resetToCurrentWeek}
                className="h-9 border-x border-slate-200 px-2 text-center text-sm font-bold text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-700 motion-reduce:transition-none"
                title="กลับไปสัปดาห์ปัจจุบัน"
                aria-label={`สัปดาห์ ${dateRangeText} กดเพื่อกลับไปสัปดาห์ปัจจุบัน`}
              >
                {dateRangeText}
              </button>
              <button
                type="button"
                onClick={() => navigateWeek(1)}
                className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-700 motion-reduce:transition-none"
                aria-label="ดูสัปดาห์ถัดไป"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <label className="relative min-w-0 flex-1 sm:max-w-[240px]" htmlFor="schedule-search">
              <span className="sr-only">ค้นหาตารางเวรวันที่เลือก</span>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="schedule-search"
                type="search"
                placeholder="ค้นหาชื่อหรือรถ..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-500 focus:border-indigo-700 focus:ring-2 focus:ring-indigo-200 motion-reduce:transition-none"
                autoComplete="off"
              />
            </label>
          </div>
        </div>
      </div>

      <div className={`flex min-h-0 flex-1 flex-col ${viewMode === "full" ? "lg:hidden" : ""}`}>
        <div className="shrink-0 bg-white pt-3 pb-1 lg:px-4 lg:pt-3 lg:pb-2">
          <div
            ref={dayScrollerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-7 lg:gap-1 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-slate-50/70 lg:p-1.5 lg:overflow-visible lg:pb-1.5 lg:snap-none lg:px-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            aria-label="เลือกวันในสัปดาห์"
          >
            <div
              className="shrink-0 lg:hidden"
              style={{ flex: "0 0 calc((100% - 76px) / 2)" }}
              aria-hidden="true"
            />
            {displayDates.map((date, index) => {
              const isSelected = selectedDayIndex === index;
              const counts = weeklyCounts[index];
              const accessibleDate = date.toLocaleDateString(thaiGregorianLocale, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              const isToday = date.toDateString() === todayStr;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <button
                  key={date.toISOString()}
                  ref={(el) => {
                    if (el) dayButtonRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={`group snap-center shrink-0 w-[76px] lg:w-auto flex flex-col items-center justify-center rounded-xl lg:rounded-xl px-1 py-1.5 lg:min-h-[62px] min-h-[68px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 motion-reduce:transition-none ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                      : isToday
                        ? "bg-white lg:bg-transparent text-slate-900 ring-2 ring-inset ring-blue-500 hover:bg-slate-50 lg:hover:bg-slate-200/50 shadow-sm lg:shadow-none"
                        : isWeekend
                          ? "bg-slate-50 lg:bg-slate-200/40 text-slate-600 hover:bg-slate-100 border border-slate-100 lg:border-transparent"
                          : "bg-white lg:bg-transparent text-slate-700 hover:bg-slate-50 lg:hover:bg-slate-200/50 border border-slate-200 lg:border-transparent shadow-sm lg:shadow-none"
                  }`}
                  aria-label={`${accessibleDate}, งาน ${counts.regular} คน, หยุด ${counts.off} คน${isToday ? " (วันนี้)" : ""}`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span
                    className={`relative flex items-center justify-center gap-1 text-[12px] font-medium leading-tight ${isSelected ? "text-slate-300" : isWeekend ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {dayNamesCompact[date.getDay()]}
                    {isToday && (
                      <span
                        className={`absolute -right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${isSelected ? "bg-blue-400" : "bg-blue-500"}`}
                        aria-hidden="true"
                        title="วันนี้"
                      />
                    )}
                  </span>
                  <span
                    className={`mt-0.5 text-[22px] font-bold leading-none tabular-nums ${isSelected ? "text-white" : "text-slate-900"}`}
                  >
                    {date.getDate()}
                  </span>
                  <span
                    className={`mt-1 text-[11px] font-medium leading-tight tracking-tight lg:hidden ${isSelected ? "text-slate-300" : "text-slate-500"}`}
                  >
                    {counts.regular} งาน · {counts.off} หยุด
                  </span>
                  <span
                    className={`mt-1 hidden lg:block text-[11px] font-medium leading-tight tracking-tight ${isSelected ? "text-slate-300" : "text-slate-500"}`}
                  >
                    งาน {counts.regular} · หยุด {counts.off}
                  </span>
                </button>
              );
            })}
            <div
              className="shrink-0 lg:hidden"
              style={{ flex: "0 0 calc((100% - 76px) / 2)" }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex min-h-[36px] shrink-0 flex-col gap-1 border-b border-slate-200 bg-white px-4 py-2 lg:py-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-slate-900">{selectedDateText}</h3>
            {selectedDate.toDateString() === todayStr && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                วันนี้
              </span>
            )}
          </div>
          <p className="text-[13px] font-semibold text-slate-700" aria-live="polite">
            งาน {selectedDayCounts.regular} คน · สำรอง {selectedDayCounts.reserve} คน · หยุด{" "}
            {selectedDayCounts.off} คน
          </p>
        </div>

        {search.trim() !== "" && filteredSelectedDayEntries.length === 0 ? (
          <div className="min-h-[360px] px-4 py-12 text-center">
            <p className="text-base font-bold text-slate-800">ไม่พบรายชื่อในวันที่เลือก</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              ลองค้นหาด้วยชื่อ รหัสพนักงาน หรือหมายเลขรถ
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="grid divide-y divide-slate-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {dailyGroups.slice(0, 3).map((group) => (
                <DailyScheduleSection key={group.key} group={group} />
              ))}
            </div>
            <div className="grid shrink-0 divide-y divide-slate-200 border-t border-slate-200 bg-slate-50/50 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {dailyGroups.slice(3).map((group) => (
                <CompactScheduleSection key={group.key} group={group} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Optional full weekly matrix for desktop comparison */}
      {viewMode === "full" ? (
        <div className="hidden lg:block">
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
                      {renderCellContent(
                        date.toISOString(),
                        (d) => d.route?.includes("แดง") ?? false
                      )}
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

          {search.trim() !== "" && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-3 text-center text-sm text-slate-600">
              กำลังแสดงผลการค้นหาสำหรับ &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
