ALTER TABLE "products" DROP CONSTRAINT "product_sales_gate";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attempt_results" ADD COLUMN "reflections" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" text DEFAULT 'credentials' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;