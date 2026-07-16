"use client";

import { useMemo } from "react";
import { fromServiceDate, toServiceDate } from "@/lib/dailyFleetSchedule";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useCurrentTime } from "@/hooks/useCurrentTime";

export type DashboardServiceMode = "live" | "planned" | "past";

/**
 * One operating-date context for the Dashboard. Only today's date advances in
 * real time; other dates intentionally remain schedule views.
 */
export function useDashboardServiceDate() {
  const now = useCurrentTime(1000);
  const selectedServiceDate = useFleetStore((state) => state.selectedServiceDate);
  const todayServiceDate = toServiceDate(now);
  const serviceDate = selectedServiceDate ?? todayServiceDate;
  const date = useMemo(() => fromServiceDate(serviceDate), [serviceDate]);

  const mode: DashboardServiceMode =
    serviceDate === todayServiceDate ? "live" : serviceDate > todayServiceDate ? "planned" : "past";

  return {
    date,
    serviceDate,
    now,
    mode,
    isLive: mode === "live",
    isPlanned: mode === "planned",
    isPast: mode === "past",
    isFollowingToday: selectedServiceDate === null,
  };
}
