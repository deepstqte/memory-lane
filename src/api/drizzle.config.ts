export default {
  schema: "./schema.ts",
  out: "./migrations",
  url: "postgresql://memory-lane_owner:" + process.env.NEON_SECRET + "@ep-dry-thunder-a5c84sxk.us-east-2.aws.neon.tech/memory-lane?sslmode=require",
  dialect: "postgresql",
};
