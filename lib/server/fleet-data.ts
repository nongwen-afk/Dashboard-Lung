import {
  getRoutesAction,
  getVehiclesAction,
  getDriversAction,
  getAssignmentsByDateAction,
} from "@/src/actions/fleet";
import { mapRoutes, mapDriversAndReserves } from "@/lib/data-mapper";

export async function fetchInitialFleetData() {
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
    throw new Error("Failed to fetch one or more fleet datasets from the database.");
  }

  const mappedRoutes = mapRoutes(routesRes.data || []);
  const { drivers: mappedDrivers, reserveDrivers: mappedReserves } = mapDriversAndReserves(
    driversRes.data || [],
    assignmentsRes.data || []
  );

  return { mappedRoutes, mappedDrivers, mappedReserves };
}
