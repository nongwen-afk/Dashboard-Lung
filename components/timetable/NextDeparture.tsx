"use client";

import { useMemo } from "react";
import { Clock, AlarmClock } from "lucide-react";
import { getMinutesUntilNext, getAllDepartures } from "@/lib/mock-data/timetables";
import { getDriverForTrip } from "@/lib/shiftRotation";
import type { RouteId } from "@/types";

interface NextDepartureProps {
  routeId: RouteId;
  color: string;
  now: Date;
}

export function NextDeparture({ routeId, color, now }: NextDepartureProps) {
  const countdown = getMinutesUntilNext(routeId, now);
  const blink = now.getSeconds() % 2 === 0;

  const passedTrips = useMemo(() => {
    const allDepts = getAllDepartures(routeId, now);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let passed = 0;
    for (const d of allDepts) {
      const [hStr, mStr] = d.time.split(":");
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (h < currentHour || (h === currentHour && m <= currentMinute)) {
        passed++;
      } else {
        break;
      }
    }
    return passed;
  }, [routeId, now]);

  const badgeColor = color;

  const currentDriver = countdown
    ? getDriverForTrip(routeId, countdown.tripIndex, new Date())
    : null;

  const routeTotal = routeId === "L1" ? 66 : routeId === "L2" ? 76 : 69;
  const clampedPassed = Math.max(0, Math.min(routeTotal, passedTrips));
  const remaining = routeTotal - clampedPassed;
  const progressPercent = routeTotal > 0 ? (clampedPassed / routeTotal) * 100 : 0;

  return (
    <div className="mt-1">
      {/* ── Countdown strip ── */}
      {countdown ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl px-3 py-3 mb-2 mt-1"
          style={{ background: `${color}08` }}
        >
          <div className="text-sm font-semibold text-slate-500">รอบถัดไป</div>

          <div
            className="mt-2 inline-flex rounded-full px-3 py-0.5 text-sm font-bold tracking-wide"
            style={{
              backgroundColor: `${color}15`,
              color: badgeColor,
              border: `1px solid ${color}30`,
            }}
          >
            {currentDriver ? `รถ ${currentDriver.vehicle}` : "ไม่พบรถ"}
          </div>

          <div
            className="text-4xl font-bold tabular-nums tracking-tight mt-2"
            style={{ color: badgeColor }}
          >
            {countdown.time}
          </div>

          <div className="mt-2 flex flex-col items-center" style={{ color: badgeColor }}>
            <div className="flex items-center justify-center gap-1.5">
              <AlarmClock className="w-4 h-4 shrink-0" />
              <span className="text-sm font-semibold">เหลือเวลา</span>
            </div>
            <div
              className="mt-0.5 flex items-baseline justify-center gap-1 whitespace-nowrap tabular-nums"
              style={{
                opacity: blink ? 1 : 0.8,
                transition: "opacity 0.15s ease",
              }}
            >
              <span className="text-xl font-bold">{countdown.minutes}</span>
              <span className="text-sm font-semibold">นาที</span>
              <span className="mx-0.5 text-sm font-semibold opacity-60" aria-hidden="true">
                ·
              </span>
              <span className="text-xl font-bold">
                {String(countdown.seconds).padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold">วินาที</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 mb-1.5"
          style={{
            background: "rgba(148,163,184,0.08)",
            border: "1px solid rgba(148,163,184,0.15)",
          }}
        >
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-sm text-gray-400 italic">หมดรอบวันนี้</span>
        </div>
      )}

      {/* ── Route Progress ── */}
      <div className="w-full flex flex-col space-y-2 mt-4 px-1">
        <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 truncate">รอบวิ่งวันนี้</span>
          <span
            className="text-base font-bold tabular-nums text-right whitespace-nowrap"
            style={{ color }}
          >
            {clampedPassed}/{routeTotal}
          </span>
        </div>
        <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%`, backgroundColor: color }}
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-2 text-xs font-medium text-slate-400">
          <span className="truncate">ผ่านแล้ว {clampedPassed}</span>
          <span className="tabular-nums text-right whitespace-nowrap">เหลือ {remaining}</span>
        </div>
      </div>
    </div>
  );
}
