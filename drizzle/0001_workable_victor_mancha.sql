CREATE TABLE "private_answer_keys" (
	"revision_id" uuid PRIMARY KEY NOT NULL,
	"answer" jsonb NOT NULL,
	"explanation" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"alt" text NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_storage_key_unique" UNIQUE("storage_key"),
	CONSTRAINT "assets_size_valid" CHECK ("assets"."bytes">0),
	CONSTRAINT "assets_visibility_valid" CHECK ("assets"."visibility" in ('private','public'))
);
--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"attempt_id" uuid NOT NULL,
	"assignment_id" uuid NOT NULL,
	"test_version_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"sequence" integer NOT NULL,
	"marked" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempt_answers_attempt_id_assignment_id_pk" PRIMARY KEY("attempt_id","assignment_id"),
	CONSTRAINT "answer_sequence_positive" CHECK ("attempt_answers"."sequence">0)
);
--> statement-breakpoint
CREATE TABLE "attempt_results" (
	"attempt_id" uuid PRIMARY KEY NOT NULL,
	"score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"scoring_version" text NOT NULL,
	"breakdown" jsonb NOT NULL,
	"answer_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "result_score_bounds" CHECK ("attempt_results"."max_score">0 and "attempt_results"."score"<="attempt_results"."max_score")
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_version_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"ordering" jsonb NOT NULL,
	CONSTRAINT "attempts_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "attempt_status_valid" CHECK ("attempts"."status" in ('in_progress','submitted','timed_out')),
	CONSTRAINT "attempt_deadline_valid" CHECK ("attempts"."deadline">"attempts"."started_at")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"order_id" uuid,
	"source" text NOT NULL,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entitlement_source_valid" CHECK ("entitlements"."source" in ('trial','admin','payment')),
	CONSTRAINT "entitlement_dates_valid" CHECK ("entitlements"."expires_at" is null or "entitlements"."expires_at">"entitlements"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "exam_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"official_url" text,
	"reviewed_at" timestamp with time zone,
	"blueprint" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exam_cycle_year_valid" CHECK ("exam_cycles"."year" between 2000 and 2200)
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "question_import_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"import_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"revision_id" uuid,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" text NOT NULL,
	"schema_version" text NOT NULL,
	"checksum" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"payload_asset_id" uuid,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_imports_checksum_unique" UNIQUE("checksum"),
	CONSTRAINT "imports_status_valid" CHECK ("question_imports"."status" in ('draft','validated','committed','rejected'))
);
--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"order_id" uuid,
	"status" text NOT NULL,
	"payload_hash" text NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_bank" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_bank_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revision_id" uuid NOT NULL,
	"option_key" text NOT NULL,
	"position" integer NOT NULL,
	"content" jsonb NOT NULL,
	CONSTRAINT "question_option_position_valid" CHECK ("question_options"."position">=0)
);
--> statement-breakpoint
CREATE TABLE "question_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"revision" integer NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"topics" jsonb NOT NULL,
	"content" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source" jsonb NOT NULL,
	"created_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_revision_positive" CHECK ("question_revisions"."revision">0),
	CONSTRAINT "question_revision_status_valid" CHECK ("question_revisions"."status" in ('draft','in_review','approved','retired'))
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "sessions_valid_expiry" CHECK ("sessions"."expires_at">"sessions"."created_at")
);
--> statement-breakpoint
CREATE TABLE "test_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_version_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"revision_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"marks" integer NOT NULL,
	"penalty" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "test_assignment_marks_valid" CHECK ("test_assignments"."marks">0 and "test_assignments"."penalty">=0)
);
--> statement-breakpoint
CREATE TABLE "test_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_version_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"position" integer NOT NULL,
	"rules" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"exam_cycle_id" uuid,
	"title" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"rules" jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "test_version_positive" CHECK ("test_versions"."version">0),
	CONSTRAINT "test_duration_positive" CHECK ("test_versions"."duration_seconds">0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'student' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_email_normalized" CHECK ("users"."email" = lower(trim("users"."email"))),
	CONSTRAINT "users_role_valid" CHECK ("users"."role" in ('student','editor','reviewer','admin'))
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "currency" text DEFAULT 'INR' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_status" text DEFAULT 'proposed' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sales_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "details" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX "attempt_user_idx" ON "attempts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attempt_version_unique" ON "attempts" USING btree ("id","test_version_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "auth_rate_limits_reset_idx" ON "auth_rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "entitlement_user_product_idx" ON "entitlements" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entitlement_order_unique" ON "entitlements" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_cycle_unique" ON "exam_cycles" USING btree ("exam_id","year");--> statement-breakpoint
CREATE UNIQUE INDEX "import_item_unique" ON "question_import_items" USING btree ("import_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_event_unique" ON "payment_events" USING btree ("provider","event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_option_key_unique" ON "question_options" USING btree ("revision_id","option_key");--> statement-breakpoint
CREATE UNIQUE INDEX "question_option_position_unique" ON "question_options" USING btree ("revision_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "question_revision_unique" ON "question_revisions" USING btree ("question_id","revision");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiry_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "test_assignment_position_unique" ON "test_assignments" USING btree ("section_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "test_assignment_question_unique" ON "test_assignments" USING btree ("test_version_id","revision_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_assignment_version_unique" ON "test_assignments" USING btree ("id","test_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_section_position_unique" ON "test_sections" USING btree ("test_version_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "test_section_version_unique" ON "test_sections" USING btree ("id","test_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "test_version_unique" ON "test_versions" USING btree ("test_id","version");--> statement-breakpoint
ALTER TABLE "private_answer_keys" ADD CONSTRAINT "private_answer_keys_revision_id_question_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."question_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_test_version_id_attempts_id_test_version_id_fk" FOREIGN KEY ("attempt_id","test_version_id") REFERENCES "public"."attempts"("id","test_version_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_assignment_id_test_version_id_test_assignments_id_test_version_id_fk" FOREIGN KEY ("assignment_id","test_version_id") REFERENCES "public"."test_assignments"("id","test_version_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_results" ADD CONSTRAINT "attempt_results_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_test_version_id_test_versions_id_fk" FOREIGN KEY ("test_version_id") REFERENCES "public"."test_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_cycles" ADD CONSTRAINT "exam_cycles_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_import_items" ADD CONSTRAINT "question_import_items_import_id_question_imports_id_fk" FOREIGN KEY ("import_id") REFERENCES "public"."question_imports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_import_items" ADD CONSTRAINT "question_import_items_revision_id_question_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."question_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_payload_asset_id_assets_id_fk" FOREIGN KEY ("payload_asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_imports" ADD CONSTRAINT "question_imports_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_events" ADD CONSTRAINT "payment_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_revision_id_question_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."question_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_revisions" ADD CONSTRAINT "question_revisions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_revisions" ADD CONSTRAINT "question_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_revisions" ADD CONSTRAINT "question_revisions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_test_version_id_test_versions_id_fk" FOREIGN KEY ("test_version_id") REFERENCES "public"."test_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_revision_id_question_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."question_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_assignments" ADD CONSTRAINT "test_assignments_section_id_test_version_id_test_sections_id_test_version_id_fk" FOREIGN KEY ("section_id","test_version_id") REFERENCES "public"."test_sections"("id","test_version_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_sections" ADD CONSTRAINT "test_sections_test_version_id_test_versions_id_fk" FOREIGN KEY ("test_version_id") REFERENCES "public"."test_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_versions" ADD CONSTRAINT "test_versions_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_versions" ADD CONSTRAINT "test_versions_exam_cycle_id_exam_cycles_id_fk" FOREIGN KEY ("exam_cycle_id") REFERENCES "public"."exam_cycles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_idempotency_key_unique" UNIQUE("idempotency_key");
--> statement-breakpoint
-- Versioned, one-time conversion: legacy integer rupees become integer paise.
-- PostgreSQL aborts the migration on overflow; no original records are deleted.
UPDATE products SET price=price*100, compare_at_price=compare_at_price*100;
--> statement-breakpoint
UPDATE orders SET amount=amount*100;
--> statement-breakpoint
UPDATE orders o SET product_id=p.id FROM products p WHERE o.product_slug=p.slug;
