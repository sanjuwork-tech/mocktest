import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  exam: text("exam").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  compareAtPrice: integer("compare_at_price").notNull(),
  mockCount: integer("mock_count").notNull(),
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ordersTable = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  productSlug: text("product_slug").notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const testsTable = pgTable("tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id").references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  totalMarks: integer("total_marks").notNull(),
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  testId: uuid("test_id").references(() => testsTable.id, { onDelete: "cascade" }).notNull(),
  subject: text("subject").notNull(),
  prompt: text("prompt").notNull(),
  optionsJson: text("options_json").notNull(),
  correctOption: integer("correct_option").notNull(),
  explanation: text("explanation").notNull(),
  marks: integer("marks").default(4).notNull(),
  negativeMarks: integer("negative_marks").default(1).notNull(),
});
