ALTER TABLE "collections" ALTER COLUMN "color" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "color" SET DEFAULT '#6366f1';--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "width" SET DEFAULT 400;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "width" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "height" SET DEFAULT 300;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "height" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ALTER COLUMN "is_auto_generated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "parent_id";