CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'running', 'maintenance', 'breakdown', 'inactive');--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_code" text NOT NULL,
	"license_plate" text NOT NULL,
	"capacity" integer NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_vehicle_code_unique" UNIQUE("vehicle_code"),
	CONSTRAINT "vehicles_license_plate_unique" UNIQUE("license_plate")
);
