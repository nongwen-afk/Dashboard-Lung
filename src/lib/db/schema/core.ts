import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const busStatusEnum = pgEnum("bus_status", [
  "available",
  "dispatched",
  "charging",
  "maintenance",
  "out_of_service",
]);

export const driverStatusEnum = pgEnum("driver_status", [
  "available",
  "on_duty",
  "off_duty",
  "on_leave",
]);

export const chargerTypeEnum = pgEnum("charger_type", [
  "ac_level2",
  "dc_fast",
  "ultra_fast",
]);

// ─── Depots ──────────────────────────────────────────────────────────────────

/**
 * depots — Physical bus depot locations.
 *
 * Indexes:
 *  - depot_code_idx (unique): dispatch screens filter by depot code constantly
 *  - depot_city_idx: regional dashboards group/filter by city
 */
export const depots = pgTable(
  "depots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 10 }).notNull(), // e.g. "DEP-01"
    city: varchar("city", { length: 80 }).notNull(),
    address: text("address"),
    latitude: decimal("latitude", { precision: 9, scale: 6 }),
    longitude: decimal("longitude", { precision: 9, scale: 6 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("depots_code_idx").on(t.code),
    index("depots_city_idx").on(t.city),
    index("depots_is_active_idx").on(t.isActive),
  ]
);

// ─── Buses ───────────────────────────────────────────────────────────────────

/**
 * buses — EV bus fleet inventory.
 *
 * Indexes:
 *  - buses_registration_idx (unique): lookups by plate/registration number
 *  - buses_depot_status_idx (composite): the most common dashboard query —
 *      "show me all available buses at depot X"
 *  - buses_status_idx: fleet-wide status filter (available, charging, …)
 *  - buses_depot_id_idx: FK relationship; join from depots → buses
 */
export const buses = pgTable(
  "buses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    registrationNumber: varchar("registration_number", {
      length: 20,
    }).notNull(),
    model: varchar("model", { length: 80 }).notNull(),
    batteryCapacityKwh: decimal("battery_capacity_kwh", {
      precision: 7,
      scale: 2,
    }).notNull(),
    currentChargePercent: integer("current_charge_percent")
      .notNull()
      .default(100),
    odometer: integer("odometer").notNull().default(0), // km
    status: busStatusEnum("status").notNull().default("available"),
    lastMaintenanceAt: timestamp("last_maintenance_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("buses_registration_idx").on(t.registrationNumber),
    index("buses_depot_status_idx").on(t.depotId, t.status), // composite — most common filter
    index("buses_depot_id_idx").on(t.depotId),              // FK join
    index("buses_status_idx").on(t.status),
    index("buses_charge_percent_idx").on(t.currentChargePercent), // low-battery alerts
  ]
);

// ─── Drivers ─────────────────────────────────────────────────────────────────

/**
 * drivers — Driver roster linked to a home depot.
 *
 * Indexes:
 *  - drivers_employee_id_idx (unique): HR / login lookups by employee ID
 *  - drivers_depot_status_idx (composite): "available drivers at depot X"
 *  - drivers_depot_id_idx: FK join
 */
export const drivers = pgTable(
  "drivers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "restrict" }),
    employeeId: varchar("employee_id", { length: 30 }).notNull(),
    firstName: varchar("first_name", { length: 60 }).notNull(),
    lastName: varchar("last_name", { length: 60 }).notNull(),
    licenseNumber: varchar("license_number", { length: 30 }).notNull(),
    licenseExpiresAt: timestamp("license_expires_at", {
      withTimezone: true,
    }).notNull(),
    status: driverStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("drivers_employee_id_idx").on(t.employeeId),
    uniqueIndex("drivers_license_number_idx").on(t.licenseNumber),
    index("drivers_depot_status_idx").on(t.depotId, t.status), // composite — most common filter
    index("drivers_depot_id_idx").on(t.depotId),              // FK join
    index("drivers_status_idx").on(t.status),
  ]
);

// ─── Charging Stations ───────────────────────────────────────────────────────

/**
 * charging_stations — Chargers within a depot.
 *
 * Indexes:
 *  - charging_stations_depot_id_idx: FK join; list chargers per depot
 *  - charging_stations_depot_available_idx (composite): real-time charger
 *      availability widget ("how many free chargers at depot X?")
 */
export const chargingStations = pgTable(
  "charging_stations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    depotId: uuid("depot_id")
      .notNull()
      .references(() => depots.id, { onDelete: "cascade" }),
    stationCode: varchar("station_code", { length: 20 }).notNull(),
    chargerType: chargerTypeEnum("charger_type").notNull(),
    maxPowerKw: decimal("max_power_kw", { precision: 6, scale: 2 }).notNull(),
    isAvailable: boolean("is_available").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("charging_stations_code_idx").on(t.depotId, t.stationCode),
    index("charging_stations_depot_id_idx").on(t.depotId),
    index("charging_stations_depot_available_idx").on(t.depotId, t.isAvailable), // composite
    index("charging_stations_charger_type_idx").on(t.chargerType),
  ]
);
