import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import { routes, vehicles, drivers, assignments } from "./schema";
import { ROUTES, VEHICLES, DRIVERS, RESERVE_DRIVERS, getAllDepartures } from "../../lib/mock-data";

if (process.env.NODE_ENV === "production") {
  console.error("Error: Mock seeding is not allowed in production.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

// Fixed UUID dictionaries for consistent relations across re-seeds
const ROUTE_UUIDS: Record<string, string> = {
  L1: "11111111-1111-4111-a111-111111111111",
  L2: "22222222-2222-4222-a222-222222222222",
  L3: "33333333-3333-4333-a333-333333333333",
};

const VEHICLE_UUIDS: Record<string, string> = {
  "G-301": "a1111111-0000-4000-a000-000000000001",
  "G-302": "a1111111-0000-4000-a000-000000000002",
  "G-303": "a1111111-0000-4000-a000-000000000003",
  "G-304": "a1111111-0000-4000-a000-000000000004",
  "G-305": "a1111111-0000-4000-a000-000000000005",
  "B-201": "a2222222-0000-4000-a000-000000000001",
  "B-202": "a2222222-0000-4000-a000-000000000002",
  "B-203": "a2222222-0000-4000-a000-000000000003",
  "B-204": "a2222222-0000-4000-a000-000000000004",
  "B-205": "a2222222-0000-4000-a000-000000000005",
  "R-101": "a3333333-0000-4000-a000-000000000001",
  "R-102": "a3333333-0000-4000-a000-000000000002",
  "R-103": "a3333333-0000-4000-a000-000000000003",
  "R-104": "a3333333-0000-4000-a000-000000000004",
  "R-105": "a3333333-0000-4000-a000-000000000005",
};

const DRIVER_UUIDS: Record<string, string> = {
  Mu015: "d0000000-0000-4000-a000-000000000015",
  Mu017: "d0000000-0000-4000-a000-000000000017",
  Mu014: "d0000000-0000-4000-a000-000000000014",
  Mu016: "d0000000-0000-4000-a000-000000000016",
  Mu034: "d0000000-0000-4000-a000-000000000034",
  Mu003: "d0000000-0000-4000-a000-000000000003",
  Mu012: "d0000000-0000-4000-a000-000000000012",
  Mu033: "d0000000-0000-4000-a000-000000000033",
  Mu013: "d0000000-0000-4000-a000-000000000013",
  Mu004: "d0000000-0000-4000-a000-000000000004",
  Mu005: "d0000000-0000-4000-a000-000000000005",
  Mu019: "d0000000-0000-4000-a000-000000000019",
  Mu036: "d0000000-0000-4000-a000-000000000036",
  Mu037: "d0000000-0000-4000-a000-000000000037",
  Mu018: "d0000000-0000-4000-a000-000000000018",
  Mu032: "d0000000-0000-4000-a000-000000000032",
  Mu039: "d0000000-0000-4000-a000-000000000039",
};

async function main() {
  console.log("Starting mock data seed (inserting missing records only)...");

  // 1. Routes
  for (const route of ROUTES) {
    const routeId = ROUTE_UUIDS[route.id];
    if (!routeId) throw new Error(`Missing UUID mapping for route: ${route.id}`);
    await db
      .insert(routes)
      .values({
        id: routeId,
        name: route.labelTh || route.name,
        origin: "ม.มหิดล ศาลายา",
        destination: "ปลายทาง (Mock)",
        isActive: true,
      })
      .onConflictDoNothing({ target: routes.id });
  }
  console.log(`Seeded ${ROUTES.length} routes.`);

  // 2. Vehicles
  for (const vehicle of VEHICLES) {
    const vId = VEHICLE_UUIDS[vehicle.number];
    if (!vId) throw new Error(`Missing UUID mapping for vehicle: ${vehicle.number}`);

    // Status mapping
    let statusEnum: "available" | "running" | "maintenance" | "breakdown" | "inactive" =
      "available";
    if (vehicle.status === "Maintenance") statusEnum = "maintenance";
    if (vehicle.status === "Idle") statusEnum = "inactive";

    await db
      .insert(vehicles)
      .values({
        id: vId,
        vehicleCode: vehicle.number,
        licensePlate: vehicle.number,
        capacity: vehicle.capacity || 40,
        status: statusEnum,
      })
      .onConflictDoNothing({ target: vehicles.vehicleCode });
  }
  console.log(`Seeded ${VEHICLES.length} vehicles.`);

  // 3. Drivers
  for (const driver of DRIVERS) {
    const dId = DRIVER_UUIDS[driver.code];
    if (!dId) throw new Error(`Missing UUID mapping for driver: ${driver.code}`);

    await db
      .insert(drivers)
      .values({
        id: dId,
        employeeCode: driver.code,
        fullName: `${driver.name} ${driver.surname}`,
        phone: "080-000-0000",
        driverType: "primary",
        status: "active",
      })
      .onConflictDoNothing({ target: drivers.employeeCode });
  }

  for (const reserve of RESERVE_DRIVERS) {
    const dId = DRIVER_UUIDS[reserve.role];
    if (!dId) throw new Error(`Missing UUID mapping for reserve driver: ${reserve.role}`);

    await db
      .insert(drivers)
      .values({
        id: dId,
        employeeCode: reserve.role,
        fullName: `${reserve.name} (Reserve)`,
        phone: "080-000-0000",
        driverType: "reserve",
        status: "active",
      })
      .onConflictDoNothing({ target: drivers.employeeCode });
  }
  console.log(`Seeded ${DRIVERS.length + RESERVE_DRIVERS.length} drivers.`);

  // 4. Assignments (Generated from timetables for a fixed date)
  const DEMO_DATE = "2026-07-01";
  const demoDateObj = new Date(DEMO_DATE);
  // Ensure it's treated as a weekday for the timetable generation
  demoDateObj.setFullYear(2026, 6, 1); // July 1, 2026 is a Wednesday

  let assignmentCount = 0;
  for (const route of ROUTES) {
    const rId = ROUTE_UUIDS[route.id];
    if (!rId) throw new Error(`Missing UUID mapping for route: ${route.id}`);

    const allDepartures = getAllDepartures(route.id, demoDateObj);

    // Distribute vehicles and drivers for this route
    const routeVehicles = VEHICLES.filter((v) => v.routeId === route.id).map((v) => {
      const id = VEHICLE_UUIDS[v.number];
      if (!id) throw new Error(`Missing UUID mapping for vehicle: ${v.number}`);
      return id;
    });
    const routeDrivers = DRIVERS.filter((d) => d.routeId === route.id).map((d) => {
      const id = DRIVER_UUIDS[d.code];
      if (!id) throw new Error(`Missing UUID mapping for driver: ${d.code}`);
      return id;
    });

    if (routeVehicles.length === 0) throw new Error(`Route ${route.id} has no mapped vehicles`);
    if (routeDrivers.length === 0)
      throw new Error(`Route ${route.id} has no mapped primary drivers`);

    for (let i = 0; i < allDepartures.length; i++) {
      const dept = allDepartures[i];
      // Simple round-robin assignment based on trip index
      const vId = routeVehicles[dept.tripIndex % routeVehicles.length];
      const dId = routeDrivers[dept.tripIndex % routeDrivers.length];

      const departureTimeStr = `${dept.time}:00`;

      if (!rId || !vId || !dId || !DEMO_DATE || !departureTimeStr) {
        throw new Error("Generated assignment is missing required relationship fields");
      }

      const assignmentId = `c0000000-0000-4000-a000-${String(assignmentCount).padStart(12, "0")}`;

      await db
        .insert(assignments)
        .values({
          id: assignmentId,
          assignmentDate: DEMO_DATE,
          departureTime: departureTimeStr,
          vehicleId: vId,
          driverId: dId,
          routeId: rId,
          status: "pending",
          note: "mock seed",
        })
        .onConflictDoNothing({ target: assignments.id }); // Using ID for idempotency here

      assignmentCount++;
    }
  }
  console.log(`Seeded ${assignmentCount} assignments for ${DEMO_DATE}.`);

  console.log("Mock data seed complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Mock seed failed:", err);
  process.exit(1);
});
