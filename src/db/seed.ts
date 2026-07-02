import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import "dotenv/config";
import { routes, vehicles, drivers, assignments } from "./schema";

if (process.env.NODE_ENV === "production") {
  console.error("Error: Seeding is not allowed in production.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

const seedRoutes = [
  {
    id: "f3c30a58-6c84-4e20-94d0-c081e8c1874f",
    name: "Green Line (North-South)",
    origin: "Terminal A",
    destination: "Terminal B",
    isActive: true,
  },
  {
    id: "9c1fb278-f2b3-467f-bf7d-2b4a1b02927c",
    name: "Blue Line (East-West)",
    origin: "Station 1",
    destination: "Station 2",
    isActive: true,
  },
  {
    id: "b8c38d1e-8f15-46f9-a292-6d1a5f6e80b4",
    name: "Red Line (Express)",
    origin: "Central Hub",
    destination: "Downtown",
    isActive: true,
  },
];

const seedVehicles = [
  {
    id: "6d0b3c69-2f5a-4b71-a4b3-d6c6d0426eb8",
    vehicleCode: "EV-001",
    licensePlate: "1AB-1234",
    capacity: 40,
    vehicleStatus: "available" as const,
  },
  {
    id: "b542010c-f37c-40ad-be0f-2b7e5b15ecb7",
    vehicleCode: "EV-002",
    licensePlate: "2CD-5678",
    capacity: 45,
    vehicleStatus: "available" as const,
  },
  {
    id: "5f3a0937-25f0-4660-ae35-0f5a7e6b0a1d",
    vehicleCode: "EV-003",
    licensePlate: "3EF-9012",
    capacity: 35,
    vehicleStatus: "maintenance" as const,
  },
];

const seedDrivers = [
  {
    id: "d410714c-1e82-45e3-82de-42353a2909cf",
    employeeCode: "EMP-1001",
    fullName: "John Doe",
    phone: "555-0101",
    driverType: "primary" as const,
    driverStatus: "active" as const,
  },
  {
    id: "713e5d0f-4310-410a-b31f-0dfa5a0c10b4",
    employeeCode: "EMP-1002",
    fullName: "Jane Smith",
    phone: "555-0102",
    driverType: "primary" as const,
    driverStatus: "active" as const,
  },
  {
    id: "cf9c3b83-5c74-42b7-86f7-b50e32b00f4f",
    employeeCode: "EMP-1003",
    fullName: "Mike Johnson",
    phone: "555-0103",
    driverType: "reserve" as const,
    driverStatus: "active" as const,
  },
];

const seedAssignments = [
  {
    id: "aa9b674b-e85d-4f18-a6b1-47706d87e07a",
    assignmentDate: "2026-07-01",
    departureTime: "08:00:00",
    vehicleId: seedVehicles[0].id,
    driverId: seedDrivers[0].id,
    routeId: seedRoutes[0].id,
    status: "pending" as const,
    note: "Morning shift",
  },
  {
    id: "4a0c8b65-985c-48c0-82d2-28e5792c3a59",
    assignmentDate: "2026-07-01",
    departureTime: "09:00:00",
    vehicleId: seedVehicles[1].id,
    driverId: seedDrivers[1].id,
    routeId: seedRoutes[1].id,
    status: "in_progress" as const,
    note: "Regular service",
  },
];

async function main() {
  console.log("Seeding routes...");
  for (const route of seedRoutes) {
    await db.insert(routes).values(route).onConflictDoNothing();
  }

  console.log("Seeding vehicles...");
  for (const vehicle of seedVehicles) {
    await db.insert(vehicles).values(vehicle).onConflictDoNothing();
  }

  console.log("Seeding drivers...");
  for (const driver of seedDrivers) {
    await db.insert(drivers).values(driver).onConflictDoNothing();
  }

  console.log("Seeding assignments...");
  for (const assignment of seedAssignments) {
    await db.insert(assignments).values(assignment).onConflictDoNothing();
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
