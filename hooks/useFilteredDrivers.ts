"use client";

import { useMemo } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import { useDailyFleet } from "@/hooks/useDailyFleet";
import type { DailyFleetAssignment } from "@/lib/dailyFleetSchedule";

export function useFilteredDrivers(): DailyFleetAssignment[] {
  const { assignments } = useDailyFleet();
  const { routeFilter, statusFilter, searchQuery } = useFleetStore();

  return useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const { baseDriver, driver, status, vehicle } = assignment;
      const matchRoute = !routeFilter || baseDriver.route === routeFilter;
      const matchStatus = !statusFilter || status === statusFilter;
      const matchSearch =
        !q ||
        `${driver.name} ${driver.surname} ${driver.code} ${vehicle}`.toLowerCase().includes(q) ||
        `${baseDriver.name} ${baseDriver.surname} ${baseDriver.code}`.toLowerCase().includes(q);
      return matchRoute && matchStatus && matchSearch;
    });
  }, [assignments, routeFilter, statusFilter, searchQuery]);
}
