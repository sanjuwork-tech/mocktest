import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  uniqueIndex,
  index,
  check,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";

export const productsTable = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    exam: text("exam").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceMinor: integer("price").notNull(),
    compareAtPriceMinor: integer("compare_at_price").notNull(),
    mockCount: integer("mock_count").notNull(),
    published: boolean("published").default(false).notNull(),
    featured: boolean("featured").default(false).notNull(),
    currency: text("currency").default("INR").notNull(),
    priceStatus: text("price_status").default("proposed").notNull(),
    salesEnabled: boolean("sales_enabled").default(false).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "product_money_valid",
      sql`${t.priceMinor}>=0 and ${t.compareAtPriceMinor}>=${t.priceMinor} and ${t.currency}='INR'`,
    ),
    check("product_sales_gate", sql`${t.salesEnabled}=false`),
    check("product_mock_count_valid", sql`${t.mockCount}>=0`),
    check(
      "product_price_status_valid",
      sql`${t.priceStatus} in ('proposed','confirmed')`,
    ),
  ],
);

export const ordersTable = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerName: text("customer_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    productSlug: text("product_slug").notNull(),
    amountMinor: integer("amount").notNull(),
    paymentStatus: text("payment_status").default("pending").notNull(),
    paymentReference: text("payment_reference"),
    currency: text("currency").default("INR").notNull(),
    userId: uuid("user_id").references(() => usersTable.id),
    productId: uuid("product_id").references(() => productsTable.id),
    idempotencyKey: text("idempotency_key").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    check(
      "order_money_valid",
      sql`${t.amountMinor}>=0 and ${t.currency}='INR'`,
    ),
  ],
);

export const testsTable = pgTable("tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => productsTable.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  totalMarks: integer("total_marks").notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  testId: uuid("test_id")
    .references(() => testsTable.id, { onDelete: "cascade" })
    .notNull(),
  subject: text("subject").notNull(),
  prompt: text("prompt").notNull(),
  optionsJson: text("options_json").notNull(),
  correctOption: integer("correct_option").notNull(),
  explanation: text("explanation").notNull(),
  marks: integer("marks").default(4).notNull(),
  negativeMarks: integer("negative_marks").default(1).notNull(),
});

