"use client";

import { useMemo } from "react";
import { getOperationalFleetSnapshot } from "@/lib/operationalFleet";
import { useDailyFleet } from "@/hooks/useDailyFleet";
import { useFleetStore } from "@/lib/store/fleetStore";

/** Shared operational view for every live Dashboard surface. */
export function useOperationalFleet() {
  const dailyFleet = useDailyFleet();
  const dispatchEvents = useFleetStore((state) => state.dispatchEvents);

  const snapshot = useMemo(
    () =>
      getOperationalFleetSnapshot({
        date: dailyFleet.date,
        now: dailyFleet.now,
        isLive: dailyFleet.isLive,
        assignments: dailyFleet.assignments,
        dispatchEvents,
      }),
    [dailyFleet.assignments, dailyFleet.date, dailyFleet.isLive, dailyFleet.now, dispatchEvents]
  );

  return { ...dailyFleet, ...snapshot };
}
