CREATE TABLE "attempt_question_stats" (
	"attempt_id" uuid NOT NULL,
	"assignment_id" uuid NOT NULL,
	"time_ms" integer DEFAULT 0 NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"first_value" text,
	"changes" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attempt_question_stats_attempt_id_assignment_id_pk" PRIMARY KEY("attempt_id","assignment_id"),
	CONSTRAINT "question_stats_nonnegative" CHECK ("attempt_question_stats"."time_ms">=0 and "attempt_question_stats"."visits">=0 and "attempt_question_stats"."changes">=0)
);
--> statement-breakpoint
ALTER TABLE "question_revisions" ADD COLUMN "difficulty" text;--> statement-breakpoint
ALTER TABLE "attempt_question_stats" ADD CONSTRAINT "attempt_question_stats_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_question_stats" ADD CONSTRAINT "attempt_question_stats_assignment_id_test_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."test_assignments"("id") ON DELETE no action ON UPDATE no action;