import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userRoleEnum = pgEnum("user_role", ["admin", "dispatcher"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}));
