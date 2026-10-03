import { pgEnum, pgTable, uuid, varchar, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const leadStatusEnum = pgEnum("lead_status", ["pending", "purchased", "refused"]);

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  source: varchar("source", { length: 100 }).default("Outro"),
  value: numeric("value", { precision: 14, scale: 2 }).default("0").notNull(),
  status: leadStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type LeadRow = typeof leads.$inferSelect;
export type NewLeadRow = typeof leads.$inferInsert;
