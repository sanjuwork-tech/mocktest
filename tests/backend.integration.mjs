import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";
import postgres from "postgres";
nextEnv.loadEnvConfig(process.cwd());
const origin = process.env.TEST_ORIGIN ?? "http://127.0.0.1:3000";
if (
  !["localhost", "127.0.0.1"].includes(
    new URL(process.env.DATABASE_MIGRATION_URL).hostname,
  ) ||
  !["localhost", "127.0.0.1"].includes(new URL(origin).hostname)
)
  throw new Error("Integration tests require local disposable infrastructure.");
const owner = postgres(process.env.DATABASE_MIGRATION_URL, { max: 1 });
const run = randomUUID().slice(0, 8),
  password = "TestDisha-integration-" + run + "!";
async function api(
  path,
  { method = "GET", body, cookie, customOrigin = origin } = {},
) {
  const r = await fetch(origin + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(method !== "GET" ? { Origin: customOrigin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
    headers: r.headers,
  };
}
let admin, editor, reviewer, editorId, reviewerId, productId;
test("Phase 1 HTTP and database integration", async (t) => {
  try {
    await t.test(
      "health, same-origin login and session are database-backed",
      async () => {
        assert.equal((await api("/api/health")).status, 200);
        assert.equal((await api("/api/admin/session")).status, 401);
        assert.equal(
          (
            await api("/api/admin/login", {
              method: "POST",
              body: {
                email: process.env.ADMIN_BOOTSTRAP_EMAIL,
                password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
              },
              customOrigin: "https://evil.example",
            })
          ).status,
          403,
        );
        const r = await api("/api/admin/login", {
          method: "POST",
          body: {
            email: process.env.ADMIN_BOOTSTRAP_EMAIL,
            password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
          },
        });
        assert.equal(r.status, 200, JSON.stringify(r.body));
        admin = r.cookie;
        assert.ok(admin.startsWith("testdisha_session="));
        assert.match(r.headers.get("set-cookie"), /HttpOnly/i);
        assert.equal(
          (await api("/api/admin/session", { cookie: admin })).body.user.role,
          "admin",
        );
      },
    );
    await t.test(
      "staff creation does not expose password hashes; editor cannot manage accounts",
      async () => {
        for (const role of ["editor", "reviewer"]) {
          const email = `phase1-${role}-${run}@example.test`;
          const r = await api("/api/admin/users", {
            method: "POST",
            cookie: admin,
            body: { name: `Integration ${role}`, email, password, role },
          });
          assert.equal(r.status, 201, JSON.stringify(r.body));
          assert.ok(!JSON.stringify(r.body).includes("passwordHash"));
          const login = await api("/api/admin/login", {
            method: "POST",
            body: { email, password },
          });
          assert.equal(login.status, 200, JSON.stringify(login.body));
          if (role === "editor") {
            editor = login.cookie;
            editorId = r.body.user.id;
          } else {
            reviewer = login.cookie;
            reviewerId = r.body.user.id;
          }
        }
        assert.equal(
          (await api("/api/admin/users", { cookie: editor })).status,
          403,
        );
      },
    );
    await t.test(
      "drafts stay private, editor cannot publish, reviewer can publish and prices use paise",
      async () => {
        const body = {
          slug: `phase1-${run}`,
          exam: "IAT",
          title: "Integration draft " + run,
          description:
            "Temporary integration fixture for role and catalog checks.",
          price: 9.99,
          compareAtPrice: 12.99,
          mockCount: 2,
          published: false,
          featured: false,
        };
        const r = await api("/api/products", {
          method: "POST",
          cookie: editor,
          body,
        });
        assert.equal(r.status, 201, JSON.stringify(r.body));
        productId = r.body.id;
        const [row] =
          await owner`select price,compare_at_price from products where id=${productId}`;
        assert.equal(row.price, 999);
        assert.equal(row.compare_at_price, 1299);
        assert.ok(
          !(await api("/api/products?includeDrafts=true")).body.products.some(
            (p) => p.id === productId,
          ),
        );
        assert.equal(
          (
            await api(`/api/products/${productId}`, {
              method: "PATCH",
              cookie: editor,
              body: { published: true },
            })
          ).status,
          403,
        );
        assert.equal(
          (
            await api(`/api/products/${productId}`, {
              method: "PATCH",
              cookie: reviewer,
              body: { published: true },
            })
          ).status,
          200,
        );
        const catalog = (await api("/api/products")).body.products;
        assert.equal(catalog.find((p) => p.id === productId).price, 9.99);
        assert.ok(!JSON.stringify(catalog).includes("password_hash"));
        assert.equal(
          (
            await api(`/api/products/${productId}`, {
              method: "PATCH",
              cookie: editor,
              body: { title: "Forbidden published edit" },
            })
          ).status,
          403,
        );
        const home = await (await fetch(origin)).text();
        const prep = await (await fetch(origin + "/test-series")).text();
        assert.ok(home.includes("Your dream deserves"));
        assert.ok(prep.includes("Your dream is specific."));
        assert.ok(!home.includes(body.title));
        assert.ok(!prep.includes(body.title));
        assert.equal(
          (
            await api("/api/orders", {
              method: "POST",
              body: { productSlug: body.slug },
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      "session revocation and logout invalidate saved cookies server-side",
      async () => {
        const revoked = await api(`/api/admin/users/${editorId}`, {
          method: "PATCH",
          cookie: admin,
          body: { revokeSessions: true },
        });
        assert.equal(revoked.status, 200);
        assert.equal(
          (await api("/api/admin/session", { cookie: editor })).status,
          401,
        );
        assert.equal(
          (await api("/api/admin/logout", { method: "POST", cookie: reviewer }))
            .status,
          200,
        );
        assert.equal(
          (await api("/api/admin/session", { cookie: reviewer })).status,
          401,
        );
      },
    );
    await t.test(
      "server expiry and throttling cannot be bypassed with an old cookie",
      async () => {
        const email = `phase1-reviewer-${run}@example.test`;
        const r = await api("/api/admin/login", {
          method: "POST",
          body: { email, password },
        });
        assert.equal(r.status, 200);
        const s = await api("/api/admin/session", { cookie: r.cookie });
        await owner`update sessions set created_at=now()-interval '2 hours',expires_at=now()-interval '1 hour' where id=${s.body.user.sessionId}`;
        assert.equal(
          (await api("/api/admin/session", { cookie: r.cookie })).status,
          401,
        );
        for (let i = 0; i < 5; i++)
          assert.equal(
            (
              await api("/api/admin/login", {
                method: "POST",
                body: {
                  email: `unknown-${run}@example.test`,
                  password: "incorrect-password",
                },
              })
            ).status,
            401,
          );
        assert.equal(
          (
            await api("/api/admin/login", {
              method: "POST",
              body: {
                email: `unknown-${run}@example.test`,
                password: "incorrect-password",
              },
            })
          ).status,
          429,
        );
      },
    );
    await t.test(
      "database runtime cannot read answer keys, payments or edit audit records",
      async () => {
        const runtime = postgres(process.env.DATABASE_URL, { max: 1 });
        try {
          for (const table of [
            "private_answer_keys",
            "orders",
            "attempt_answers",
          ])
            await assert.rejects(
              runtime.unsafe(`select * from ${table}`),
              (e) => e.code === "42501",
            );
          await assert.rejects(
            runtime`delete from audit_log where false`,
            (e) => e.code === "42501",
          );
        } finally {
          await runtime.end();
        }
      },
    );
    await t.test(
      "sensitive endpoints are uncached and audit history records content changes",
      async () => {
        const audit = await api("/api/admin/audit", { cookie: admin });
        assert.equal(audit.status, 200);
        assert.match(audit.headers.get("cache-control"), /no-store/);
        assert.ok(audit.body.events.some((e) => e.entityId === productId));
        assert.equal(
          (await api("/api/admin/audit", { cookie: editor })).status,
          401,
        );
      },
    );
  } finally {
    if (admin) {
      if (productId)
        await api(`/api/products/${productId}`, {
          method: "DELETE",
          cookie: admin,
        });
      for (const id of [editorId, reviewerId].filter(Boolean))
        await api(`/api/admin/users/${id}`, {
          method: "PATCH",
          cookie: admin,
          body: { active: false },
        });
      await api("/api/admin/logout", { method: "POST", cookie: admin });
    }
    if (productId) await owner`delete from products where id=${productId}`;
    for (const id of [editorId, reviewerId].filter(Boolean))
      await owner`delete from users where id=${id}`;
    await owner.end();
  }
});
