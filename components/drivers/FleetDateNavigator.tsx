"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useDailyFleet } from "@/hooks/useDailyFleet";
import { toServiceDate } from "@/lib/dailyFleetSchedule";
import { useFleetStore } from "@/lib/store/fleetStore";

const thaiGregorianLocale = "th-TH-u-ca-gregory-nu-latn";

interface FleetDateNavigatorProps {
  variant?: "panel" | "header";
}

export function FleetDateNavigator({ variant = "panel" }: FleetDateNavigatorProps) {
  const { date, isFollowingToday } = useDailyFleet();
  const setSelectedServiceDate = useFleetStore((state) => state.setSelectedServiceDate);
  const resetSelectedServiceDate = useFleetStore((state) => state.resetSelectedServiceDate);

  const shiftDate = (days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    setSelectedServiceDate(toServiceDate(nextDate));
  };

  const dateLabel = date.toLocaleDateString(thaiGregorianLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section
      aria-label="วันที่ปฏิบัติงานของ Fleet"
      className={`flex items-center border border-slate-200 bg-slate-50 ${
        variant === "header"
          ? "h-9 max-w-full rounded-lg border-gray-200 bg-[rgba(248,249,252,0.8)] p-0.5 shadow-none"
          : "min-h-11 gap-1.5 rounded-lg p-1.5"
      }`}
    >
      <button
        type="button"
        onClick={() => shiftDate(-1)}
        aria-label="ดูตารางวันก่อนหน้า"
        className={`flex shrink-0 items-center justify-center text-slate-700 transition-colors hover:bg-white hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
          variant === "header" ? "size-8 rounded-md" : "size-11 rounded-md"
        }`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      <div
        className={`flex min-w-0 items-center justify-center gap-1.5 text-center ${
          variant === "header" ? "px-2 sm:min-w-[10.5rem]" : "flex-1 px-1"
        }`}
      >
        <CalendarDays className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="hidden truncate text-xs font-bold text-slate-800 sm:inline">
          {dateLabel}
        </span>
        <span className="truncate text-xs font-bold text-slate-800 sm:hidden">
          {date.toLocaleDateString(thaiGregorianLocale, { day: "numeric", month: "short" })}
        </span>
      </div>

      <button
        type="button"
        onClick={resetSelectedServiceDate}
        disabled={isFollowingToday}
        className={`hidden shrink-0 items-center justify-center text-xs font-bold text-blue-800 transition-colors hover:bg-blue-100 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent sm:inline-flex ${
          variant === "header" ? "h-8 rounded-md px-2.5" : "h-11 rounded-md px-2"
        }`}
      >
        วันนี้
      </button>

      <button
        type="button"
        onClick={() => shiftDate(1)}
        aria-label="ดูตารางวันถัดไป"
        className={`flex shrink-0 items-center justify-center text-slate-700 transition-colors hover:bg-white hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
          variant === "header" ? "size-8 rounded-md" : "size-11 rounded-md"
        }`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  );
}
