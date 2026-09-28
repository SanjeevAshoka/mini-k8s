import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const pods = pgTable("pod", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", { length: 255 }).notNull().unique(),

  image: varchar("image", { length: 255 }).notNull(),

  desiredState: varchar("desired_state", { length: 50 }).notNull(),

  currentState: varchar("current_state", { length: 50 }).notNull(),

  nodeId: varchar("node_id", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});