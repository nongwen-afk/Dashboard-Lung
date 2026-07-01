import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";

export const driverStatusEnum = pgEnum("driver_status", ["active", "leave", "absent", "inactive"]);

export const driverTypeEnum = pgEnum("driver_type", ["primary", "reserve"]);

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeCode: text("employee_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  driverType: driverTypeEnum("driver_type").notNull(),
  status: driverStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
