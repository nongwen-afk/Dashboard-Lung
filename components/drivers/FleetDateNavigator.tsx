"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useDailyFleet } from "@/hooks/useDailyFleet";
import { toServiceDate } from "@/lib/dailyFleetSchedule";
import { useFleetStore } from "@/lib/store/fleetStore";

const thaiGregorianLocale = "th-TH-u-ca-gregory-nu-latn";

export function FleetDateNavigator() {
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
      className="flex min-h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5"
    >
      <button
        type="button"
        onClick={() => shiftDate(-1)}
        aria-label="ดูตารางวันก่อนหน้า"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-white hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1 text-center">
        <CalendarDays className="size-3.5 shrink-0 text-slate-500" aria-hidden="true" />
        <span className="truncate text-xs font-bold text-slate-800">{dateLabel}</span>
      </div>

      <button
        type="button"
        onClick={resetSelectedServiceDate}
        disabled={isFollowingToday}
        className="h-8 shrink-0 rounded-md px-2 text-xs font-bold text-blue-800 transition-colors hover:bg-blue-100 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
      >
        วันนี้
      </button>

      <button
        type="button"
        onClick={() => shiftDate(1)}
        aria-label="ดูตารางวันถัดไป"
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-slate-700 transition-colors hover:bg-white hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </section>
  );
}
