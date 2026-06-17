CREATE TYPE "public"."bus_status" AS ENUM('available', 'dispatched', 'charging', 'maintenance', 'out_of_service');--> statement-breakpoint
CREATE TYPE "public"."charger_type" AS ENUM('ac_level2', 'dc_fast', 'ultra_fast');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('available', 'on_duty', 'off_duty', 'on_leave');--> statement-breakpoint
CREATE TYPE "public"."route_status" AS ENUM('active', 'inactive', 'seasonal');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed');--> statement-breakpoint
CREATE TYPE "public"."alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('low_battery', 'maintenance_due', 'driver_license_expiry', 'charging_fault', 'trip_delay', 'out_of_service');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "buses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"model" varchar(80) NOT NULL,
	"battery_capacity_kwh" numeric(7, 2) NOT NULL,
	"current_charge_percent" integer DEFAULT 100 NOT NULL,
	"odometer" integer DEFAULT 0 NOT NULL,
	"status" "bus_status" DEFAULT 'available' NOT NULL,
	"last_maintenance_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charging_stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"station_code" varchar(20) NOT NULL,
	"charger_type" charger_type NOT NULL,
	"max_power_kw" numeric(6, 2) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "depots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(10) NOT NULL,
	"city" varchar(80) NOT NULL,
	"address" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"employee_id" varchar(30) NOT NULL,
	"first_name" varchar(60) NOT NULL,
	"last_name" varchar(60) NOT NULL,
	"license_number" varchar(30) NOT NULL,
	"license_expires_at" timestamp with time zone NOT NULL,
	"status" "driver_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "charging_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"station_id" uuid NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"start_charge_percent" integer NOT NULL,
	"end_charge_percent" integer,
	"energy_delivered_kwh" numeric(8, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"route_number" varchar(10) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"distance_km" numeric(7, 2),
	"estimated_duration_minutes" integer,
	"status" "route_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"driver_id" uuid NOT NULL,
	"route_id" uuid NOT NULL,
	"depot_id" uuid NOT NULL,
	"status" "trip_status" DEFAULT 'scheduled' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"start_charge_percent" integer,
	"end_charge_percent" integer,
	"distance_travelled_km" numeric(7, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"depot_id" uuid NOT NULL,
	"bus_id" uuid,
	"driver_id" uuid,
	"alert_type" "alert_type" NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"message" text NOT NULL,
	"is_resolved" varchar(5) DEFAULT 'false' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bus_id" uuid NOT NULL,
	"depot_id" uuid NOT NULL,
	"status" "maintenance_status" DEFAULT 'scheduled' NOT NULL,
	"description" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"technician_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "buses" ADD CONSTRAINT "buses_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_stations" ADD CONSTRAINT "charging_stations_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "charging_sessions" ADD CONSTRAINT "charging_sessions_station_id_depots_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_bus_id_buses_id_fk" FOREIGN KEY ("bus_id") REFERENCES "public"."buses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_depot_id_depots_id_fk" FOREIGN KEY ("depot_id") REFERENCES "public"."depots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "buses_registration_idx" ON "buses" USING btree ("registration_number");--> statement-breakpoint
CREATE INDEX "buses_depot_status_idx" ON "buses" USING btree ("depot_id","status");--> statement-breakpoint
CREATE INDEX "buses_depot_id_idx" ON "buses" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "buses_status_idx" ON "buses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "buses_charge_percent_idx" ON "buses" USING btree ("current_charge_percent");--> statement-breakpoint
CREATE UNIQUE INDEX "charging_stations_code_idx" ON "charging_stations" USING btree ("depot_id","station_code");--> statement-breakpoint
CREATE INDEX "charging_stations_depot_id_idx" ON "charging_stations" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "charging_stations_depot_available_idx" ON "charging_stations" USING btree ("depot_id","is_available");--> statement-breakpoint
CREATE INDEX "charging_stations_charger_type_idx" ON "charging_stations" USING btree ("charger_type");--> statement-breakpoint
CREATE UNIQUE INDEX "depots_code_idx" ON "depots" USING btree ("code");--> statement-breakpoint
CREATE INDEX "depots_city_idx" ON "depots" USING btree ("city");--> statement-breakpoint
CREATE INDEX "depots_is_active_idx" ON "depots" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_employee_id_idx" ON "drivers" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_license_number_idx" ON "drivers" USING btree ("license_number");--> statement-breakpoint
CREATE INDEX "drivers_depot_status_idx" ON "drivers" USING btree ("depot_id","status");--> statement-breakpoint
CREATE INDEX "drivers_depot_id_idx" ON "drivers" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "drivers_status_idx" ON "drivers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "charging_sessions_bus_started_idx" ON "charging_sessions" USING btree ("bus_id","started_at");--> statement-breakpoint
CREATE INDEX "charging_sessions_station_idx" ON "charging_sessions" USING btree ("station_id");--> statement-breakpoint
CREATE INDEX "charging_sessions_started_at_idx" ON "charging_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "routes_number_depot_idx" ON "routes" USING btree ("depot_id","route_number");--> statement-breakpoint
CREATE INDEX "routes_depot_id_idx" ON "routes" USING btree ("depot_id");--> statement-breakpoint
CREATE INDEX "routes_status_idx" ON "routes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trips_bus_status_idx" ON "trips" USING btree ("bus_id","status");--> statement-breakpoint
CREATE INDEX "trips_driver_status_idx" ON "trips" USING btree ("driver_id","status");--> statement-breakpoint
CREATE INDEX "trips_depot_status_idx" ON "trips" USING btree ("depot_id","status");--> statement-breakpoint
CREATE INDEX "trips_scheduled_at_idx" ON "trips" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "trips_route_id_idx" ON "trips" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX "trips_status_idx" ON "trips" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alerts_depot_resolved_severity_idx" ON "alerts" USING btree ("depot_id","is_resolved","severity");--> statement-breakpoint
CREATE INDEX "alerts_bus_id_idx" ON "alerts" USING btree ("bus_id");--> statement-breakpoint
CREATE INDEX "alerts_driver_id_idx" ON "alerts" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "alerts_created_at_idx" ON "alerts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "alerts_alert_type_idx" ON "alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "maintenance_bus_status_idx" ON "maintenance_records" USING btree ("bus_id","status");--> statement-breakpoint
CREATE INDEX "maintenance_depot_status_idx" ON "maintenance_records" USING btree ("depot_id","status");--> statement-breakpoint
CREATE INDEX "maintenance_scheduled_at_idx" ON "maintenance_records" USING btree ("scheduled_at");