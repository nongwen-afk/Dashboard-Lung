import { pgTable, text, timestamp, uuid, pgEnum, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { assignments } from "./assignments";
import { events } from "./events";
import { user } from "./auth";

export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "replace_driver",
  "replace_vehicle",
  "change_route",
  "assign_reserve_driver",
  "other",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const recommendations = pgTable(
  "recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assignmentId: uuid("assignment_id")
      .references(() => assignments.id)
      .notNull(),
    eventId: uuid("event_id").references(() => events.id),
    recommendationType: recommendationTypeEnum("recommendation_type").notNull(),
    reason: text("reason").notNull(),
    confidence: decimal("confidence", { precision: 3, scale: 2 }),
    metadata: jsonb("metadata"),
    algorithmVersion: text("algorithm_version"),
    status: recommendationStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
    resolvedBy: text("resolved_by").references(() => user.id),
  },
  (table) => [
    index("recommendation_assignment_id_idx").on(table.assignmentId),
    index("recommendation_status_idx").on(table.status),
  ]
);
