ALTER TABLE "users" ADD COLUMN "firstName" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "firstNname";