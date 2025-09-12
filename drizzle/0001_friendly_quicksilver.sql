CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
