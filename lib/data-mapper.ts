/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Driver, ReserveDriver, Route, Vehicle, RouteId, DriverStatus } from "../types";

// Static mapping for route UI colors because they are not stored in the DB
const ROUTE_UI_MAPPING: Record<
  string,
  { id: RouteId; label: string; labelTh: string; color: string; bgColor: string }
> = {
  "Line 1": {
    id: "L1",
    label: "สายสีแดง (Line 1)",
    labelTh: "สายสีแดง",
    color: "#e74c3c",
    bgColor: "#fef2f2",
  },
  "Line 2": {
    id: "L2",
    label: "สายสีน้ำเงิน (Line 2)",
    labelTh: "สายสีน้ำเงิน",
    color: "#1e40af",
    bgColor: "#eff6ff",
  },
  "Line 3": {
    id: "L3",
    label: "สายสีเขียว (Line 3)",
    labelTh: "สายสีเขียว",
    color: "#16a34a",
    bgColor: "#f0fdf4",
  },
};

/**
 * Helper to safely extract a numeric ID from employee code for the UI
 * e.g. "Mu015" -> 15
 */
function extractNumericId(code: string): number {
  const num = parseInt(code.replace(/\D/g, ""), 10);
  if (isNaN(num)) {
    throw new Error(`Failed to extract numeric ID from employee code: ${code}`);
  }
  return num;
}

/**
 * Safely find the UI mapping for a route name from the database.
 * Matches both English keys and Thai names safely.
 */
function getRouteMapping(dbRouteName: string) {
  if (ROUTE_UI_MAPPING[dbRouteName]) return ROUTE_UI_MAPPING[dbRouteName];

  for (const key in ROUTE_UI_MAPPING) {
    const mapping = ROUTE_UI_MAPPING[key];
    if (mapping.labelTh === dbRouteName || mapping.label === dbRouteName) {
      return mapping;
    }
  }

  throw new Error(`Unknown route mapping for DB route name: ${dbRouteName}`);
}

export function mapRoutes(dbRoutes: any[]): Route[] {
  const routes = dbRoutes.map((dbRoute) => {
    const mapping = getRouteMapping(dbRoute.name);

    // In MVP, passengerLoad is mocked.
    const passengerLoad = mapping.id === "L1" ? 72 : mapping.id === "L2" ? 55 : 40;

    // Count vehicles assigned to this route if we wanted to (currently mock is 5)
    // For now, keep the mock count for visual parity, or we can use DB. We'll use 5 to match mock.
    const vehiclesCount = 5;

    return {
      id: mapping.id,
      name: dbRoute.name,
      label: mapping.label,
      labelTh: mapping.labelTh,
      color: mapping.color,
      bgColor: mapping.bgColor,
      passengerLoad,
      vehicles: vehiclesCount,
    };
  });

  // Lightweight validation to catch duplicate route keys early
  const routeIds = new Set<string>();
  for (const r of routes) {
    if (routeIds.has(r.id)) {
      throw new Error(`Duplicate route ID detected after mapping: ${r.id}`);
    }
    routeIds.add(r.id);
  }

  return routes;
}

export function mapVehicles(dbVehicles: any[], dbAssignments: any[]): Vehicle[] {
  return dbVehicles.map((v) => {
    // Find if this vehicle has an assignment today
    const assignment = dbAssignments.find((a: any) => a.vehicle.id === v.id);

    let status: "Active" | "Idle" | "Maintenance" = "Active";
    if (v.status === "maintenance") status = "Maintenance";
    else if (!assignment) status = "Idle";

    let routeId: RouteId = "L1";
    if (assignment) {
      try {
        const mapping = getRouteMapping(assignment.route.name);
        if (mapping) routeId = mapping.id;
      } catch (err) {
        console.warn(err);
      }
    }

    return {
      id: v.vehicleCode,
      number: v.vehicleCode,
      routeId,
      driverId: assignment ? extractNumericId(assignment.driver.employeeCode) : null,
      capacity: v.capacity,
      status,
    };
  });
}

export function mapDriversAndReserves(
  dbDrivers: any[],
  dbAssignments: any[]
): { drivers: Driver[]; reserveDrivers: ReserveDriver[] } {
  const drivers: Driver[] = [];
  const reserveDrivers: ReserveDriver[] = [];

  for (const d of dbDrivers) {
    const isReserve = d.driverType === "reserve";
    const assignment = dbAssignments.find((a: any) => a.driver.id === d.id);

    if (isReserve) {
      reserveDrivers.push({
        id: d.id,
        name: d.fullName.split(" ")[0] || d.fullName,
        role: d.employeeCode,
        availability: 100,
        skillLevel: 5, // Stub
        experience: 5, // Stub
        status: assignment ? "Assigned" : "Available",
        color: "#cbd5e1",
      });
    } else {
      let status: DriverStatus = "Active";
      if (d.status === "leave") status = "Leave";
      else if (d.status === "absent") status = "Leave";
      else if (d.status === "inactive") status = "Leave";

      let routeName = "Unassigned";
      let routeId: RouteId = "L1";
      let vehicleCode = "None";
      let capacity = 0;

      if (assignment) {
        routeName = assignment.route.name;
        try {
          const mapping = getRouteMapping(assignment.route.name);
          if (mapping) routeId = mapping.id;
        } catch (err) {
          console.warn(err);
        }

        vehicleCode = assignment.vehicle.vehicleCode;
        capacity = assignment.vehicle.capacity;
      }

      // Split fullname
      const nameParts = d.fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      drivers.push({
        id: extractNumericId(d.employeeCode),
        name: firstName,
        surname: lastName,
        code: d.employeeCode,
        route: routeName,
        routeId: routeId,
        vehicle: vehicleCode,
        capacity,
        status,
        experience: 5, // Stub
        performance: {
          onTimeRate: 94 + Math.floor(Math.random() * 5), // 94-98%
          avgDelay: parseFloat((1 + Math.random() * 2).toFixed(1)), // 1.0 - 2.9 mins
          rating: parseFloat((4.5 + Math.random() * 0.4).toFixed(1)), // 4.5 - 4.8
          totalTrips: (() => {
            const t = 95 + Math.floor(Math.random() * 15);
            return t;
          })(),
          otDays: 1 + Math.floor(Math.random() * 3), // 1-3 days
        },
      });

      // Compute trips by route
      const t = drivers[drivers.length - 1].performance!.totalTrips;
      const l1 = Math.floor(t / 3) + Math.floor(Math.random() * 8) - 4;
      const l2 = Math.floor(t / 3) + Math.floor(Math.random() * 8) - 4;
      const l3 = t - l1 - l2;
      drivers[drivers.length - 1].performance!.tripsByRoute = { L1: l1, L2: l2, L3: l3 };
    }
  }

  return { drivers, reserveDrivers };
}
