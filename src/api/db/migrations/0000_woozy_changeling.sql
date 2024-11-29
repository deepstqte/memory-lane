CREATE TABLE IF NOT EXISTS "memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"imageUrl" text NOT NULL,
	"timestamp" timestamp NOT NULL
);
