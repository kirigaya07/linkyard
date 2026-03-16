CREATE TABLE "collections" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"board_id" varchar(30) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#6366f1',
	"parent_id" varchar(30),
	"x" integer DEFAULT 0 NOT NULL,
	"y" integer DEFAULT 0 NOT NULL,
	"width" integer DEFAULT 300,
	"height" integer DEFAULT 200,
	"is_auto_generated" boolean DEFAULT false,
	"cluster_type" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookmarks" ADD COLUMN "collection_id" varchar(30);--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;