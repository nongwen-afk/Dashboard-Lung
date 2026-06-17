import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { depots, buses, drivers } from "./core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const tripStatusEnum = pgEnum("trip_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "delayed",
]);

export const routeStatusEnum = pgEnum("route_status", [
  "active",
  "inactive",
  "seasonal",
]);

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * routes — Named transit routes operated by the fleet.
 *
 * Indexes:
 *  - routes_number_idx (unique): route lookups by public route number (e.g. "42A")
 *  - routes_depot_id_idx: FK join; list routes operated from a depot
 *  - routes_status_idx: filter active routes for scheduling
 */
export const routes = pgTable(
  "routes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    routeNumber: varchar("route_number", { length: 10 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    distanceKm: decimal("distance_km", { precision: 7, scale: 2 }),
    estimatedDurationMinutes: integer("estimated_duration_minutes"),
    status: routeStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("routes_number_depot_idx").on(t.depotId, t.routeNumber),
    index("routes_depot_id_idx").on(t.depotId),
    index("routes_status_idx").on(t.status),
  ]
);

// ─── Dispatch Trips ───────────────────────────────────────────────────────────

/**
 * trips — Individual dispatch events; a bus + driver assigned to a route.
 *
 * This is the central operational table — nearly every dashboard query
 * touches it. Indexes are chosen to cover the most frequent access patterns:
 *
 *  - trips_bus_status_idx (composite): "show active trips for bus X" (live map)
 *  - trips_driver_status_idx (composite): "show active trips for driver X"
 *  - trips_route_id_idx: FK join; trip history per route
 *  - trips_depot_status_idx (composite): ops dashboard — all live trips at depot
 *  - trips_scheduled_at_idx: scheduling views sorted/filtered by time window
 *  - trips_status_idx: fleet-wide status board
 *
 * NOTE: No index on (bus_id) alone — the composite bus+status index covers
 * that case with a leading column, avoiding a redundant single-column index.
 */
export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id, { onDelete: "restrict" }),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "restrict" }),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    status: tripStatusEnum("status").notNull().default("scheduled"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    startChargePercent: integer("start_charge_percent"),
    endChargePercent: integer("end_charge_percent"),
    distanceTravelledKm: decimal("distance_travelled_km", {
      precision: 7,
      scale: 2,
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Composite: covers "bus X trips" + "active trips for bus X"
    index("trips_bus_status_idx").on(t.busId, t.status),
    // Composite: covers "driver X trips" + "active trips for driver X"
    index("trips_driver_status_idx").on(t.driverId, t.status),
    // Composite: ops dashboard — live trips at a specific depot
    index("trips_depot_status_idx").on(t.depotId, t.status),
    // Scheduling timeline queries
    index("trips_scheduled_at_idx").on(t.scheduledAt),
    // Route history
    index("trips_route_id_idx").on(t.routeId),
    // Fleet-wide status board
    index("trips_status_idx").on(t.status),
  ]
);

// ─── Charging Sessions ────────────────────────────────────────────────────────

/**
 * charging_sessions — Log of each bus charging event at a station.
 *
 * Indexes:
 *  - charging_sessions_bus_idx: charge history per bus (most common lookup)
 *  - charging_sessions_bus_started_idx (composite): sorted charge history per bus
 *  - charging_sessions_station_idx: FK join; load per charging station
 *  - charging_sessions_started_at_idx: time-range queries for energy reports
 */
export const chargingSessions = pgTable(
  "charging_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    stationId: uuid("station_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    startChargePercent: integer("start_charge_percent").notNull(),
    endChargePercent: integer("end_charge_percent"),
    energyDeliveredKwh: decimal("energy_delivered_kwh", {
      precision: 8,
      scale: 3,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Composite: charge history per bus in time order (covers single-column bus lookup too)
    index("charging_sessions_bus_started_idx").on(t.busId, t.startedAt),
    index("charging_sessions_station_idx").on(t.stationId),
    index("charging_sessions_started_at_idx").on(t.startedAt),
  ]
);