// Phase 1 foundation. Legacy tests/questions remain intact until a reviewed import.
const created = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const instant = (name: string) => timestamp(name, { withTimezone: true });
export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    passwordHash: text("password_hash"),
    provider: text("provider").default("credentials").notNull(),
    providerId: text("provider_id"),
    avatarUrl: text("avatar_url"),
    role: text("role")
      .$type<"student" | "editor" | "reviewer" | "admin">()
      .default("student")
      .notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: created(),
    updatedAt: instant("updated_at").defaultNow().notNull(),
  },
  (t) => [
    check("users_email_normalized", sql`${t.email} = lower(trim(${t.email}))`),
    check(
      "users_role_valid",
      sql`${t.role} in ('student','editor','reviewer','admin')`,
    ),
  ],
);
export const sessionsTable = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => usersTable.id, { onDelete: "cascade" })
      .notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    createdAt: created(),
    expiresAt: instant("expires_at").notNull(),
    revokedAt: instant("revoked_at"),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_expiry_idx").on(t.expiresAt),
    check("sessions_valid_expiry", sql`${t.expiresAt}>${t.createdAt}`),
  ],
);
export const authRateLimitsTable = pgTable(
  "auth_rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull(),
    resetAt: instant("reset_at").notNull(),
  },
  (t) => [index("auth_rate_limits_reset_idx").on(t.resetAt)],
);
export const auditLogTable = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    createdAt: created(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);
export const examsTable = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  createdAt: created(),
});
export const examCyclesTable = pgTable(
  "exam_cycles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .references(() => examsTable.id)
      .notNull(),
    year: integer("year").notNull(),
    officialUrl: text("official_url"),
    reviewedAt: instant("reviewed_at"),
    blueprint: jsonb("blueprint").default({}).notNull(),
    published: boolean("published").default(false).notNull(),
    createdAt: created(),
  },
  (t) => [
    uniqueIndex("exam_cycle_unique").on(t.examId, t.year),
    check("exam_cycle_year_valid", sql`${t.year} between 2000 and 2200`),
  ],
);
export const assetsTable = pgTable(
  "assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageKey: text("storage_key").notNull().unique(),
    mimeType: text("mime_type").notNull(),
    bytes: integer("bytes").notNull(),
    sha256: text("sha256").notNull(),
    alt: text("alt").notNull(),
    visibility: text("visibility").default("private").notNull(),
    createdBy: uuid("created_by")
      .references(() => usersTable.id)
      .notNull(),
    createdAt: created(),
  },
  (t) => [
    check("assets_size_valid", sql`${t.bytes}>0`),
    check(
      "assets_visibility_valid",
      sql`${t.visibility} in ('private','public')`,
    ),
  ],
);
export const importsTable = pgTable(
  "question_imports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bundleId: text("bundle_id").notNull(),
    schemaVersion: text("schema_version").notNull(),
    checksum: text("checksum").notNull().unique(),
    status: text("status").default("draft").notNull(),
    payloadAssetId: uuid("payload_asset_id").references(() => assetsTable.id),
    createdBy: uuid("created_by")
      .references(() => usersTable.id)
      .notNull(),
    createdAt: created(),
  },
  (t) => [
    check(
      "imports_status_valid",
      sql`${t.status} in ('draft','validated','committed','rejected')`,
    ),
  ],
);
export const questionBankTable = pgTable("question_bank", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: text("external_id").notNull().unique(),
  createdAt: created(),
});
export const questionRevisionsTable = pgTable(
  "question_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .references(() => questionBankTable.id)
      .notNull(),
    revision: integer("revision").notNull(),
    type: text("type").notNull(),
    subject: text("subject").notNull(),
    topics: jsonb("topics").$type<string[]>().notNull(),
    content: jsonb("content").notNull(),
    status: text("status").default("draft").notNull(),
    source: jsonb("source").notNull(),
    createdBy: uuid("created_by")
      .references(() => usersTable.id)
      .notNull(),
    reviewedBy: uuid("reviewed_by").references(() => usersTable.id),
    createdAt: created(),
  },
  (t) => [
    uniqueIndex("question_revision_unique").on(t.questionId, t.revision),
    check("question_revision_positive", sql`${t.revision}>0`),
    check(
      "question_revision_status_valid",
      sql`${t.status} in ('draft','in_review','approved','retired')`,
    ),
  ],
);
export const questionOptionsTable = pgTable(
  "question_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    revisionId: uuid("revision_id")
      .references(() => questionRevisionsTable.id)
      .notNull(),
    optionKey: text("option_key").notNull(),
    position: integer("position").notNull(),
    content: jsonb("content").notNull(),
  },
  (t) => [
    uniqueIndex("question_option_key_unique").on(t.revisionId, t.optionKey),
    uniqueIndex("question_option_position_unique").on(t.revisionId, t.position),
    check("question_option_position_valid", sql`${t.position}>=0`),
  ],
);
export const answerKeysTable = pgTable("private_answer_keys", {
  revisionId: uuid("revision_id")
    .references(() => questionRevisionsTable.id)
    .primaryKey(),
  answer: jsonb("answer").notNull(),
  explanation: jsonb("explanation").notNull(),
});
export const importItemsTable = pgTable(
  "question_import_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    importId: uuid("import_id")
      .references(() => importsTable.id)
      .notNull(),
    externalId: text("external_id").notNull(),
    revisionId: uuid("revision_id").references(() => questionRevisionsTable.id),
    errors: jsonb("errors").default([]).notNull(),
  },
  (t) => [uniqueIndex("import_item_unique").on(t.importId, t.externalId)],
);
export const testVersionsTable = pgTable(
  "test_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id")
      .references(() => testsTable.id)
      .notNull(),
    version: integer("version").notNull(),
    examCycleId: uuid("exam_cycle_id").references(() => examCyclesTable.id),
    title: text("title").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    rules: jsonb("rules").notNull(),
    publishedAt: instant("published_at"),
    createdAt: created(),
  },
  (t) => [
    uniqueIndex("test_version_unique").on(t.testId, t.version),
    check("test_version_positive", sql`${t.version}>0`),
    check("test_duration_positive", sql`${t.durationSeconds}>0`),
  ],
);
export const testSectionsTable = pgTable(
  "test_sections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testVersionId: uuid("test_version_id")
      .references(() => testVersionsTable.id)
      .notNull(),
    subject: text("subject").notNull(),
    position: integer("position").notNull(),
    rules: jsonb("rules").default({}).notNull(),
  },
  (t) => [
    uniqueIndex("test_section_position_unique").on(t.testVersionId, t.position),
    uniqueIndex("test_section_version_unique").on(t.id, t.testVersionId),
  ],
);
export const testAssignmentsTable = pgTable(
  "test_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testVersionId: uuid("test_version_id")
      .references(() => testVersionsTable.id)
      .notNull(),
    sectionId: uuid("section_id").notNull(),
    revisionId: uuid("revision_id")
      .references(() => questionRevisionsTable.id)
      .notNull(),
    position: integer("position").notNull(),
    marks: integer("marks").notNull(),
    penalty: integer("penalty").default(0).notNull(),
  },
  (t) => [
    uniqueIndex("test_assignment_position_unique").on(t.sectionId, t.position),
    uniqueIndex("test_assignment_question_unique").on(
      t.testVersionId,
      t.revisionId,
    ),
    uniqueIndex("test_assignment_version_unique").on(t.id, t.testVersionId),
    foreignKey({
      columns: [t.sectionId, t.testVersionId],
      foreignColumns: [testSectionsTable.id, testSectionsTable.testVersionId],
    }),
    check("test_assignment_marks_valid", sql`${t.marks}>0 and ${t.penalty}>=0`),
  ],
);
export const attemptsTable = pgTable(
  "attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => usersTable.id)
      .notNull(),
    testVersionId: uuid("test_version_id")
      .references(() => testVersionsTable.id)
      .notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    status: text("status").default("in_progress").notNull(),
    startedAt: instant("started_at").defaultNow().notNull(),
    deadline: instant("deadline").notNull(),
    submittedAt: instant("submitted_at"),
    ordering: jsonb("ordering").notNull(),
  },
  (t) => [
    index("attempt_user_idx").on(t.userId),
    uniqueIndex("attempt_version_unique").on(t.id, t.testVersionId),
    check(
      "attempt_status_valid",
      sql`${t.status} in ('in_progress','submitted','timed_out')`,
    ),
    check("attempt_deadline_valid", sql`${t.deadline}>${t.startedAt}`),
  ],
);
export const attemptAnswersTable = pgTable(
  "attempt_answers",
  {
    attemptId: uuid("attempt_id").notNull(),
    assignmentId: uuid("assignment_id").notNull(),
    testVersionId: uuid("test_version_id").notNull(),
    value: jsonb("value").notNull(),
    sequence: integer("sequence").notNull(),
    marked: boolean("marked").default(false).notNull(),
    updatedAt: instant("updated_at").defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.attemptId, t.assignmentId] }),
    foreignKey({
      columns: [t.attemptId, t.testVersionId],
      foreignColumns: [attemptsTable.id, attemptsTable.testVersionId],
    }),
    foreignKey({
      columns: [t.assignmentId, t.testVersionId],
      foreignColumns: [
        testAssignmentsTable.id,
        testAssignmentsTable.testVersionId,
      ],
    }),
    check("answer_sequence_positive", sql`${t.sequence}>0`),
  ],
);
export const attemptResultsTable = pgTable(
  "attempt_results",
  {
    attemptId: uuid("attempt_id")
      .references(() => attemptsTable.id)
      .primaryKey(),
    score: integer("score").notNull(),
    maxScore: integer("max_score").notNull(),
    scoringVersion: text("scoring_version").notNull(),
    breakdown: jsonb("breakdown").notNull(),
    answerSnapshot: jsonb("answer_snapshot").notNull(),
    reflections: jsonb("reflections")
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    createdAt: created(),
  },
  (t) => [
    check(
      "result_score_bounds",
      sql`${t.maxScore}>0 and ${t.score}<=${t.maxScore}`,
    ),
  ],
);
export const paymentEventsTable = pgTable(
  "payment_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    orderId: uuid("order_id").references(() => ordersTable.id),
    status: text("status").notNull(),
    payloadHash: text("payload_hash").notNull(),
    processedAt: instant("processed_at"),
    createdAt: created(),
  },
  (t) => [uniqueIndex("payment_event_unique").on(t.provider, t.eventId)],
);
export const entitlementsTable = pgTable(
  "entitlements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => usersTable.id)
      .notNull(),
    productId: uuid("product_id")
      .references(() => productsTable.id)
      .notNull(),
    orderId: uuid("order_id").references(() => ordersTable.id),
    source: text("source").notNull(),
    startsAt: instant("starts_at").defaultNow().notNull(),
    expiresAt: instant("expires_at"),
    revokedAt: instant("revoked_at"),
    createdAt: created(),
  },
  (t) => [
    index("entitlement_user_product_idx").on(t.userId, t.productId),
    uniqueIndex("entitlement_order_unique").on(t.orderId),
    check(
      "entitlement_source_valid",
      sql`${t.source} in ('trial','admin','payment')`,
    ),
    check(
      "entitlement_dates_valid",
      sql`${t.expiresAt} is null or ${t.expiresAt}>${t.startsAt}`,
    ),
  ],
);
