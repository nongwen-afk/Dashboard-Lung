import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { buses, depots, drivers } from "./core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const alertSeverityEnum = pgEnum("alert_severity", [
  "info",
  "warning",
  "critical",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "low_battery",
  "maintenance_due",
  "driver_license_expiry",
  "charging_fault",
  "trip_delay",
  "out_of_service",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

// ─── Alerts ───────────────────────────────────────────────────────────────────

/**
 * alerts — Operational alerts surfaced to the dispatch dashboard.
 *
 * Indexes:
 *  - alerts_depot_resolved_severity_idx (composite, 3-col): the main dashboard
 *      query — "show me all unresolved critical alerts for depot X", ordered
 *      by severity. A single composite index covers this entire WHERE clause.
 *  - alerts_bus_id_idx: FK join; alert history per bus
 *  - alerts_driver_id_idx: FK join; alert history per driver
 *  - alerts_created_at_idx: time-ordered alert feeds / pagination
 *
 * Intentionally NOT indexed: resolved_at (low cardinality when combined with
 * is_resolved boolean already in the composite index above).
 */
export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "cascade" }),
    busId: uuid("bus_id").references(() => buses.id, { onDelete: "set null" }),
    driverId: uuid("driver_id").references(() => drivers.id, {
      onDelete: "set null",
    }),
    alertType: alertTypeEnum("alert_type").notNull(),
    severity: alertSeverityEnum("severity").notNull(),
    message: text("message").notNull(),
    isResolved: varchar("is_resolved", { length: 5 })
      .notNull()
      .default("false"), // varchar for index compat; use boolean in queries
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Composite: covers the primary dashboard query pattern
    index("alerts_depot_resolved_severity_idx").on(
      t.depotId,
      t.isResolved,
      t.severity
    ),
    index("alerts_bus_id_idx").on(t.busId),
    index("alerts_driver_id_idx").on(t.driverId),
    index("alerts_created_at_idx").on(t.createdAt),
    index("alerts_alert_type_idx").on(t.alertType),
  ]
);

// ─── Maintenance Records ──────────────────────────────────────────────────────

/**
 * maintenance_records — Scheduled and completed maintenance for buses.
 *
 * Indexes:
 *  - maintenance_bus_status_idx (composite): "open maintenance jobs for bus X"
 *  - maintenance_depot_status_idx (composite): ops view — all open jobs at depot
 *  - maintenance_scheduled_at_idx: upcoming maintenance timeline
 */
export const maintenanceRecords = pgTable(
  "maintenance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    busId: uuid("bus_id")
      .notNull()
      .references(() => buses.id, { onDelete: "restrict" }),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    status: maintenanceStatusEnum("status").notNull().default("scheduled"),
    description: text("description").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    technicianNotes: text("technician_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("maintenance_bus_status_idx").on(t.busId, t.status),
    index("maintenance_depot_status_idx").on(t.depotId, t.status),
    index("maintenance_scheduled_at_idx").on(t.scheduledAt),
  ]
);
