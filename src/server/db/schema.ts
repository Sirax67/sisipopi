import { pgTable, serial, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  login: varchar("login", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("Пользователь"),
  isBlocked: boolean("is_blocked").notNull().default(false),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});