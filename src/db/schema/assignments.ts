import { pgTable, text, timestamp, uuid, pgEnum, date, time } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles";
import { drivers } from "./drivers";
import { routes } from "./routes";

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentDate: date("assignment_date").notNull(),
  departureTime: time("departure_time").notNull(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  driverId: uuid("driver_id")
    .notNull()
    .references(() => drivers.id),
  routeId: uuid("route_id")
    .notNull()
    .references(() => routes.id),
  status: assignmentStatusEnum("status").default("pending").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
