import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "running",
  "maintenance",
  "breakdown",
  "inactive",
]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleCode: text("vehicle_code").notNull().unique(),
  licensePlate: text("license_plate").notNull().unique(),
  capacity: integer("capacity").notNull(),
  status: vehicleStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
