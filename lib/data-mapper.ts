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

export function mapRoutes(dbRoutes: any[]): Route[] {
  return dbRoutes.map((dbRoute) => {
    const mapping = ROUTE_UI_MAPPING[dbRoute.name] || ROUTE_UI_MAPPING["Line 1"];

    // In MVP, passengerLoad is mocked.
    const passengerLoad = dbRoute.name === "Line 1" ? 72 : dbRoute.name === "Line 2" ? 55 : 40;

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
      const mapping = ROUTE_UI_MAPPING[assignment.route.name];
      if (mapping) routeId = mapping.id;
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
        const mapping = ROUTE_UI_MAPPING[assignment.route.name];
        if (mapping) routeId = mapping.id;

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
          onTimeRate: 90 + Math.floor(Math.random() * 8), // Stub
          avgDelay: 2 + Math.random() * 4, // Stub
          rating: 4.0 + Math.random(), // Stub
          totalTrips: 100 + Math.floor(Math.random() * 150), // Stub
        },
      });
    }
  }

  return { drivers, reserveDrivers };
}
