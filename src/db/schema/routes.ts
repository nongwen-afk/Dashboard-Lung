import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const routes = pgTable("routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
