import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});
