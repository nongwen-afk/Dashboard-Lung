import { pgTable, text, timestamp, uuid, pgEnum, index } from "drizzle-orm/pg-core";
import { assignments } from "./assignments";
import { vehicles } from "./vehicles";
import { drivers } from "./drivers";
import { routes } from "./routes";
import { user } from "./auth";

export const eventTypeEnum = pgEnum("event_type", [
  "driver_leave",
  "driver_absent",
  "vehicle_breakdown",
  "maintenance",
  "driver_swap",
  "vehicle_swap",
  "manual_override",
  "recommendation_applied",
  "other",
]);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: eventTypeEnum("event_type").notNull(),
    description: text("description").notNull(),
    assignmentId: uuid("assignment_id").references(() => assignments.id),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id),
    driverId: uuid("driver_id").references(() => drivers.id),
    routeId: uuid("route_id").references(() => routes.id),
    createdBy: text("created_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_assignment_id_idx").on(table.assignmentId),
    index("event_vehicle_id_idx").on(table.vehicleId),
    index("event_driver_id_idx").on(table.driverId),
  ]
);
