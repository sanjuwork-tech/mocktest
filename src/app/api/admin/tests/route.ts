import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/server/auth";
import { apiError, ApiError, json, readJson, requireOrigin } from "@/server/http";
import { requireDb } from "@/db/client";
import {
  testsTable,
  productsTable,
  testVersionsTable,
  testSectionsTable,
  auditLogTable,
} from "@/db/schema";
import { getBlueprint } from "@/lib/blueprints/definitions";

export const runtime = "nodejs";

const createTestSchema = z.object({
  productId: z.string().uuid(),
  title: z.string().min(3).max(200),
  blueprintId: z.string().min(1),
});

export async function GET(request: Request) {
  try {
    requireOrigin(request);
    await requireAdmin(["editor", "reviewer", "admin"]);

    const db = requireDb();

    // Fetch tests with product info
    const tests = await db
      .select({
        id: testsTable.id,
        productId: testsTable.productId,
        title: testsTable.title,
        durationMinutes: testsTable.durationMinutes,
        totalMarks: testsTable.totalMarks,
        published: testsTable.published,
        createdAt: testsTable.createdAt,
        productTitle: productsTable.title,
        productSlug: productsTable.slug,
        exam: productsTable.exam,
      })
      .from(testsTable)
      .innerJoin(productsTable, eq(testsTable.productId, productsTable.id))
      .orderBy(desc(testsTable.createdAt));

    // Fetch published version counts for each test
    const versions = await db
      .select({
        id: testVersionsTable.id,
        testId: testVersionsTable.testId,
        version: testVersionsTable.version,
        publishedAt: testVersionsTable.publishedAt,
      })
      .from(testVersionsTable);

    const versionsByTest = new Map<string, typeof versions>();
    for (const v of versions) {
      const list = versionsByTest.get(v.testId) || [];
      list.push(v);
      versionsByTest.set(v.testId, list);
    }

    const enriched = tests.map((t) => {
      const vList = versionsByTest.get(t.id) || [];
      const publishedVersions = vList.filter((v) => v.publishedAt !== null);
      const latestVersion = vList.sort((a, b) => b.version - a.version)[0];
      return {
        ...t,
        versionsCount: vList.length,
        publishedVersionsCount: publishedVersions.length,
        latestVersion: latestVersion ? latestVersion.version : 0,
        isLatestPublished: latestVersion ? latestVersion.publishedAt !== null : false,
      };
    });

    return json({ tests: enriched });
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(request: Request) {
  try {
    requireOrigin(request);
    const admin = await requireAdmin(["editor", "reviewer", "admin"]);

    const body = await readJson(request, 32 * 1024);
    const parsed = createTestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, "Invalid test creation payload.");
    }

    const blueprint = getBlueprint(parsed.data.blueprintId);
    if (!blueprint) {
      throw new ApiError(400, `Unknown blueprint ID: ${parsed.data.blueprintId}`);
    }

    const db = requireDb();

    // Verify product exists
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, parsed.data.productId));

    if (!product) {
      throw new ApiError(404, "Target product not found.");
    }

    // Create test, draft test_version, and sections in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Insert test
      const [test] = await tx
        .insert(testsTable)
        .values({
          productId: product.id,
          title: parsed.data.title,
          durationMinutes: blueprint.durationMinutes,
          totalMarks: blueprint.totalMarks,
          published: false,
        })
        .returning();

      // 2. Insert draft test_version 1
      const [version] = await tx
        .insert(testVersionsTable)
        .values({
          testId: test.id,
          version: 1,
          title: test.title,
          durationSeconds: blueprint.durationMinutes * 60,
          rules: {
            blueprintId: blueprint.id,
            navigation: blueprint.navigation,
            allowBacktracking: blueprint.allowBacktracking,
            scoringPolicy: blueprint.scoringPolicy,
          },
          publishedAt: null, // draft
        })
        .returning();

      // 3. Create sections according to blueprint
      const sectionValues = blueprint.sections.map((sec, idx) => ({
        testVersionId: version.id,
        subject: sec.subject,
        position: idx,
        rules: {
          id: sec.id,
          name: sec.name,
          required: sec.required,
          questionCount: sec.questionCount,
          marksPerQuestion: sec.marksPerQuestion,
          penaltyPerQuestion: sec.penaltyPerQuestion,
          permittedAnswerTypes: sec.permittedAnswerTypes,
        },
      }));

      const createdSections = await tx
        .insert(testSectionsTable)
        .values(sectionValues)
        .returning();

      // 4. Audit
      await tx.insert(auditLogTable).values({
        actorId: admin.userId,
        action: "test.created",
        entityType: "test",
        entityId: test.id,
        details: {
          title: test.title,
          blueprintId: blueprint.id,
          versionId: version.id,
        },
      });

      return { test, version, sections: createdSections };
    });

    return json({
      ok: true,
      testId: result.test.id,
      versionId: result.version.id,
      title: result.test.title,
      sections: result.sections,
    });
  } catch (e) {
    return apiError(e);
  }
}
