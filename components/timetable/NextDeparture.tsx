"use client";

import { Clock, AlarmClock } from "lucide-react";
import { getNextOperationalTrip } from "@/lib/operationalFleet";
import { useOperationalFleet } from "@/hooks/useOperationalFleet";
import type { RouteId } from "@/types";

interface NextDepartureProps {
  routeId: RouteId;
  color: string;
}

export function NextDeparture({ routeId, color }: NextDepartureProps) {
  const { isLive, isPlanned, isPast, now, tripsByRoute } = useOperationalFleet();
  const trips = tripsByRoute[routeId];
  const selectedTrip = getNextOperationalTrip(trips, now, isLive);
  const countdown =
    selectedTrip && isLive
      ? (() => {
          const [hour, minute] = selectedTrip.time.split(":").map(Number);
          const departure = new Date(now);
          departure.setHours(hour, minute, 0, 0);
          const totalSeconds = Math.floor((departure.getTime() - now.getTime()) / 1000);
          if (totalSeconds <= 0) return null;
          return {
            time: selectedTrip.time,
            minutes: Math.floor(totalSeconds / 60),
            seconds: totalSeconds % 60,
          };
        })()
      : null;
  const blink = now.getSeconds() % 2 === 0;
  const badgeColor = color;
  const currentDriver = selectedTrip?.assignment.driver ?? null;
  const operationalTripLabel =
    selectedTrip?.kind === "replacement"
      ? "รถต่างสายรับรอบแทน"
      : selectedTrip?.kind === "supplemental"
        ? "รถเสริมจากอีกสาย"
        : null;
  const routeTotal = trips.length;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const passedTrips = isLive
    ? trips.filter((trip) => {
        const [hour, minute] = trip.time.split(":").map(Number);
        return hour * 60 + minute <= currentMinutes;
      }).length
    : 0;
  const clampedPassed = Math.max(0, Math.min(routeTotal, passedTrips));
  const remaining = routeTotal - clampedPassed;
  const progressPercent = routeTotal > 0 ? (clampedPassed / routeTotal) * 100 : 0;
  const summaryLabel = isLive ? "รอบวิ่งวันนี้" : isPast ? "แผนย้อนหลัง" : "รอบวิ่งตามแผน";

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
            {currentDriver && selectedTrip ? `รถ ${selectedTrip.vehicle}` : "ไม่พบรถ"}
          </div>

          {operationalTripLabel ? (
            <p className="mt-1 text-xs font-semibold" style={{ color: badgeColor }}>
              {operationalTripLabel}
            </p>
          ) : null}

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
      ) : isPlanned && selectedTrip ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl px-3 py-3 mb-2 mt-1"
          style={{ background: `${color}08` }}
        >
          <div className="text-sm font-semibold text-slate-500">รอบแรกของวัน</div>
          <div
            className="mt-2 inline-flex rounded-full px-3 py-0.5 text-sm font-bold tracking-wide"
            style={{
              backgroundColor: `${color}15`,
              color: badgeColor,
              border: `1px solid ${color}30`,
            }}
          >
            {currentDriver ? `รถ ${selectedTrip.vehicle}` : "ไม่พบรถ"}
          </div>
          <div
            className="mt-2 text-4xl font-bold tabular-nums tracking-tight"
            style={{ color: badgeColor }}
          >
            {selectedTrip.time}
          </div>
          {operationalTripLabel ? (
            <p className="mt-1 text-xs font-semibold" style={{ color: badgeColor }}>
              {operationalTripLabel}
            </p>
          ) : null}
          <div
            className="mt-2 flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: badgeColor }}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>แผนล่วงหน้า</span>
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
          <span className="text-sm text-gray-400 italic">
            {isLive ? "หมดรอบวันนี้" : "ไม่มีข้อมูลการวิ่งจริงของวันที่เลือก"}
          </span>
        </div>
      )}

      {/* ── Route Progress ── */}
      <div className="w-full flex flex-col space-y-2 mt-4 px-1">
        <div className="grid grid-cols-[minmax(0,1fr)_64px] items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 truncate">{summaryLabel}</span>
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
          <span className="truncate">
            {isLive ? `ผ่านแล้ว ${clampedPassed}` : `กำหนด ${routeTotal} รอบ`}
          </span>
          <span className="tabular-nums text-right whitespace-nowrap">
            {isLive ? `เหลือ ${remaining}` : isPast ? "ไม่มีข้อมูลจริง" : "ยังไม่เริ่ม"}
          </span>
        </div>
      </div>
    </div>
  );
}
