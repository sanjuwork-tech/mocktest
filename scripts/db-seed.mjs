import { drizzle } from "drizzle-orm/postgres-js";
import { ownerConnection } from "./db-env.mjs";
import {
  usersTable,
  productsTable,
  examsTable,
  auditLogTable,
} from "../src/db/schema.ts";
import { products } from "../src/data/catalog.ts";
import {
  hashPassword,
  normalizeEmail,
  rupeesToMinor,
} from "../src/server/security.ts";
const sql = ownerConnection();
try {
  const db = drizzle(sql);
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!email || !password)
    throw new Error(
      "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD locally before seeding.",
    );
  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    const [admin] = await tx
      .insert(usersTable)
      .values({
        email: normalizeEmail(email),
        name: "OurMocks administrator",
        role: "admin",
        passwordHash,
      })
      .onConflictDoNothing({ target: usersTable.email })
      .returning();
    if (admin)
      await tx.insert(auditLogTable).values({
        actorId: admin.id,
        action: "admin.bootstrapped",
        entityType: "user",
        entityId: admin.id,
      });
    for (const p of products) {
      await tx
        .insert(examsTable)
        .values({ slug: p.slug, title: p.shortName })
        .onConflictDoNothing();
      // catalog.ts is the source of truth while payments are off: new products are inserted and
      // existing ones are brought back in line with it. Publishing and sales flags are left as they are.
      const catalogFields = {
        exam: p.shortName,
        title: p.title,
        description: p.description,
        priceMinor: rupeesToMinor(p.price),
        // Single packs have no compare-at price; the database requires one >= price.
        compareAtPriceMinor: rupeesToMinor(p.compareAtPrice ?? p.price),
        mockCount: p.mocks,
        details: {
          subtitle: p.subtitle,
          pattern: p.pattern,
          features: p.features,
          color: p.color,
          accent: p.accent,
        },
      };
      await tx
        .insert(productsTable)
        .values({
          slug: p.slug,
          ...catalogFields,
          published: true,
          featured: false,
          priceStatus: "proposed",
          salesEnabled: false,
        })
        .onConflictDoUpdate({
          target: productsTable.slug,
          set: { ...catalogFields, updatedAt: new Date() },
        });
    }
  });
  console.log(
    "Seed completed: accounts left as they were; products inserted or updated from src/data/catalog.ts.",
  );
} finally {
  await sql.end();
}
