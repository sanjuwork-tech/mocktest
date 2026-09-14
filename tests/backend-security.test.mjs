import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  newSessionToken,
  tokenHash,
  normalizeEmail,
  canPublish,
  isStaff,
  allowedOrigin,
  rupeesToMinor,
} from "../src/server/security.ts";
test("password hashes are salted, correct passwords verify and wrong inputs fail", async () => {
  const password = "PhaseOne-test-password-42!";
  const one = await hashPassword(password),
    two = await hashPassword(password);
  assert.notEqual(one, two);
  assert.ok(!one.includes(password));
  assert.equal(await verifyPassword(password, one), true);
  assert.equal(await verifyPassword("incorrect", one), false);
  assert.equal(await verifyPassword(password, "unrecognised:hash"), false);
  await assert.rejects(() => hashPassword("short"));
});
test("sessions use unpredictable tokens and only hashes are stored", () => {
  const values = Array.from({ length: 100 }, () => newSessionToken());
  assert.equal(new Set(values).size, 100);
  for (const token of values) {
    assert.match(token, /^[\w-]{43}$/);
    assert.match(tokenHash(token), /^[a-f0-9]{64}$/);
    assert.notEqual(tokenHash(token), token);
  }
});
test("staff roles and publication permissions are explicit", () => {
  assert.ok(isStaff("editor"));
  assert.ok(!isStaff("student"));
  assert.ok(!canPublish("editor"));
  assert.ok(canPublish("reviewer"));
  assert.ok(canPublish("admin"));
  assert.ok(!canPublish("unknown"));
});
test("origin validation rejects missing and lookalike hosts", () => {
  const old = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "https://app.testdisha.example";
  try {
    assert.ok(allowedOrigin("https://app.testdisha.example"));
    assert.ok(!allowedOrigin(null));
    assert.ok(!allowedOrigin("https://app.testdisha.example.evil.test"));
    assert.ok(!allowedOrigin("null"));
  } finally {
    if (old === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = old;
  }
});
test("money is represented as paise with exact bounded conversion", () => {
  assert.equal(rupeesToMinor(1499), 149900);
  assert.equal(rupeesToMinor(9.99), 999);
  assert.equal(rupeesToMinor(0), 0);
  for (const n of [-1, Infinity, NaN, 1.001, 1000001])
    assert.throws(() => rupeesToMinor(n));
  assert.equal(normalizeEmail(" ADMIN@Example.COM "), "admin@example.com");
});
