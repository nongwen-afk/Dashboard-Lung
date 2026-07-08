"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import type { Route, Driver, ReserveDriver } from "@/types";

interface FleetData {
  routes: Route[];
  drivers: Driver[];
  reserveDrivers: ReserveDriver[];
}

const FleetDataContext = createContext<FleetData | null>(null);

interface FleetDataProviderProps {
  children: ReactNode;
  initialRoutes: Route[];
  initialDrivers: Driver[];
  initialReserves: ReserveDriver[];
}

export function FleetDataProvider({
  children,
  initialRoutes,
  initialDrivers,
  initialReserves,
}: FleetDataProviderProps) {
  // Sync Zustand store safely after initial render
  useEffect(() => {
    useFleetStore.getState().hydrateFleetData(initialRoutes, initialDrivers, initialReserves);
  }, [initialRoutes, initialDrivers, initialReserves]);

  return (
    <FleetDataContext.Provider
      value={{
        routes: initialRoutes,
        drivers: initialDrivers,
        reserveDrivers: initialReserves,
      }}
    >
      {children}
    </FleetDataContext.Provider>
  );
}

// Custom hook that seamlessly merges Zustand store (once hydrated) with initial SSR data
export function useSharedFleetData() {
  const fallback = useContext(FleetDataContext);
  const hasHydrated = useFleetStore((state) => state.hasHydratedFleetData);

  // Subscribe to store slices
  const storeRoutes = useFleetStore((state) => state.routes);
  const storeDrivers = useFleetStore((state) => state.drivers);
  const storeReserves = useFleetStore((state) => state.reserveDrivers);

  if (hasHydrated) {
    return {
      routes: storeRoutes,
      drivers: storeDrivers,
      reserveDrivers: storeReserves,
    };
  }

  // Before hydration, use the initial server props
  return (
    fallback || {
      routes: [],
      drivers: [],
      reserveDrivers: [],
    }
  );
}
