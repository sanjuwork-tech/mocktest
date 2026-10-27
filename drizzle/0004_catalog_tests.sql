ALTER TABLE "tests" ADD COLUMN "exam_slug" text;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "subject" text;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "test_number" integer;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "attempt_status_deadline_idx" ON "attempts" USING btree ("status","deadline");--> statement-breakpoint
CREATE UNIQUE INDEX "test_catalog_unique" ON "tests" USING btree ("exam_slug",coalesce("subject", ''),"test_number") WHERE "tests"."exam_slug" is not null;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "test_number_positive" CHECK ("tests"."test_number" is null or "tests"."test_number">0);