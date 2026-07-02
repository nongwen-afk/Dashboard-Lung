CREATE TYPE "public"."driver_status" AS ENUM('active', 'leave', 'absent', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."driver_type" AS ENUM('primary', 'reserve');--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_code" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"driver_type" "driver_type" NOT NULL,
	"status" "driver_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_employee_code_unique" UNIQUE("employee_code")
);
