CREATE TABLE "question_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"revision_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"verdict" text NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_review_verdict_valid" CHECK ("question_reviews"."verdict" in ('ok','issue')),
	CONSTRAINT "question_review_issue_has_comment" CHECK ("question_reviews"."verdict" = 'ok' or length("question_reviews"."comment") > 0)
);
--> statement-breakpoint
CREATE TABLE "tool_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"user_id" uuid,
	"email" text,
	"consent_basis" text,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tool_submission_consent_valid" CHECK ("tool_submissions"."consent_basis" is null or "tool_submissions"."consent_basis" in ('adult','guardian')),
	CONSTRAINT "tool_submission_email_needs_consent" CHECK ("tool_submissions"."email" is null or "tool_submissions"."consented_at" is not null)
);
--> statement-breakpoint
ALTER TABLE "question_reviews" ADD CONSTRAINT "question_reviews_revision_id_question_revisions_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."question_revisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_reviews" ADD CONSTRAINT "question_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_submissions" ADD CONSTRAINT "tool_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_review_unique" ON "question_reviews" USING btree ("revision_id","reviewer_id");--> statement-breakpoint
CREATE INDEX "tool_submissions_tool_created_idx" ON "tool_submissions" USING btree ("tool","created_at");