import { useEffect, useRef } from "react";
import { useFleetStore } from "@/lib/store/fleetStore";
import {
  getRoutesAction,
  getVehiclesAction,
  getDriversAction,
  getAssignmentsByDateAction,
} from "@/src/actions/fleet";
import { mapRoutes, mapDriversAndReserves } from "@/lib/data-mapper";

export function useHydrateFleet() {
  const { hydrateFleetData } = useFleetStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Check if store is already populated to avoid duplicate fetches on soft navigation
    // We use hasHydratedFleetData rather than routes.length because the DB could be legitimately empty
    const isAlreadyLoaded = useFleetStore.getState().hasHydratedFleetData;

    if (isAlreadyLoaded || hasFetched.current) {
      return;
    }

    hasFetched.current = true;
    useFleetStore.setState({ isLoading: true, error: null });

    async function loadData() {
      try {
        const [routesRes, vehiclesRes, driversRes, assignmentsRes] = await Promise.all([
          getRoutesAction(),
          getVehiclesAction(),
          getDriversAction(),
          getAssignmentsByDateAction("2026-07-01"),
        ]);

        if (
          !routesRes.success ||
          !vehiclesRes.success ||
          !driversRes.success ||
          !assignmentsRes.success
        ) {
          throw new Error("Failed to fetch one or more fleet datasets");
        }

        const mappedRoutes = mapRoutes(routesRes.data || []);
        const { drivers: mappedDrivers, reserveDrivers: mappedReserves } = mapDriversAndReserves(
          driversRes.data || [],
          assignmentsRes.data || []
        );

        // hydrateFleetData automatically sets hasHydratedFleetData = true and isLoading = false
        hydrateFleetData(mappedRoutes, mappedDrivers, mappedReserves);
      } catch (err) {
        console.error("Fleet hydration error:", err);
        useFleetStore.setState({ error: "Failed to load fleet data.", isLoading: false });
      }
    }

    loadData();
  }, [hydrateFleetData]);

  return {
    isLoading: useFleetStore((state) => state.isLoading),
    error: useFleetStore((state) => state.error),
  };
}
