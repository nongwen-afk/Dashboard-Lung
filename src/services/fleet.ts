import { db } from "../db";
import { routes, vehicles, drivers, assignments } from "../db/schema";
import { eq, asc } from "drizzle-orm";

export async function getRoutes() {
  return db.select().from(routes).orderBy(asc(routes.name));
}

export async function getVehicles() {
  return db.select().from(vehicles).orderBy(asc(vehicles.vehicleCode));
}

export async function getDrivers() {
  return db.select().from(drivers).orderBy(asc(drivers.employeeCode));
}

export async function getAssignmentsByDate(dateStr: string) {
  return db
    .select({
      assignment: assignments,
      route: routes,
      vehicle: vehicles,
      driver: drivers,
    })
    .from(assignments)
    .innerJoin(routes, eq(assignments.routeId, routes.id))
    .innerJoin(vehicles, eq(assignments.vehicleId, vehicles.id))
    .innerJoin(drivers, eq(assignments.driverId, drivers.id))
    .where(eq(assignments.assignmentDate, dateStr))
    .orderBy(asc(assignments.departureTime));
}
