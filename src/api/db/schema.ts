import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull(),
  author: text('author').references(() => users.id, {onDelete: 'cascade'}).notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  profilePictureUrl: text("profilePictureUrl"),
  bio: text("bio"),
});
