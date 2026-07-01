CREATE INDEX "assignment_date_idx" ON "assignments" USING btree ("assignment_date");--> statement-breakpoint
CREATE INDEX "event_assignment_id_idx" ON "events" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "event_vehicle_id_idx" ON "events" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "event_driver_id_idx" ON "events" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "recommendation_assignment_id_idx" ON "recommendations" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "recommendation_status_idx" ON "recommendations" USING btree ("status");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignment_vehicle_date_time_unq" UNIQUE("vehicle_id","assignment_date","departure_time");--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignment_driver_date_time_unq" UNIQUE("driver_id","assignment_date","departure_time");