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
        name: "TestDisha administrator",
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
      await tx
        .insert(productsTable)
        .values({
          slug: p.slug,
          exam: p.shortName,
          title: p.title,
          description: p.description,
          priceMinor: rupeesToMinor(p.price),
          compareAtPriceMinor: rupeesToMinor(p.compareAtPrice),
          mockCount: p.mocks,
          published: true,
          featured: false,
          priceStatus: "proposed",
          salesEnabled: false,
          details: {
            subtitle: p.subtitle,
            pattern: p.pattern,
            features: p.features,
            color: p.color,
            accent: p.accent,
          },
        })
        .onConflictDoNothing({ target: productsTable.slug });
    }
  });
  console.log(
    "Seed completed without replacing existing accounts or products.",
  );
} finally {
  await sql.end();
}
