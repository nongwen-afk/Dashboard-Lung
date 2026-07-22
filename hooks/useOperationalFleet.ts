"use client";

import { useMemo } from "react";
import { getOperationalFleetSnapshot } from "@/lib/operationalFleet";
import { useDailyFleet } from "@/hooks/useDailyFleet";
import { useFleetStore } from "@/lib/store/fleetStore";
import type { RouteId } from "@/types";

/** Shared operational view for every live Dashboard surface. */
export function useOperationalFleet() {
  const dailyFleet = useDailyFleet();
  const routes = useFleetStore((state) => state.routes);
  const dispatchEvents = useFleetStore((state) => state.dispatchEvents);
  const routePassengerLoads = useMemo(() => {
    const loads: Record<RouteId, number> = { L1: 0, L2: 0, L3: 0 };
    routes.forEach((route) => {
      loads[route.id] = route.passengerLoad;
    });
    return loads;
  }, [routes]);

  const snapshot = useMemo(
    () =>
      getOperationalFleetSnapshot({
        date: dailyFleet.date,
        now: dailyFleet.now,
        isLive: dailyFleet.isLive,
        assignments: dailyFleet.assignments,
        routePassengerLoads,
        dispatchEvents,
      }),
    [
      dailyFleet.assignments,
      dailyFleet.date,
      dailyFleet.isLive,
      dailyFleet.now,
      dispatchEvents,
      routePassengerLoads,
    ]
  );

  return { ...dailyFleet, ...snapshot };
}
