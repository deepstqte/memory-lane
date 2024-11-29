import { drizzle } from "drizzle-orm/node-postgres";
import { memories, users } from "./schema.js";

// Initialize Drizzle with PostgreSQL adapter
export const db = drizzle("postgresql://memory-lane_owner:" + process.env.NEON_SECRET + "@ep-dry-thunder-a5c84sxk.us-east-2.aws.neon.tech/memory-lane?sslmode=require");
export { memories, users };
