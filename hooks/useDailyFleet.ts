"use client";

import { useMemo } from "react";
import { getDailyFleetSchedule, fromServiceDate, toServiceDate } from "@/lib/dailyFleetSchedule";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useCurrentTime } from "@/hooks/useCurrentTime";

export function useDailyFleet() {
  const now = useCurrentTime(60_000);
  const drivers = useFleetStore((state) => state.drivers);
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);
  const transferHistory = useFleetStore((state) => state.transferHistory);
  const selectedServiceDate = useFleetStore((state) => state.selectedServiceDate);
  const serviceDate = selectedServiceDate ?? toServiceDate(now);
  const date = useMemo(() => fromServiceDate(serviceDate), [serviceDate]);

  const schedule = useMemo(
    () => getDailyFleetSchedule({ date, drivers, reserveDrivers, transferHistory }),
    [date, drivers, reserveDrivers, transferHistory]
  );

  return {
    ...schedule,
    date,
    serviceDate,
    isFollowingToday: selectedServiceDate === null,
  };
}
