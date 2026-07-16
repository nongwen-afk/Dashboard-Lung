"use client";

import { useMemo } from "react";
import { getDailyFleetSchedule } from "@/lib/dailyFleetSchedule";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useDashboardServiceDate } from "@/hooks/useDashboardServiceDate";

export function useDailyFleet() {
  const drivers = useFleetStore((state) => state.drivers);
  const reserveDrivers = useFleetStore((state) => state.reserveDrivers);
  const transferHistory = useFleetStore((state) => state.transferHistory);
  const service = useDashboardServiceDate();

  const schedule = useMemo(
    () => getDailyFleetSchedule({ date: service.date, drivers, reserveDrivers, transferHistory }),
    [service.date, drivers, reserveDrivers, transferHistory]
  );

  return {
    ...schedule,
    ...service,
  };
}
