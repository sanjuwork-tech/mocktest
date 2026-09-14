import { ownerConnection } from "./db-env.mjs";
import { hashPassword, normalizeEmail } from "../src/server/security.ts";
const email = process.env.ADMIN_BOOTSTRAP_EMAIL,
  password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!email || !password)
  throw new Error(
    "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD for the account being reset.",
  );
const hash = await hashPassword(password);
const sql = ownerConnection();
try {
  await sql.begin(async (tx) => {
    const [user] =
      await tx`update users set password_hash=${hash},updated_at=now() where email=${normalizeEmail(email)} and role in ('admin','reviewer','editor') returning id`;
    if (!user) throw new Error("Staff account not found.");
    await tx`update sessions set revoked_at=now() where user_id=${user.id} and revoked_at is null`;
    await tx`insert into audit_log (action,entity_type,entity_id) values ('password.reset_by_operator','user',${user.id})`;
  });
  console.log("Password reset; all previous sessions revoked.");
} finally {
  await sql.end();
}
