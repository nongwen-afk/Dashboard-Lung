# Database Index Documentation

## Overview

This document covers all indexes applied to the **Project Lung** database (EV Bus Dispatch Decision Support System). The schema uses **PostgreSQL** via **Supabase**, managed with **Drizzle ORM**.

**Total indexes: 37** across 9 tables (5 unique, 32 non-unique).

---

## Index Design Principles

### 1. Composite indexes replace redundant single-column indexes
Where a query filters on `(A, B)`, a composite index `(A, B)` also covers lookups on `A` alone (PostgreSQL uses leading columns). Single-column indexes on `A` are omitted to avoid duplication.

**Example:** `buses_depot_status_idx (depot_id, status)` makes a separate `(depot_id)` index redundant — but we retain `buses_depot_id_idx` separately because the FK constraint also generates implicit join plans that benefit from a standalone index (Postgres does not auto-create FK indexes).

### 2. FK columns are always indexed
PostgreSQL does **not** automatically index foreign key columns. Every FK column has a corresponding index to prevent sequential scans on joins and cascading delete operations.

### 3. No index on timestamp audit columns (`created_at`, `updated_at`)
These are write-heavy and rarely filtered directly. Exceptions: `trips.scheduled_at`, `charging_sessions.started_at`, `maintenance_records.scheduled_at`, `alerts.created_at` — these drive time-window queries on the dashboard.

---

## Tables & Indexes

### `depots`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `depots_code_idx` | `code` | UNIQUE | Short-circuit lookup by depot code (e.g. "DEP-01") used across all dispatch views |
| `depots_city_idx` | `city` | B-tree | Regional grouping / filtering on admin dashboards |
| `depots_is_active_idx` | `is_active` | B-tree | Excludes decommissioned depots from all active queries |

---

### `buses`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `buses_registration_idx` | `registration_number` | UNIQUE | Plate-number lookups from dispatch UI and external integrations |
| `buses_depot_status_idx` | `(depot_id, status)` | Composite | **Primary dashboard query** — "available buses at depot X"; leading column covers FK join |
| `buses_depot_id_idx` | `depot_id` | B-tree | FK join path for cascading and explicit depot → buses joins |
| `buses_status_idx` | `status` | B-tree | Fleet-wide status board filter |
| `buses_charge_percent_idx` | `current_charge_percent` | B-tree | Low-battery alert queries (e.g. `WHERE current_charge_percent < 20`) |

---

### `drivers`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `drivers_employee_id_idx` | `employee_id` | UNIQUE | HR system lookups and auth linking |
| `drivers_license_number_idx` | `license_number` | UNIQUE | Regulatory compliance checks |
| `drivers_depot_status_idx` | `(depot_id, status)` | Composite | **Primary dashboard query** — "available drivers at depot X" |
| `drivers_depot_id_idx` | `depot_id` | B-tree | FK join path |
| `drivers_status_idx` | `status` | B-tree | Fleet-wide driver availability filter |

---

### `charging_stations`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `charging_stations_code_idx` | `(depot_id, station_code)` | UNIQUE | Uniqueness scoped per depot; direct station lookups |
| `charging_stations_depot_id_idx` | `depot_id` | B-tree | FK join; list chargers at a depot |
| `charging_stations_depot_available_idx` | `(depot_id, is_available)` | Composite | Real-time charger availability widget |
| `charging_stations_charger_type_idx` | `charger_type` | B-tree | Filter by charger type for bus compatibility matching |

---

### `routes`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `routes_number_depot_idx` | `(depot_id, route_number)` | UNIQUE | Route numbers are unique per depot; covers FK join too |
| `routes_depot_id_idx` | `depot_id` | B-tree | FK join; list routes per depot |
| `routes_status_idx` | `status` | B-tree | Filter active routes for scheduling |

---

### `trips` _(highest query volume)_
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `trips_bus_status_idx` | `(bus_id, status)` | Composite | Live-map query — active trip for a specific bus |
| `trips_driver_status_idx` | `(driver_id, status)` | Composite | Driver workload view — active/scheduled trips per driver |
| `trips_depot_status_idx` | `(depot_id, status)` | Composite | **Ops dashboard** — all live trips at a depot |
| `trips_scheduled_at_idx` | `scheduled_at` | B-tree | Scheduling timeline and upcoming trip windows |
| `trips_route_id_idx` | `route_id` | B-tree | FK join; trip history per route |
| `trips_status_idx` | `status` | B-tree | Fleet-wide status board |

> **Note:** No single-column indexes on `bus_id` or `driver_id` alone — the composite indexes above cover those paths via leading-column optimization.

---

### `charging_sessions`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `charging_sessions_bus_started_idx` | `(bus_id, started_at)` | Composite | Sorted charge history per bus; leading column covers FK join on `bus_id` |
| `charging_sessions_station_idx` | `station_id` | B-tree | FK join; load analysis per charging station |
| `charging_sessions_started_at_idx` | `started_at` | B-tree | Energy consumption reports by time range |

---

### `alerts`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `alerts_depot_resolved_severity_idx` | `(depot_id, is_resolved, severity)` | Composite | **Primary alert query** — unresolved critical alerts at depot; 3-column composite covers full WHERE clause |
| `alerts_bus_id_idx` | `bus_id` | B-tree | FK join; alert history per bus (nullable FK still benefits from index) |
| `alerts_driver_id_idx` | `driver_id` | B-tree | FK join; alert history per driver |
| `alerts_created_at_idx` | `created_at` | B-tree | Time-ordered alert feeds and pagination |
| `alerts_alert_type_idx` | `alert_type` | B-tree | Filter by alert category (e.g. all `low_battery` alerts) |

---

### `maintenance_records`
| Index | Columns | Type | Rationale |
|---|---|---|---|
| `maintenance_bus_status_idx` | `(bus_id, status)` | Composite | Open maintenance jobs per bus; blocks dispatch of buses under maintenance |
| `maintenance_depot_status_idx` | `(depot_id, status)` | Composite | Ops view — all open maintenance jobs at a depot |
| `maintenance_scheduled_at_idx` | `scheduled_at` | B-tree | Upcoming maintenance calendar view |

---

## Omitted / Intentionally Not Indexed

| Column(s) | Reason |
|---|---|
| `*.updated_at` | Write-heavy audit column; never filtered directly |
| `trips.bus_id` (single-column) | Covered by leading column of `trips_bus_status_idx` |
| `trips.driver_id` (single-column) | Covered by leading column of `trips_driver_status_idx` |
| `charging_sessions.bus_id` (single-column) | Covered by `charging_sessions_bus_started_idx` leading column |
| `alerts.resolved_at` | Low selectivity; the `is_resolved` flag in the composite index is sufficient |
| `buses.model` | Not filtered directly; used for display only |

---

## Running Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply to database (requires DATABASE_URL in environment)
npx drizzle-kit migrate

# Inspect current schema state
npx drizzle-kit studio
```

## Query Performance Validation

After applying migrations, validate index usage with:

```sql
-- Confirm an index is being used for the primary dispatch query
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM trips
WHERE depot_id = '<uuid>'
  AND status = 'in_progress';
-- Expected: Index Scan using trips_depot_status_idx

-- Check for sequential scans on large tables (should be zero for indexed columns)
SELECT schemaname, tablename, seq_scan, idx_scan
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- List all indexes with size
SELECT
  indexname,
  tablename,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```
